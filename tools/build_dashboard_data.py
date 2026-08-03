from __future__ import annotations

import argparse
import hashlib
import json
import re
from dataclasses import dataclass
from datetime import date, datetime, timedelta, timezone
from pathlib import Path
from typing import Any


SCORE_RE = re.compile(r"(?P<score>[0-5](?:\.\d+)?)\s*/\s*5")
DATE_RE = re.compile(r"(?P<date>20\d{2}-\d{2}-\d{2})(?:[_\s](?P<hour>\d{2})[-:](?P<minute>\d{2}))?")
URL_RE = re.compile(r"https?://[^\s)>\]]+")
MARKDOWN_LINK_RE = re.compile(r"\[([^\]]+)\]\((https?://[^)]+)\)")
OPPORTUNITY_HEADING_RE = re.compile(r"^###\s+(?P<title>.+)$")

METRIC_KEYS = [
    ("客户明确", "customer"),
    ("7天Demo", "demo"),
    ("30天收费", "revenue"),
    ("复用资产", "reusable"),
    ("长期壁垒", "moat"),
]


@dataclass
class Report:
    path: Path
    report_id: str
    date: str
    sort_key: datetime
    title: str
    model: str
    raw: str
    opportunities: list[dict[str, Any]]
    links: list[dict[str, str]]


def clean_markdown(value: str) -> str:
    value = re.sub(r"[*_`]+", "", value)
    value = re.sub(r"^[★⭐🔥\s]+", "", value)
    value = re.sub(r"\s+", " ", value)
    return value.strip()


def slugify(value: str) -> str:
    text = value.lower()
    text = re.sub(r"[（(]\s*[0-5](?:\.\d+)?\s*/\s*5\s*[）)]", "", text)
    text = re.sub(r"[^a-z0-9\u4e00-\u9fff]+", "-", text)
    return text.strip("-") or "opportunity"


def parse_report_datetime(path: Path, raw: str) -> tuple[str, datetime]:
    match = DATE_RE.search(path.stem)
    if not match:
        match = DATE_RE.search(raw[:400])
    if not match:
        fallback = datetime.fromtimestamp(path.stat().st_mtime)
        return fallback.strftime("%Y-%m-%d %H:%M"), fallback
    hour = int(match.group("hour") or 0)
    minute = int(match.group("minute") or 0)
    parsed = datetime.strptime(match.group("date"), "%Y-%m-%d").replace(hour=hour, minute=minute)
    return parsed.strftime("%Y-%m-%d %H:%M"), parsed


def extract_model(raw: str) -> str:
    match = re.search(r"模型\s*[:：]\s*([^|\n]+)", raw)
    return clean_markdown(match.group(1)) if match else "未记录"


def extract_title(raw: str) -> str:
    for line in raw.splitlines():
        if line.startswith("# "):
            return clean_markdown(line[2:])
    return "AI 夜巡"


def extract_links(raw: str) -> list[dict[str, str]]:
    links: list[dict[str, str]] = []
    seen: set[str] = set()
    for label, url in MARKDOWN_LINK_RE.findall(raw):
        if url in seen:
            continue
        seen.add(url)
        links.append({"label": clean_markdown(label), "url": url})
    for url in URL_RE.findall(raw):
        url = url.rstrip(".,;，。；")
        if url in seen:
            continue
        seen.add(url)
        links.append({"label": url.split("/")[2], "url": url})
    return links


def section_between(raw: str, start_terms: tuple[str, ...], end_terms: tuple[str, ...]) -> str:
    lines = raw.splitlines()
    start = 0
    for index, line in enumerate(lines):
        if line.startswith("## ") and any(term in line for term in start_terms):
            start = index + 1
            break
    end = len(lines)
    for index in range(start, len(lines)):
        line = lines[index]
        if line.startswith("## ") and any(term in line for term in end_terms):
            end = index
            break
    return "\n".join(lines[start:end])


def metric_value(line: str) -> str:
    if "✅" in line:
        return "yes"
    if "❌" in line:
        return "no"
    return "warn"


def parse_heading_opportunities(raw: str) -> list[dict[str, Any]]:
    radar = section_between(
        raw,
        ("选题雷达", "重点选题", "核心发现"),
        ("原始速览", "洞察", "本周推荐", "趋势判断"),
    )
    lines = radar.splitlines()
    starts = [index for index, line in enumerate(lines) if OPPORTUNITY_HEADING_RE.match(line)]
    opportunities: list[dict[str, Any]] = []
    for position, start in enumerate(starts):
        end = starts[position + 1] if position + 1 < len(starts) else len(lines)
        heading = OPPORTUNITY_HEADING_RE.match(lines[start])
        if not heading:
            continue
        heading_text = heading.group("title")
        score_match = SCORE_RE.search(heading_text)
        if not score_match:
            score_from_stars = min(5, len(re.findall(r"[★⭐]", heading_text)))
            if not score_from_stars:
                continue
            score = float(score_from_stars)
        else:
            score = float(score_match.group("score"))

        title = clean_markdown(SCORE_RE.sub("", heading_text))
        title = re.sub(r"[（(]\s*[）)]", "", title).strip(" -—")
        if re.search(r"GitHub\s+(Weekly|Monthly)\s+Top", title, re.IGNORECASE):
            continue

        block = lines[start + 1 : end]
        signal = ""
        action = ""
        metrics: dict[str, str] = {key: "warn" for _, key in METRIC_KEYS}
        for line in block:
            clean = clean_markdown(line.lstrip("- "))
            if not clean:
                continue
            if clean.startswith(("信号:", "信号：")):
                signal = clean.split(":", 1)[-1] if ":" in clean else clean.split("：", 1)[-1]
            if clean.startswith(("行动:", "行动：", "判断:", "判断：")):
                action = re.split(r"[:：]", clean, maxsplit=1)[-1].strip()
            for label, key in METRIC_KEYS:
                if label in line:
                    metrics[key] = metric_value(line)

        opportunities.append(
            {
                "id": slugify(title),
                "title": title,
                "score": score,
                "signal": signal or "报告未提供独立信号摘要。",
                "action": action or "先补来源与客户证据，再决定是否进入 Demo。",
                "metrics": metrics,
            }
        )
    return opportunities


def load_json(path: Path) -> dict[str, Any]:
    return json.loads(path.read_text(encoding="utf-8"))


def topic_matches(text: str, topic: dict[str, Any]) -> bool:
    lowered = text.lower()
    return any(alias.lower() in lowered for alias in topic["aliases"])


def match_topic(title: str, signal: str, topics: list[dict[str, Any]]) -> dict[str, Any] | None:
    haystack = f"{title}\n{signal}"
    matches = [topic for topic in topics if topic_matches(haystack, topic)]
    if not matches:
        return None
    return max(matches, key=lambda topic: max(len(alias) for alias in topic["aliases"] if alias.lower() in haystack.lower()))


def source_statuses(raw: str) -> list[dict[str, str]]:
    lowered = raw.lower()
    definitions = [
        ("GitHub", "github"),
        ("36氪", "36氪"),
        ("HN", "hn"),
        ("ProductHunt", "producthunt"),
    ]
    statuses = []
    for label, token in definitions:
        if token not in lowered:
            status = "未记录"
        elif token == "producthunt" and any(word in lowered for word in ("403", "cloudflare", "挡")):
            status = "受限"
        else:
            status = "已采集"
        statuses.append({"name": label, "status": status})
    return statuses


def paid_evidence_label(value: str) -> str:
    return {
        "none": "无付费证据",
        "indirect": "间接付费信号",
        "direct-market": "平台交易证据",
    }.get(value, "未评估")


def confidence_for(topic: dict[str, Any] | None, recurrence: int) -> str:
    if not topic:
        return "low"
    primary = sum(1 for item in topic.get("evidence", []) if item.get("type") == "primary")
    paid = topic.get("paid_evidence")
    if paid == "direct-market" and recurrence >= 2:
        return "high"
    if primary and recurrence >= 2:
        return "medium"
    return "low"


def decision_from_action(action: str) -> str | None:
    mappings = (
        ("进入构建", "build"),
        ("继续验证", "validate"),
        ("暂缓", "hold"),
        ("否决", "reject"),
        ("观察", "observe"),
        ("渠道实验", "channel"),
        ("待研究", "research"),
    )
    return next((decision for label, decision in mappings if label in action), None)


def parse_report(path: Path) -> Report:
    raw = path.read_text(encoding="utf-8", errors="replace")
    date, sort_key = parse_report_datetime(path, raw)
    return Report(
        path=path,
        report_id=path.stem,
        date=date,
        sort_key=sort_key,
        title=extract_title(raw),
        model=extract_model(raw),
        raw=raw,
        opportunities=parse_heading_opportunities(raw),
        links=extract_links(raw),
    )


def dedupe_reports(paths: list[Path]) -> list[Report]:
    reports: list[Report] = []
    seen: set[str] = set()
    for path in paths:
        report = parse_report(path)
        key = hashlib.sha256(report.raw.encode("utf-8")).hexdigest()
        if key in seen:
            continue
        seen.add(key)
        reports.append(report)
    return sorted(reports, key=lambda report: report.sort_key, reverse=True)


def recurrence_for(topic: dict[str, Any], reports: list[Report]) -> dict[str, Any]:
    matched = [report for report in reports if topic_matches(report.raw, topic)]
    return {
        "reports": len(matched),
        "window": len(reports),
        "ratio": round(len(matched) / len(reports), 3) if reports else 0,
        "first_seen": matched[-1].date if matched else None,
        "last_seen": matched[0].date if matched else None,
    }


def matching_profile_items(
    items: list[dict[str, Any]], topic_id: str, score_key: str
) -> list[dict[str, Any]]:
    matches = [item for item in items if topic_id in item.get("topic_ids", [])]
    for item in matches:
        value = item.get(score_key)
        if not isinstance(value, (int, float)) or not 0 <= value <= 5:
            raise ValueError(f"Profile value {score_key} must be between 0 and 5")
    return sorted(matches, key=lambda item: item[score_key], reverse=True)


def evidence_readiness_score(
    topic: dict[str, Any], confidence: str, recurrence: dict[str, Any]
) -> int:
    paid_scores = {
        "direct-market": 100,
        "indirect": 60,
        "none": 20,
    }
    confidence_scores = {"high": 100, "medium": 60, "low": 25}
    paid_score = paid_scores.get(topic.get("paid_evidence", "none"), 10)
    confidence_score = confidence_scores.get(confidence, 25)
    recurrence_score = min(100, recurrence.get("reports", 0) * 12)
    return round(
        paid_score * 0.55 + confidence_score * 0.25 + recurrence_score * 0.20
    )


def personal_fit_for(
    topic: dict[str, Any] | None,
    confidence: str,
    recurrence: dict[str, Any],
    profile: dict[str, Any],
) -> dict[str, Any]:
    if not topic:
        return {
            "score": 0,
            "decision": "hold",
            "dimensions": {
                "asset_reuse": 0,
                "capability_fit": 0,
                "channel_access": 0,
                "evidence_readiness": 0,
            },
            "matched_assets": [],
            "matched_capabilities": [],
            "matched_channels": [],
            "gaps": ["尚未建立个人画像映射，需要先分类再判断。"],
            "rationale": "当前信号没有匹配到已定义赛道，因此不进入构建队列。",
        }

    topic_id = topic["id"]
    assets = matching_profile_items(profile.get("assets", []), topic_id, "maturity")
    capabilities = matching_profile_items(
        profile.get("capabilities", []), topic_id, "level"
    )
    channels = matching_profile_items(profile.get("channels", []), topic_id, "access")
    dimensions = {
        "asset_reuse": round(assets[0]["maturity"] * 20) if assets else 0,
        "capability_fit": round(capabilities[0]["level"] * 20) if capabilities else 0,
        "channel_access": round(channels[0]["access"] * 20) if channels else 0,
        "evidence_readiness": evidence_readiness_score(topic, confidence, recurrence),
    }
    weights = profile["weights"]
    if set(weights) != set(dimensions) or sum(weights.values()) != 100:
        raise ValueError("Opportunity profile weights must cover four dimensions and sum to 100")
    score = round(
        sum(dimensions[key] * weights[key] / 100 for key in dimensions)
    )
    excluded = topic_id in profile.get("excluded_topic_ids", [])
    if excluded:
        score = min(score, 35)

    thresholds = profile["decision_thresholds"]
    if excluded:
        decision = "hold"
    elif score >= thresholds["build"]:
        decision = "build"
    elif score >= thresholds["validate"]:
        decision = "validate"
    else:
        decision = "hold"

    gaps = []
    if dimensions["asset_reuse"] < 60:
        gaps.append("缺少可直接复用的成熟资产。")
    if dimensions["capability_fit"] < 60:
        gaps.append("当前能力还不足以低成本交付。")
    if dimensions["channel_access"] < 60:
        gaps.append("缺少稳定触达目标用户的一手渠道。")
    if dimensions["evidence_readiness"] < 60:
        gaps.append("缺少直接付费或外部用户证据。")
    if excluded:
        gaps.insert(0, "该赛道不在当前主动投入范围。")
    if not gaps:
        gaps.append("没有结构性短板，下一步应验证真实需求而不是继续加功能。")

    matched_assets = [item["label"] for item in assets]
    matched_capabilities = [item["label"] for item in capabilities]
    matched_channels = [item["label"] for item in channels]
    strongest = matched_assets[0] if matched_assets else "无现成资产"
    return {
        "score": score,
        "decision": decision,
        "dimensions": dimensions,
        "matched_assets": matched_assets,
        "matched_capabilities": matched_capabilities,
        "matched_channels": matched_channels,
        "gaps": gaps,
        "rationale": f"最强复用资产是“{strongest}”；当前首要缺口是{gaps[0]}",
    }


def build_opportunity_profile(profile: dict[str, Any]) -> dict[str, Any]:
    return {
        "version": profile["version"],
        "updated_at": profile["updated_at"],
        "owner": profile["owner"],
        "constraints": profile["constraints"],
        "weights": profile["weights"],
        "decision_thresholds": profile["decision_thresholds"],
        "assets": profile["assets"],
        "capabilities": profile["capabilities"],
        "channels": profile["channels"],
        "excluded_topic_ids": profile.get("excluded_topic_ids", []),
    }


def enrich_opportunity(
    item: dict[str, Any],
    topics: list[dict[str, Any]],
    recurrence_reports: list[Report],
    opportunity_profile: dict[str, Any],
) -> dict[str, Any]:
    topic = match_topic(item["title"], item["signal"], topics)
    recurrence = recurrence_for(topic, recurrence_reports) if topic else {
        "reports": 0,
        "window": len(recurrence_reports),
        "ratio": 0,
        "first_seen": None,
        "last_seen": None,
    }
    role_fit = topic.get("career_fit", {}) if topic else {}
    best_role = max(role_fit, key=role_fit.get) if role_fit else None
    current_decision = decision_from_action(item["action"])
    confidence = confidence_for(topic, recurrence["reports"])
    return {
        **item,
        "topic_id": topic.get("id") if topic else None,
        "channel": topic.get("channel", "service") if topic else "service",
        "tags": topic.get("tags", ["待分类"]) if topic else ["待分类"],
        "decision": current_decision or (topic.get("decision", "research") if topic else "research"),
        "recommendation": item["action"],
        "risk": topic.get("risk", "当前报告缺少独立证据，需要人工复核。") if topic else "当前报告缺少独立证据，需要人工复核。",
        "paid_evidence": paid_evidence_label(topic.get("paid_evidence", "none")) if topic else "未评估",
        "evidence": topic.get("evidence", []) if topic else [],
        "recurrence": recurrence,
        "confidence": confidence,
        "role_fit": role_fit,
        "best_role": best_role,
        "personal_fit": personal_fit_for(
            topic, confidence, recurrence, opportunity_profile
        ),
    }


def report_fact_conflicts(raw: str, project_facts: dict[str, Any]) -> list[str]:
    engineering = project_facts.get("engineering_document_assistant", {})
    target = engineering.get("target_sample_total")
    conflicts: list[str] = []
    if isinstance(target, int):
        target_claim = re.compile(
            rf"(?:已有|现有).{{0,18}}{target}\s*份|{target}\s*份.{{0,18}}(?:已有|现有)"
        )
        if target_claim.search(raw):
            conflicts.append("报告把目标样本数写成当前已完成数量。")
    if engineering.get("has_false_positive_false_negative_metrics") is False:
        metrics_claim = re.compile(
            r"(?:已有|现有|完整).{0,30}(?:误报|漏报)|(?:误报|漏报).{0,30}(?:已有|现有|完整)"
        )
        if metrics_claim.search(raw):
            conflicts.append("报告声称已有人工误报/漏报统计，但事实锚点记录为未建立。")
    return conflicts


def report_quality(
    report: Report, project_facts: dict[str, Any] | None = None
) -> dict[str, Any]:
    fact_conflicts = report_fact_conflicts(report.raw, project_facts or {})
    checks = {
        "has_timestamp": bool(DATE_RE.search(report.raw[:500])),
        "has_model": report.model != "未记录",
        "has_source_links": bool(report.links),
        "has_structured_opportunities": bool(report.opportunities),
        "has_actions": any(item["action"] for item in report.opportunities),
        "matches_project_facts": not fact_conflicts,
    }
    passed = sum(checks.values())
    return {
        "score": round(passed / len(checks) * 100),
        "checks": checks,
        "fact_conflicts": fact_conflicts,
        "linked_sources": len(report.links),
        "label": "可审计性",
    }


def build_career(career_profile: dict[str, Any]) -> dict[str, Any]:
    roles = []
    status_points = {"proved": 1.0, "partial": 0.5, "gap": 0.0}
    for role in career_profile["roles"]:
        criteria = role["criteria"]
        points = sum(status_points[item["status"]] for item in criteria)
        roles.append(
            {
                **role,
                "proved": sum(item["status"] == "proved" for item in criteria),
                "partial": sum(item["status"] == "partial" for item in criteria),
                "gaps": sum(item["status"] == "gap" for item in criteria),
                "readiness": round(points / len(criteria) * 100),
                "score_basis": "逐项作品证据，不是模型主观匹配。",
            }
        )
    return {
        "candidate": career_profile["candidate"],
        "updated_at": career_profile["updated_at"],
        "roles": roles,
        "portfolio": career_profile["portfolio"],
    }


def build_evaluation(
    decision_ledger: dict[str, Any],
    decision_outcomes: dict[str, Any],
    review_windows_days: list[int],
) -> dict[str, Any]:
    allowed_statuses = {"planned", "validating", "validated", "rejected", "stopped"}
    active_statuses = {"planned", "validating"}
    checkpoint_points = {"complete": 1.0, "partial": 0.5, "pending": 0.0}
    today = date.today()
    records = []

    for source in decision_ledger["records"]:
        status = source["status"]
        if status not in allowed_statuses:
            raise ValueError(f"Unsupported decision ledger status: {status}")

        checkpoints = source.get("checkpoints", [])
        invalid_checkpoints = [
            item["status"]
            for item in checkpoints
            if item["status"] not in checkpoint_points
        ]
        if invalid_checkpoints:
            raise ValueError(
                f"Unsupported checkpoint status in {source['id']}: {invalid_checkpoints[0]}"
            )

        completed_points = sum(
            checkpoint_points[item["status"]] for item in checkpoints
        )
        progress = (
            round(completed_points / len(checkpoints) * 100)
            if checkpoints
            else 0
        )

        review_due = source.get("review_due")
        days_remaining = None
        due_state = "none"
        if review_due:
            due_date = date.fromisoformat(review_due)
            days_remaining = (due_date - today).days
            if status in active_statuses:
                if days_remaining < 0:
                    due_state = "overdue"
                elif days_remaining <= 7:
                    due_state = "due-soon"
                else:
                    due_state = "scheduled"
            else:
                due_state = "closed"

        records.append(
            {
                **source,
                "progress": progress,
                "completed_checkpoints": sum(
                    item["status"] == "complete" for item in checkpoints
                ),
                "checkpoint_count": len(checkpoints),
                "days_remaining": days_remaining,
                "due_state": due_state,
                "evidence_boundary": (
                    "已有外部证据"
                    if source.get("external_evidence")
                    else "仅本地或间接证据"
                ),
            }
        )

    allowed_outcomes = {"confirmed", "mixed", "reversed", "no-signal"}
    outcome_map: dict[tuple[str, int], dict[str, Any]] = {}
    for outcome in decision_outcomes.get("outcomes", []):
        result = outcome.get("result")
        if result not in allowed_outcomes:
            raise ValueError(f"Unsupported decision outcome result: {result}")
        if not outcome.get("evidence"):
            raise ValueError("Decision outcomes require concrete evidence")
        key = (outcome["decision_id"], outcome["window_days"])
        outcome_map[key] = outcome

    review_queue = []
    for record in records:
        opened_at = record.get("opened_at")
        if not opened_at:
            continue
        opened_date = date.fromisoformat(opened_at)
        for window_days in review_windows_days:
            due_date = opened_date + timedelta(days=window_days)
            outcome = outcome_map.get((record["id"], window_days))
            days_remaining = (due_date - today).days
            if outcome:
                review_status = "completed"
            elif days_remaining < 0:
                review_status = "overdue"
            elif days_remaining <= 7:
                review_status = "due-soon"
            else:
                review_status = "scheduled"
            review_queue.append(
                {
                    "id": f"{record['id']}:{window_days}",
                    "decision_id": record["id"],
                    "title": record["title"],
                    "window_days": window_days,
                    "due_date": due_date.isoformat(),
                    "days_remaining": days_remaining,
                    "status": review_status,
                    "decision": record["decision"],
                    "original_status": record["status"],
                    "result": outcome.get("result") if outcome else None,
                    "evidence": outcome.get("evidence") if outcome else None,
                    "note": outcome.get("note") if outcome else None,
                    "observed_at": outcome.get("observed_at") if outcome else None,
                }
            )

    review_order = {"overdue": 0, "due-soon": 1, "scheduled": 2, "completed": 3}
    review_queue.sort(
        key=lambda item: (review_order[item["status"]], item["due_date"], item["title"])
    )
    pending_reviews = [
        item for item in review_queue if item["status"] != "completed"
    ]
    next_review = min(
        (item["due_date"] for item in pending_reviews),
        default=None,
    )
    return {
        "updated_at": decision_ledger["updated_at"],
        "outcomes_updated_at": decision_outcomes.get("updated_at"),
        "rules": decision_ledger["rules"],
        "summary": {
            "total": len(records),
            "active": sum(record["status"] in active_statuses for record in records),
            "validated": sum(record["status"] == "validated" for record in records),
            "rejected": sum(record["status"] == "rejected" for record in records),
            "external_evidence": sum(
                bool(record.get("external_evidence")) for record in records
            ),
            "next_review": next_review,
            "review_total": len(review_queue),
            "review_completed": sum(
                item["status"] == "completed" for item in review_queue
            ),
            "review_overdue": sum(
                item["status"] == "overdue" for item in review_queue
            ),
            "review_due_soon": sum(
                item["status"] == "due-soon" for item in review_queue
            ),
        },
        "review_windows_days": review_windows_days,
        "review_queue": review_queue,
        "records": records,
    }


def build_security_status(repo: Path, source_root: Path | None) -> dict[str, Any]:
    candidates = [
        repo / ".git" / "config",
        repo / "tools" / "build_dashboard_data.py",
    ]
    if source_root:
        candidates.extend(
            [
                source_root / "push_to_github.py",
                source_root / "push_skills.py",
                source_root / "create_github_repo.py",
            ]
        )
    checked = [path for path in candidates if path.is_file()]
    unsafe = []
    for path in checked:
        text = path.read_text(encoding="utf-8", errors="replace")
        if re.search(
            r"(?:ghp_[A-Za-z0-9]{20,}|github_pat_[A-Za-z0-9_]{20,})",
            text,
        ):
            unsafe.append(path.name)
    return {
        "status": "pass" if not unsafe else "fail",
        "checked_files": len(checked),
        "hardcoded_credentials_detected": len(unsafe),
        "credential_source": "运行时或短期凭据（未写入仓库）",
        "publish_mode": "提交 SHA 固定 + 保存版本 + 发布后校验",
    }


def build_payload(repo: Path, source_root: Path | None = None) -> dict[str, Any]:
    evidence_catalog = load_json(repo / "data" / "evidence_catalog.json")
    career_profile = load_json(repo / "data" / "career_profile.json")
    decision_ledger = load_json(repo / "data" / "decision_ledger.json")
    decision_outcomes = load_json(repo / "data" / "decision_outcomes.json")
    opportunity_profile = load_json(repo / "data" / "opportunity_profile.json")
    publication_state = load_json(repo / "data" / "publication_state.json")
    project_facts = load_json(repo / "data" / "project_facts.json")
    archive_paths = sorted((repo / "reports" / "archive").glob("summary_*.md"))
    latest_path = repo / "reports" / "latest.md"
    report_paths = archive_paths + ([latest_path] if latest_path.is_file() else [])
    reports = dedupe_reports(report_paths)
    if not reports:
        raise RuntimeError("No Night Patrol reports found")

    latest = parse_report(latest_path) if latest_path.is_file() else reports[0]
    recurrence_reports = reports[:30]
    topics = evidence_catalog["topics"]
    latest_opportunities = [
        enrich_opportunity(item, topics, recurrence_reports, opportunity_profile)
        for item in latest.opportunities
    ]

    trends = []
    for topic in topics:
        recurrence = recurrence_for(topic, recurrence_reports)
        trends.append(
            {
                "id": topic["id"],
                "label": topic["label"],
                **recurrence,
                "decision": topic["decision"],
            }
        )
    trends.sort(key=lambda item: (item["reports"], item["ratio"]), reverse=True)

    history = []
    for report in reports:
        top = max((item["score"] for item in report.opportunities), default=0)
        headline = report.opportunities[0]["title"] if report.opportunities else report.title
        history.append(
            {
                "id": report.report_id,
                "date": report.date,
                "headline": headline,
                "top_score": top,
                "opportunity_count": len(report.opportunities),
                "linked_sources": len(report.links),
                "quality": report_quality(report, project_facts)["score"],
                "path": f"reports/archive/{report.path.name}" if report.path.name != "latest.md" else "reports/latest.md",
            }
        )

    local_summary_count = len(list(source_root.glob("summary_*.md"))) if source_root and source_root.is_dir() else len(reports)
    raw_run_count = len(list(source_root.glob("night_raw_*.md"))) if source_root and source_root.is_dir() else 0
    daily_report_count = len(list(source_root.glob("夜巡日报_*.md"))) if source_root and source_root.is_dir() else 0
    report_archive_count = len(reports)
    public_archive_count = min(
        int(publication_state.get("public_archive_count", 0)),
        report_archive_count,
    )
    unpublished_report_count = report_archive_count - public_archive_count

    top_opportunity = latest_opportunities[0] if latest_opportunities else None
    return {
        "schema_version": 5,
        "generated_at": datetime.now(timezone.utc).isoformat(timespec="seconds"),
        "system": {
            "title": "AI 夜巡",
            "subtitle": "可验证的机会情报与求职证据雷达",
            "local_summary_count": local_summary_count,
            "raw_run_count": raw_run_count,
            "daily_report_count": daily_report_count,
            "report_archive_count": report_archive_count,
            "public_archive_count": public_archive_count,
            "unpublished_report_count": unpublished_report_count,
            "publication": {
                "updated_at": publication_state.get("updated_at"),
                "last_public_report": publication_state.get("last_public_report"),
                "status": publication_state.get("status", "unknown"),
                "message": publication_state.get("message", ""),
            },
            "history_window": {
                "from": reports[-1].date,
                "to": reports[0].date,
            },
            "security": build_security_status(repo, source_root),
        },
        "latest": {
            "id": latest.report_id,
            "title": latest.title,
            "date": latest.date,
            "model": latest.model,
            "sources": source_statuses(latest.raw),
            "quality": report_quality(latest, project_facts),
            "headline": {
                "title": top_opportunity["title"] if top_opportunity else "等待可信信号",
                "summary": top_opportunity["signal"] if top_opportunity else "当前报告没有可解析的正式机会。",
                "confidence": top_opportunity["confidence"] if top_opportunity else "low",
            },
            "opportunities": latest_opportunities,
            "evidence_source_count": len(
                {
                    evidence["url"]
                    for item in latest_opportunities
                    for evidence in item["evidence"]
                }
            ),
            "path": "reports/latest.md",
        },
        "trends": trends,
        "history": history,
        "career": build_career(career_profile),
        "opportunity_profile": build_opportunity_profile(opportunity_profile),
        "evaluation": build_evaluation(
            decision_ledger,
            decision_outcomes,
            opportunity_profile["constraints"]["review_windows_days"],
        ),
        "methodology": {
            "note": "热度、证据和岗位匹配分开呈现。机会分数沿用原报告，可信度由来源与重复信号决定。",
            "confidence_levels": {
                "high": "存在直接市场证据，且在多个独立报告窗口重复出现。",
                "medium": "存在一手技术来源并重复出现，但付费证据不足。",
                "low": "缺少来源、仅单次出现，或结论超出证据支持范围。"
            }
        },
    }


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Build structured data for the Night Patrol dashboard")
    parser.add_argument("--repo", type=Path, default=Path(__file__).resolve().parents[1])
    parser.add_argument("--source-root", type=Path)
    parser.add_argument("--output", type=Path)
    return parser.parse_args()


def main() -> None:
    args = parse_args()
    repo = args.repo.resolve()
    source_root = args.source_root.resolve() if args.source_root else repo.parent
    output = args.output.resolve() if args.output else repo / "data" / "dashboard.json"
    payload = build_payload(repo, source_root)
    output.parent.mkdir(parents=True, exist_ok=True)
    output.write_text(
        json.dumps(payload, ensure_ascii=False, indent=2) + "\n",
        encoding="utf-8",
    )
    print(
        f"Built {output} | reports={len(payload['history'])} "
        f"| opportunities={len(payload['latest']['opportunities'])}"
    )


if __name__ == "__main__":
    main()

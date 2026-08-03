"""Validate the static Night Patrol package before a public release."""

from __future__ import annotations

import json
import re
import sys
from html.parser import HTMLParser
from pathlib import Path
from urllib.parse import unquote

ROOT = Path(__file__).resolve().parents[1]
SKIP_DIRS = {".git", ".playwright-cli", "__pycache__", "output"}
TEXT_SUFFIXES = {
    ".css",
    ".html",
    ".js",
    ".json",
    ".md",
    ".py",
    ".txt",
    ".yaml",
    ".yml",
}
REQUIRED_PATHS = [
    ".github/workflows/pages.yml",
    ".nojekyll",
    "README.md",
    "methodology.md",
    "index.html",
    "dashboard/index.html",
    "dashboard/app.js",
    "dashboard/styles.css",
    "dashboard/vendor/lucide.min.js",
    "dashboard/vendor/LICENSE.lucide",
    "data/dashboard.json",
    "data/evidence_catalog.json",
    "data/career_profile.json",
    "data/decision_ledger.json",
    "data/decision_outcomes.json",
    "data/opportunity_profile.json",
    "data/publication_state.json",
    "data/project_facts.json",
    "docs/DECISION_2026-07-31.md",
    "docs/PERSONAL_OPPORTUNITY_ENGINE.md",
    "docs/REVIEW_2026-07-31_RECENT_SIGNALS.md",
    "reports/latest.md",
    "tools/refresh_project_facts.py",
    "tools/record_decision_outcome.py",
]
TOKEN_PATTERNS = {
    "classic GitHub PAT": re.compile(r"ghp_[A-Za-z0-9]{20,}"),
    "fine-grained GitHub PAT": re.compile(r"github_pat_[A-Za-z0-9_]{20,}"),
}
MARKDOWN_LINK = re.compile(r"\[[^\]]+\]\(([^)]+)\)")


class AssetParser(HTMLParser):
    def __init__(self) -> None:
        super().__init__()
        self.references: list[str] = []

    def handle_starttag(
        self, tag: str, attrs: list[tuple[str, str | None]]
    ) -> None:
        attr_map = dict(attrs)
        if tag in {"script", "img", "source"} and attr_map.get("src"):
            self.references.append(attr_map["src"] or "")
        if tag == "link" and attr_map.get("href"):
            self.references.append(attr_map["href"] or "")
        if tag == "a" and attr_map.get("href"):
            self.references.append(attr_map["href"] or "")


def is_skipped(path: Path) -> bool:
    return any(part in SKIP_DIRS for part in path.relative_to(ROOT).parts)


def iter_text_files() -> list[Path]:
    return [
        path
        for path in ROOT.rglob("*")
        if path.is_file() and not is_skipped(path) and path.suffix in TEXT_SUFFIXES
    ]


def local_target(source: Path, raw_target: str) -> Path | None:
    target = raw_target.strip().strip("<>")
    if not target or target.startswith(("#", "http://", "https://", "mailto:", "data:")):
        return None
    target = unquote(target.split("#", 1)[0].split("?", 1)[0])
    if not target:
        return None
    return (source.parent / target).resolve()


def validate_required_paths(errors: list[str]) -> None:
    for relative_path in REQUIRED_PATHS:
        if not (ROOT / relative_path).exists():
            errors.append(f"missing required path: {relative_path}")


def validate_frontend_dependencies(errors: list[str]) -> None:
    dashboard_html = ROOT / "dashboard" / "index.html"
    if not dashboard_html.is_file():
        return
    raw = dashboard_html.read_text(encoding="utf-8")
    if "unpkg.com/lucide" in raw:
        errors.append("dashboard icons must be bundled locally, not loaded from unpkg")


def validate_dashboard(errors: list[str]) -> None:
    path = ROOT / "data" / "dashboard.json"
    if not path.is_file():
        return
    payload = json.loads(path.read_text(encoding="utf-8"))
    publication = json.loads(
        (ROOT / "data" / "publication_state.json").read_text(encoding="utf-8")
    )
    if payload.get("schema_version") != 5:
        errors.append("data/dashboard.json must use schema_version 5")

    system = payload.get("system", {})
    archive_count = len(list((ROOT / "reports" / "archive").glob("summary_*.md")))
    public_count = publication.get("public_archive_count")
    if not isinstance(public_count, int) or not 0 <= public_count <= archive_count:
        errors.append("publication_state public_archive_count is invalid")
        return
    if system.get("public_archive_count") != public_count:
        errors.append("dashboard public count must match publication_state")
    if not isinstance(system.get("local_summary_count"), int) or system.get("local_summary_count") < archive_count:
        errors.append("local_summary_count must be an integer no smaller than the report archive")
    if system.get("report_archive_count") != archive_count:
        errors.append("report_archive_count must match the local report archive")
    if system.get("unpublished_report_count") != archive_count - public_count:
        errors.append("unpublished_report_count must match local minus public reports")
    if system.get("publication", {}).get("last_public_report") != publication.get(
        "last_public_report"
    ):
        errors.append("last_public_report must match the audited public checkpoint")

    evaluation = payload.get("evaluation", {})
    if not evaluation.get("records"):
        errors.append("evaluation ledger is missing from dashboard.json")
    if evaluation.get("summary", {}).get("external_evidence") != 0:
        errors.append("external evidence count changed; review the claim before release")
    if evaluation.get("summary", {}).get("review_completed") != 0:
        errors.append("review outcomes changed; attach and audit the real evidence before release")
    if not evaluation.get("review_queue"):
        errors.append("7/30 day review queue is missing from dashboard.json")

    profile = payload.get("opportunity_profile", {})
    if sum(profile.get("weights", {}).values()) != 100:
        errors.append("opportunity profile weights must sum to 100")
    if not profile.get("assets") or not profile.get("channels"):
        errors.append("opportunity profile assets or channels are missing")


def validate_project_facts(errors: list[str]) -> None:
    path = ROOT / "data" / "project_facts.json"
    if not path.is_file():
        return
    facts = json.loads(path.read_text(encoding="utf-8"))
    engineering = facts.get("engineering_document_assistant", {})
    current = engineering.get("current_sample_total")
    components = engineering.get("real_samples", 0) + engineering.get(
        "synthetic_public_samples", 0
    )
    if current != components:
        errors.append("current_sample_total must equal real plus synthetic samples")
    if current >= engineering.get("target_sample_total", 0):
        errors.append("project facts unexpectedly claim the sample target is complete")
    if engineering.get("has_false_positive_false_negative_metrics") is not False:
        errors.append("manual false-positive/false-negative metrics need evidence review")
    if engineering.get("external_user_count") != 0:
        errors.append("external user count changed; attach evidence before release")

    night_patrol = facts.get("night_patrol", {})
    archive_count = len(list((ROOT / "reports" / "archive").glob("summary_*.md")))
    public_count = night_patrol.get("public_archive_count")
    publication = json.loads(
        (ROOT / "data" / "publication_state.json").read_text(encoding="utf-8")
    )
    if night_patrol.get("local_report_archive_count") != archive_count:
        errors.append("project facts local archive count must match the filesystem")
    if not isinstance(public_count, int) or public_count > archive_count:
        errors.append("project facts public archive count is invalid")
    elif night_patrol.get("unpublished_report_count") != archive_count - public_count:
        errors.append("project facts unpublished count must equal local minus public")
    if public_count != publication.get("public_archive_count"):
        errors.append("project facts public count must match publication_state")


def validate_credentials(files: list[Path], errors: list[str]) -> None:
    for path in files:
        text = path.read_text(encoding="utf-8", errors="replace")
        for label, pattern in TOKEN_PATTERNS.items():
            if pattern.search(text):
                relative = path.relative_to(ROOT).as_posix()
                errors.append(f"{label} detected in {relative}")


def validate_markdown_links(files: list[Path], errors: list[str]) -> None:
    for path in files:
        if path.suffix != ".md":
            continue
        text = path.read_text(encoding="utf-8", errors="replace")
        for raw_target in MARKDOWN_LINK.findall(text):
            target = local_target(path, raw_target)
            if target is not None and not target.exists():
                relative = path.relative_to(ROOT).as_posix()
                errors.append(f"broken Markdown link in {relative}: {raw_target}")


def validate_html_assets(files: list[Path], errors: list[str]) -> None:
    for path in files:
        if path.suffix != ".html":
            continue
        parser = AssetParser()
        parser.feed(path.read_text(encoding="utf-8", errors="replace"))
        for raw_target in parser.references:
            target = local_target(path, raw_target)
            if target is not None and not target.exists():
                relative = path.relative_to(ROOT).as_posix()
                errors.append(f"broken HTML asset in {relative}: {raw_target}")


def validate_public_wording(errors: list[str]) -> None:
    readme = (ROOT / "README.md").read_text(encoding="utf-8")
    for forbidden in ("336 轮", "三个视图", "已验证付费", "市场空白"):
        if forbidden in readme:
            errors.append(f"README contains unreviewed wording: {forbidden}")


def main() -> int:
    errors: list[str] = []
    files = iter_text_files()

    validate_required_paths(errors)
    validate_frontend_dependencies(errors)
    validate_dashboard(errors)
    validate_project_facts(errors)
    validate_credentials(files, errors)
    validate_markdown_links(files, errors)
    validate_html_assets(files, errors)
    validate_public_wording(errors)

    if errors:
        print("Public release validation failed:")
        for error in errors:
            print(f"  - {error}")
        return 1

    publishable_files = [
        path
        for path in ROOT.rglob("*")
        if path.is_file() and not is_skipped(path)
    ]
    total_bytes = sum(path.stat().st_size for path in publishable_files)
    print(
        "Public release validation passed | "
        f"files={len(publishable_files)} | bytes={total_bytes}"
    )
    return 0


if __name__ == "__main__":
    raise SystemExit(main())

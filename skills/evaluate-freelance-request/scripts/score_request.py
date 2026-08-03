#!/usr/bin/env python3
"""Score a structured freelance request without external dependencies."""

from __future__ import annotations

import argparse
import json
import sys
from pathlib import Path
from typing import Any


def clamp(value: float) -> int:
    return max(0, min(100, round(value)))


def yes(facts: dict[str, Any], key: str) -> bool:
    return facts.get(key) is True


def score_request(payload: dict[str, Any]) -> dict[str, Any]:
    facts = payload.get("facts") or {}

    clarity_keys = (
        "workflow_known",
        "inputs_defined",
        "outputs_defined",
        "volume_known",
        "accounts_known",
        "acceptance_defined",
        "operation_recording",
    )
    clarity = clamp(sum(yes(facts, key) for key in clarity_keys) / len(clarity_keys) * 100)

    feasibility = 100
    if yes(facts, "requires_hidden_data"):
        feasibility -= 35
    if yes(facts, "automation_sensitive"):
        feasibility -= 18
    if yes(facts, "requires_login"):
        feasibility -= 7
    if yes(facts, "multi_account"):
        feasibility -= 10
    if facts.get("official_api_available") is False and yes(facts, "automation_sensitive"):
        feasibility -= 15
    if yes(facts, "automation_sensitive") and not yes(facts, "human_checkpoint_allowed"):
        feasibility -= 15
    feasibility = clamp(feasibility)

    delivery_keys = (
        "workflow_known",
        "operation_recording",
        "acceptance_defined",
        "volume_known",
        "maintenance_defined",
        "deadline_known",
    )
    delivery = clamp(20 + sum(yes(facts, key) for key in delivery_keys) / len(delivery_keys) * 80)
    if yes(facts, "data_sensitive"):
        delivery = clamp(delivery - 8)

    commercial_keys = (
        "budget_known",
        "deadline_known",
        "volume_known",
        "acceptance_defined",
        "maintenance_defined",
        "payment_milestone_defined",
    )
    commercial = clamp(10 + sum(yes(facts, key) for key in commercial_keys) / len(commercial_keys) * 90)

    overall = clamp(clarity * 0.30 + feasibility * 0.30 + delivery * 0.25 + commercial * 0.15)

    high_platform_risk = yes(facts, "automation_sensitive") and (
        facts.get("official_api_available") is False or yes(facts, "multi_account")
    )
    if feasibility < 25 and not yes(facts, "human_checkpoint_allowed"):
        recommendation = "不建议承接"
    elif yes(facts, "requires_hidden_data") or high_platform_risk:
        recommendation = "只接付费验证"
    elif overall >= 75 and clarity >= 65 and feasibility >= 65:
        recommendation = "可进入详细报价"
    else:
        recommendation = "先补信息"

    questions: list[str] = []
    question_map = {
        "workflow_known": "请提供一次从输入到完成的真实操作录屏。",
        "volume_known": "首期和日常分别要处理多少条数据、多少个账号？",
        "accounts_known": "涉及哪些平台和账号，账号由谁登录与保管？",
        "acceptance_defined": "什么结果算验收通过，允许哪些步骤人工介入？",
        "maintenance_defined": "第三方页面改版后的维护期限和费用如何约定？",
        "budget_known": "本次验证和正式版分别有怎样的预算预期？",
        "payment_milestone_defined": "是否接受按验证、正式开发、验收分阶段付款？",
    }
    for key, question in question_map.items():
        if not yes(facts, key):
            questions.append(question)

    risks: list[dict[str, str]] = []
    if yes(facts, "requires_hidden_data"):
        risks.append({
            "level": "high",
            "name": "核心数据不可直接验证",
            "action": "先单独验证数据可得性，并定义可接受的替代口径。",
        })
    if yes(facts, "automation_sensitive"):
        risks.append({
            "level": "high" if high_platform_risk else "medium",
            "name": "平台风控与页面变更",
            "action": "限定账号与频率，保留人工检查点并单列维护范围。",
        })
    if yes(facts, "requires_login"):
        risks.append({
            "level": "medium",
            "name": "账号与凭证",
            "action": "由客户本人登录，程序不保存密码、验证码或 cookie。",
        })
    if not yes(facts, "acceptance_defined"):
        risks.append({
            "level": "medium",
            "name": "验收边界不清",
            "action": "开发前书面确认输入、输出、成功率和人工步骤。",
        })

    return {
        "title": payload.get("title", "未命名需求"),
        "recommendation": recommendation,
        "scores": {
            "overall": overall,
            "clarity": clarity,
            "feasibility": feasibility,
            "delivery": delivery,
            "commercial": commercial,
        },
        "questions": questions[:5],
        "risks": risks,
        "note": "评分用于确定下一步沟通与验证范围，不代表市场统一报价或交付保证。",
    }


def load_payload(path: str | None) -> dict[str, Any]:
    if path:
        return json.loads(Path(path).read_text(encoding="utf-8"))
    return json.load(sys.stdin)


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("input", nargs="?", help="UTF-8 JSON file; omit to read stdin")
    parser.add_argument("--compact", action="store_true", help="print compact JSON")
    args = parser.parse_args()

    try:
        result = score_request(load_payload(args.input))
    except (OSError, json.JSONDecodeError, TypeError) as exc:
        print(json.dumps({"error": str(exc)}, ensure_ascii=False), file=sys.stderr)
        return 2

    print(json.dumps(result, ensure_ascii=False, indent=None if args.compact else 2))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())

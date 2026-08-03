from __future__ import annotations

import json
import re
import tempfile
import unittest
from pathlib import Path

from tools.build_dashboard_data import (
    build_payload,
    parse_heading_opportunities,
    parse_report,
    personal_fit_for,
    report_quality,
)
from tools.refresh_project_facts import refresh_project_facts
from tools.record_decision_outcome import record_outcome


ROOT = Path(__file__).resolve().parents[1]


class DashboardDataTests(unittest.TestCase):
    def test_latest_report_only_parses_formal_opportunities(self) -> None:
        raw = (ROOT / "reports" / "latest.md").read_text(encoding="utf-8")
        opportunities = parse_heading_opportunities(raw)
        titles = [item["title"] for item in opportunities]
        self.assertGreaterEqual(len(titles), 1)
        self.assertTrue(all(0 <= item["score"] <= 5 for item in opportunities))
        self.assertFalse(any("GitHub Weekly Top" in title for title in titles))
        self.assertFalse(any("GitHub Monthly Top" in title for title in titles))

    def test_payload_has_traceable_evidence_and_career_rubrics(self) -> None:
        payload = build_payload(ROOT, ROOT.parent)
        self.assertEqual(payload["schema_version"], 5)
        self.assertGreaterEqual(len(payload["history"]), 50)
        self.assertEqual(len(payload["career"]["roles"]), 3)
        self.assertTrue(payload["latest"]["quality"]["checks"]["has_structured_opportunities"])
        self.assertTrue(payload["latest"]["quality"]["checks"]["matches_project_facts"])
        self.assertEqual(payload["latest"]["quality"]["fact_conflicts"], [])
        self.assertEqual(payload["system"]["security"]["status"], "pass")
        self.assertEqual(payload["system"]["security"]["hardcoded_credentials_detected"], 0)
        archive_count = len(list((ROOT / "reports" / "archive").glob("summary_*.md")))
        self.assertEqual(payload["system"]["report_archive_count"], archive_count)
        self.assertLessEqual(
            payload["system"]["public_archive_count"],
            payload["system"]["report_archive_count"],
        )
        self.assertEqual(
            payload["system"]["unpublished_report_count"],
            payload["system"]["report_archive_count"]
            - payload["system"]["public_archive_count"],
        )
        publication = json.loads(
            (ROOT / "data" / "publication_state.json").read_text(encoding="utf-8")
        )
        self.assertEqual(
            payload["system"]["public_archive_count"],
            publication["public_archive_count"],
        )
        self.assertEqual(
            payload["system"]["publication"]["last_public_report"],
            publication["last_public_report"],
        )

        for item in payload["latest"]["opportunities"]:
            self.assertIn(item["confidence"], {"low", "medium", "high"})
            self.assertLessEqual(item["recurrence"]["reports"], item["recurrence"]["window"])
            for evidence in item["evidence"]:
                self.assertRegex(evidence["url"], r"^https://")
                self.assertTrue(evidence["supports"])
                self.assertTrue(evidence["does_not_support"])

        for role in payload["career"]["roles"]:
            self.assertEqual(len(role["criteria"]), 5)
            self.assertEqual(
                role["proved"] + role["partial"] + role["gaps"],
                len(role["criteria"]),
            )
            self.assertIn("逐项作品证据", role["score_basis"])

        evaluation = payload["evaluation"]
        self.assertGreaterEqual(len(evaluation["records"]), 4)
        self.assertGreaterEqual(evaluation["summary"]["active"], 1)
        self.assertGreaterEqual(evaluation["summary"]["rejected"], 1)
        for record in evaluation["records"]:
            self.assertTrue(record["hypothesis"])
            self.assertTrue(record["success_criteria"])
            self.assertTrue(record["stop_condition"])
            self.assertIn(
                record["status"],
                {"planned", "validating", "validated", "rejected", "stopped"},
            )
            self.assertGreaterEqual(record["progress"], 0)
            self.assertLessEqual(record["progress"], 100)
            if record["status"] in {"planned", "validating"}:
                self.assertTrue(record["review_due"])

    def test_personal_fit_is_explainable_and_changes_the_priority(self) -> None:
        """守护 V4 个人机会决策逻辑：高分->build / 中分->validate / 无匹配->hold。

        不依赖最新报告恰好包含某个项目，而是直接测 personal_fit_for 纯函数。
        """
        profile = json.loads(
            (ROOT / "data" / "opportunity_profile.json").read_text(encoding="utf-8")
        )
        # office-document-ai：有成熟资产+能力+渠道，应进入 build
        office_topic = {
            "id": "office-document-ai",
            "paid_evidence": "indirect",
        }
        office_fit = personal_fit_for(
            office_topic, "high", {"reports": 6, "window": 30}, profile
        )
        self.assertGreaterEqual(office_fit["score"], 75)
        self.assertEqual(office_fit["decision"], "build")
        self.assertEqual(
            set(office_fit["dimensions"]),
            {"asset_reuse", "capability_fit", "channel_access", "evidence_readiness"},
        )
        self.assertTrue(office_fit["matched_assets"])
        self.assertTrue(office_fit["rationale"])

        # agent-skills：有部分能力但缺资产/渠道证据，应 validate 或更低
        skills_topic = {"id": "agent-skills", "paid_evidence": "none"}
        skills_fit = personal_fit_for(
            skills_topic, "medium", {"reports": 2, "window": 30}, profile
        )
        self.assertLessEqual(skills_fit["score"], office_fit["score"])
        self.assertIn(skills_fit["decision"], {"build", "validate", "hold"})

        # 无 topic（未分类信号）：必须 hold 且 0 分
        unmatched_fit = personal_fit_for(
            None, "low", {"reports": 0, "window": 30}, profile
        )
        self.assertEqual(unmatched_fit["score"], 0)
        self.assertEqual(unmatched_fit["decision"], "hold")
        self.assertEqual(
            set(unmatched_fit["dimensions"]),
            {"asset_reuse", "capability_fit", "channel_access", "evidence_readiness"},
        )

        # 被排除的赛道（ai-security）分数必须被压低到 hold / 35 以下
        security_topic = {"id": "ai-security", "paid_evidence": "indirect"}
        security_fit = personal_fit_for(
            security_topic, "high", {"reports": 8, "window": 30}, profile
        )
        self.assertLessEqual(security_fit["score"], 35)
        self.assertEqual(security_fit["decision"], "hold")


    def test_review_queue_has_7_and_30_day_windows_without_fake_outcomes(self) -> None:
        payload = build_payload(ROOT, ROOT.parent)
        evaluation = payload["evaluation"]
        queue = evaluation["review_queue"]
        self.assertEqual(
            len(queue),
            len(evaluation["records"]) * len(evaluation["review_windows_days"]),
        )
        self.assertEqual(set(evaluation["review_windows_days"]), {7, 30})
        self.assertEqual(evaluation["summary"]["review_completed"], 0)
        self.assertTrue(all(item["result"] is None for item in queue))
        self.assertTrue(all(item["evidence"] is None for item in queue))
        for decision_id in {item["decision_id"] for item in queue}:
            windows = {
                item["window_days"]
                for item in queue
                if item["decision_id"] == decision_id
            }
            self.assertEqual(windows, {7, 30})

    def test_outcome_recorder_requires_real_evidence_and_upserts(self) -> None:
        with tempfile.TemporaryDirectory() as temp_dir:
            outcomes_path = Path(temp_dir) / "decision_outcomes.json"
            outcomes_path.write_text(
                json.dumps({"version": 1, "updated_at": "2026-08-01", "outcomes": []}),
                encoding="utf-8",
            )
            entry = record_outcome(
                ROOT / "data" / "decision_ledger.json",
                outcomes_path,
                "night-patrol-career-proof",
                7,
                "mixed",
                "A recruiter opened the public portfolio and asked one follow-up question.",
                "The signal exists, but it is not yet an interview.",
                "2026-08-07",
            )
            self.assertEqual(entry["result"], "mixed")
            saved = json.loads(outcomes_path.read_text(encoding="utf-8"))
            self.assertEqual(len(saved["outcomes"]), 1)

            record_outcome(
                ROOT / "data" / "decision_ledger.json",
                outcomes_path,
                "night-patrol-career-proof",
                7,
                "confirmed",
                "A second reviewer requested a demo.",
                observed_at="2026-08-08",
            )
            saved = json.loads(outcomes_path.read_text(encoding="utf-8"))
            self.assertEqual(len(saved["outcomes"]), 1)
            self.assertEqual(saved["outcomes"][0]["result"], "confirmed")

            with self.assertRaises(ValueError):
                record_outcome(
                    ROOT / "data" / "decision_ledger.json",
                    outcomes_path,
                    "night-patrol-career-proof",
                    30,
                    "confirmed",
                    "",
                )

    def test_generated_payload_contains_no_github_personal_access_token(self) -> None:
        payload = build_payload(ROOT, ROOT.parent)
        encoded = json.dumps(payload, ensure_ascii=False)
        self.assertIsNone(
            re.search(
                r"(?:ghp_[A-Za-z0-9]{20,}|github_pat_[A-Za-z0-9_]{20,})",
                encoded,
            )
        )

    def test_generation_spec_uses_audited_project_facts(self) -> None:
        facts = json.loads(
            (ROOT / "data" / "project_facts.json").read_text(encoding="utf-8")
        )
        engineering = facts["engineering_document_assistant"]
        self.assertEqual(
            engineering["current_sample_total"],
            engineering["real_samples"] + engineering["synthetic_public_samples"],
        )
        self.assertLess(
            engineering["current_sample_total"],
            engineering["target_sample_total"],
        )
        self.assertFalse(engineering["has_false_positive_false_negative_metrics"])
        self.assertEqual(engineering["external_user_count"], 0)

        spec = (
            ROOT / "docs" / "NIGHT_PATROL_V3_GENERATION_SPEC.md"
        ).read_text(encoding="utf-8")
        self.assertIn("v3.3", spec)
        self.assertIn("project_facts.json", spec)
        self.assertIn("current_sample_total=4", spec)
        self.assertIn("不得猜测 `data/reports` 等目录", spec)

    def test_dashboard_bundles_icon_runtime_locally(self) -> None:
        html = (ROOT / "dashboard" / "index.html").read_text(encoding="utf-8")
        self.assertNotIn("unpkg.com/lucide", html)
        self.assertIn("./vendor/lucide.min.js", html)
        self.assertTrue((ROOT / "dashboard" / "vendor" / "lucide.min.js").is_file())

    def test_project_fact_refresh_uses_filesystem_counts(self) -> None:
        with tempfile.TemporaryDirectory() as temp_dir:
            base = Path(temp_dir)
            repo = base / "repo"
            source = base / "source"
            (repo / "data").mkdir(parents=True)
            (repo / "reports" / "archive").mkdir(parents=True)
            source.mkdir()
            facts = {
                "updated_at": "2026-01-01T00:00:00+08:00",
                "engineering_document_assistant": {},
                "night_patrol": {
                    "local_summary_count": 1,
                    "local_report_archive_count": 1,
                    "public_archive_count": 1,
                    "unpublished_report_count": 0,
                },
            }
            (repo / "data" / "project_facts.json").write_text(
                json.dumps(facts), encoding="utf-8"
            )
            for index in range(3):
                (source / f"summary_2026-01-0{index + 1}_00-00.md").write_text(
                    "test", encoding="utf-8"
                )
            for index in range(2):
                (repo / "reports" / "archive" / f"summary_{index}.md").write_text(
                    "test", encoding="utf-8"
                )

            refreshed = refresh_project_facts(repo, source)["night_patrol"]
            self.assertEqual(refreshed["local_summary_count"], 3)
            self.assertEqual(refreshed["local_report_archive_count"], 2)
            self.assertEqual(refreshed["unpublished_report_count"], 1)

    def test_v32_report_keeps_its_fact_conflict_regression_signal(self) -> None:
        facts = json.loads(
            (ROOT / "data" / "project_facts.json").read_text(encoding="utf-8")
        )
        report = parse_report(
            ROOT / "reports" / "archive" / "summary_2026-08-01_12-00.md"
        )
        quality = report_quality(report, facts)
        self.assertFalse(quality["checks"]["matches_project_facts"])
        self.assertGreaterEqual(len(quality["fact_conflicts"]), 1)


if __name__ == "__main__":
    unittest.main()

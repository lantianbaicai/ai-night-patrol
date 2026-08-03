"""Refresh filesystem-derived Night Patrol facts without changing audited claims."""

from __future__ import annotations

import argparse
import json
from datetime import datetime, timedelta, timezone
from pathlib import Path
from typing import Any


def refresh_project_facts(repo: Path, source_root: Path) -> dict[str, Any]:
    facts_path = repo / "data" / "project_facts.json"
    facts = json.loads(facts_path.read_text(encoding="utf-8"))
    night_patrol = facts.setdefault("night_patrol", {})

    source_count = len(list(source_root.glob("summary_*.md")))
    archive_count = len(list((repo / "reports" / "archive").glob("summary_*.md")))
    existing_source_count = int(night_patrol.get("local_summary_count", 0))
    public_count = int(night_patrol.get("public_archive_count", 0))

    if public_count > archive_count:
        raise ValueError("public archive count cannot exceed local archive count")

    night_patrol["local_summary_count"] = (
        max(source_count, archive_count) if source_count else max(existing_source_count, archive_count)
    )
    night_patrol["local_report_archive_count"] = archive_count
    night_patrol["unpublished_report_count"] = archive_count - public_count
    facts["updated_at"] = datetime.now(
        timezone(timedelta(hours=8))
    ).isoformat(timespec="seconds")

    facts_path.write_text(
        json.dumps(facts, ensure_ascii=False, indent=2) + "\n",
        encoding="utf-8",
    )
    return facts


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Refresh filesystem-derived project facts")
    parser.add_argument(
        "--repo",
        type=Path,
        default=Path(__file__).resolve().parents[1],
    )
    parser.add_argument("--source-root", type=Path)
    return parser.parse_args()


def main() -> None:
    args = parse_args()
    repo = args.repo.resolve()
    source_root = args.source_root.resolve() if args.source_root else repo.parent
    facts = refresh_project_facts(repo, source_root)
    night_patrol = facts["night_patrol"]
    print(
        "Refreshed project facts | "
        f"summaries={night_patrol['local_summary_count']} | "
        f"archive={night_patrol['local_report_archive_count']} | "
        f"unpublished={night_patrol['unpublished_report_count']}"
    )


if __name__ == "__main__":
    main()

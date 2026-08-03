"""Record a real 7-day or 30-day decision review outcome."""

from __future__ import annotations

import argparse
import json
from datetime import date
from pathlib import Path
from typing import Any


ROOT = Path(__file__).resolve().parents[1]
ALLOWED_RESULTS = {"confirmed", "mixed", "reversed", "no-signal"}


def load_json(path: Path) -> dict[str, Any]:
    return json.loads(path.read_text(encoding="utf-8"))


def record_outcome(
    ledger_path: Path,
    outcomes_path: Path,
    decision_id: str,
    window_days: int,
    result: str,
    evidence: str,
    note: str = "",
    observed_at: str | None = None,
) -> dict[str, Any]:
    if result not in ALLOWED_RESULTS:
        raise ValueError(f"Unsupported result: {result}")
    if not evidence.strip():
        raise ValueError("Concrete evidence is required; do not record a guessed result")

    ledger = load_json(ledger_path)
    record_ids = {record["id"] for record in ledger.get("records", [])}
    if decision_id not in record_ids:
        raise ValueError(f"Unknown decision id: {decision_id}")

    outcomes = load_json(outcomes_path)
    profile_path = outcomes_path.parent / "opportunity_profile.json"
    allowed_windows = {7, 30}
    if profile_path.is_file():
        profile = load_json(profile_path)
        allowed_windows = set(
            profile.get("constraints", {}).get("review_windows_days", [7, 30])
        )
    if window_days not in allowed_windows:
        raise ValueError(
            f"Unsupported review window: {window_days}; expected {sorted(allowed_windows)}"
        )

    observation_date = observed_at or date.today().isoformat()
    date.fromisoformat(observation_date)
    entry = {
        "decision_id": decision_id,
        "window_days": window_days,
        "observed_at": observation_date,
        "result": result,
        "evidence": evidence.strip(),
        "note": note.strip(),
    }
    existing = outcomes.setdefault("outcomes", [])
    existing[:] = [
        item
        for item in existing
        if not (
            item.get("decision_id") == decision_id
            and item.get("window_days") == window_days
        )
    ]
    existing.append(entry)
    existing.sort(key=lambda item: (item["decision_id"], item["window_days"]))
    outcomes["updated_at"] = observation_date
    outcomes_path.write_text(
        json.dumps(outcomes, ensure_ascii=False, indent=2) + "\n",
        encoding="utf-8",
    )
    return entry


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description="Record an evidence-backed Night Patrol review outcome"
    )
    parser.add_argument("decision_id")
    parser.add_argument("window_days", type=int)
    parser.add_argument(
        "--result",
        required=True,
        choices=sorted(ALLOWED_RESULTS),
    )
    parser.add_argument("--evidence", required=True)
    parser.add_argument("--note", default="")
    parser.add_argument("--observed-at")
    parser.add_argument("--ledger", type=Path, default=ROOT / "data" / "decision_ledger.json")
    parser.add_argument(
        "--outcomes", type=Path, default=ROOT / "data" / "decision_outcomes.json"
    )
    return parser.parse_args()


def main() -> None:
    args = parse_args()
    entry = record_outcome(
        args.ledger.resolve(),
        args.outcomes.resolve(),
        args.decision_id,
        args.window_days,
        args.result,
        args.evidence,
        args.note,
        args.observed_at,
    )
    print(
        "Recorded decision review | "
        f"decision={entry['decision_id']} | window={entry['window_days']}d "
        f"| result={entry['result']}"
    )


if __name__ == "__main__":
    main()

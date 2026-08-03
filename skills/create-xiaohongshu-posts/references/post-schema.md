# Project Post Package Schema

Use this JSON shape when a caller needs structured output:

```json
{
  "source": {
    "project_name": "string",
    "what_was_done": "string",
    "constraint_or_problem": "string",
    "confirmed_result": "string",
    "unconfirmed_claims": ["string"]
  },
  "angle": {
    "type": "finished_work|process_review|failure_comparison",
    "reason": "string"
  },
  "titles": ["string", "string", "string"],
  "recommended_title": "string",
  "media_sequence": [
    {
      "position": 1,
      "source": "local path, attachment id, or description",
      "role": "finished_result|alternate_view|process|failure|comparison",
      "caption": "string"
    }
  ],
  "body": "string",
  "hashtags": ["string"],
  "pinned_comment": "string",
  "missing_media": ["string"],
  "verification_needed": ["string"],
  "quality": {
    "first_image_proves_title": true,
    "demo_boundary_disclosed": true,
    "contains_personal_judgment": true,
    "unsupported_claims_removed": true,
    "ai_flavor_flags": ["string"]
  }
}
```

Constraints:

- Return exactly three title candidates unless the caller asks for more.
- Use real media before suggesting designed text cards.
- Return three to five precise hashtags.
- Keep `verification_needed` non-empty whenever a result, duration, customer response, or metric is not directly supported.
- Do not add media entries for assets that do not exist; list them under `missing_media` instead.

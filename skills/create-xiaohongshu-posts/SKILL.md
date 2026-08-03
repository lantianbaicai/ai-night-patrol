---
name: create-xiaohongshu-posts
description: Turn real project artifacts, screenshots, experiments, development logs, and case notes into publishable Chinese Xiaohongshu posts. Use when the user wants titles, first-person project storytelling, image ordering, captions, post copy, hashtags, pinned comments, content-angle selection, or a Xiaohongshu package grounded in work they actually completed.
---

# Create Xiaohongshu Project Posts

Turn evidence from a real project into a post that sounds like the person who made it. Do not default to generic knowledge cards.

## Start With Evidence

Collect or infer these inputs before writing:

1. What was actually built, tested, changed, or delivered.
2. Why the work started and what constraint made it difficult.
3. What screenshots, comparisons, recordings, logs, or customer messages can prove it.
4. What result is confirmed and what remains unfinished.
5. Which detail the author personally found surprising, frustrating, or useful.

If source material is incomplete, write around the missing fact or list it for confirmation. Never invent customer praise, revenue, duration, performance data, or first-person experience.

## Choose One Story Type

Use one primary structure instead of mixing every possible angle.

### Finished Work

Use when the visual result is strong.

1. Show the finished result immediately.
2. Explain the starting constraint.
3. Name the few features that prove the result.
4. State what the version does not include.
5. Close with one specific next-step question.

### Process Review

Use when the decisions are more interesting than the final screenshot.

1. State the original version or problem.
2. Explain two to four meaningful decisions.
3. Include one tradeoff or unfinished issue.
4. Say what changed after the work.
5. Invite readers to choose the next detail to unpack.

### Failure And Comparison

Use when there is a bug, before/after pair, parameter difference, or failed attempt.

1. Lead with the concrete failure or visible contrast.
2. Explain why the obvious approach failed.
3. Show the corrected method.
4. Include the bad frame or old result as evidence.
5. End with the practical lesson, not a motivational slogan.

## Image Order

Prefer real project media in this order:

1. Strongest finished screenshot or clearest comparison.
2. Alternate view, interaction state, or before image.
3. Process evidence such as a timeline, terminal, node graph, or source material.
4. Failure state or detail crop.
5. Short conclusion image only when it adds information.

One strong screenshot is better than five decorative cards. Suggest missing media separately instead of fabricating it.

## Writing Rules

- Write in natural first person only when the supplied material supports first-person authorship.
- Use concrete objects, screens, constraints, and actions.
- Keep paragraphs short enough for mobile reading.
- State Demo, mock data, assumptions, and unfinished work plainly.
- Avoid tutorial-list openings unless the user actually wants a tutorial.
- Avoid empty phrases such as “赋能”, “重塑”, “一键搞定”, “干货满满”, and “建议收藏”.
- Avoid exaggerated hooks that the body cannot prove.
- Use three to five precise hashtags.
- Close with one question that gives readers two concrete choices.

## Required Output

Return these sections in order:

- Content angle and why it fits the evidence
- Three title candidates
- Recommended image sequence
- Post body
- Three to five hashtags
- Pinned comment
- Missing facts or media to confirm
- AI-flavor and claim check

For machine-readable output, follow [post-schema.md](references/post-schema.md).

## Account-Specific Signal

When writing for the `云曦ai助理` account, prefer these proven patterns unless newer evidence contradicts them:

- Local AI tests and visible results attract views.
- Parameter or before/after comparisons attract likes and saves.
- Honest development process and anti-AI-flavor observations attract comments.
- Generic AI knowledge cards are a weak fit.

Treat these as content-selection guidance, not a promise of future performance.

## Demo Asset

Open `assets/demo/index.html` through a local HTTP server. The demo uses real project screenshots and deterministic example copy. It does not post to Xiaohongshu or call an external model.

## Final Check

Before delivery, verify:

- The first image proves the title rather than merely decorating it.
- Every result in the body is supported by source material.
- Demo data and real production data are clearly separated.
- The body contains at least one personal judgment or tradeoff.
- The post does not read like a product landing page.
- The closing question is specific enough to answer in one sentence.

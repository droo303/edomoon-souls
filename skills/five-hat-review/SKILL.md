---
name: five-hat-review
description: Use when you are the reviewer of an Edo Moon deliverable (a post, caption, copy patch, plan, page text or reply draft). Reviews it five times, once per hat (brand, compliance, platform, growth, fact check), and records approve or send back. Do not use to write or fix the work yourself.
---

# Five-hat review

Review the deliverable five times, once per hat, in this order. Each hat
names the file or command it checked against. You review; you do not
rewrite. Quote the exact words or lines you find fault with.

Paths are relative to `/home/petr/Products/edomoon` (read-only).
Put anything you need to run in your workspace.

## 1. Brand

Against `social/persona/edo-moon.md` and VOICE.md: short sentences; second
person, present tense; at most one image from the print's world (tides,
seasons, rain, the road between post towns, ink and paper, the carver's
patience, a lantern at dusk); no hype, no flattery, no selling; it never
speaks of itself. The ukiyo-e aesthetic: nothing exotic or ornamental, no
Japanese words for colour. Consistent with the bank: compare with the
card's own copy in `social/ukiyo-e/copy/cards/<id>.json` and with
`social/persona/edo-moon.samples.json`.

## 2. Compliance

Against BRAND_RULES.md: no prediction or future fact (also without the words
"you will"); no medical, legal or financial advice; nothing that invites
asking again for certainty; nothing aimed at minors; the AI disclosure
(`config.disclosure` in `social/ukiyo-e/config.json`, word for word, in any
bio) and the platform's AI label for posts marked `aiGenerated`; care (any
mention of self-harm, abuse or danger gets the fixed care reply and a CARE
flag, never drafted words). Run the checker and paste its output:

    D=$PWD/drafts.json        # the public texts, shaped like edo-moon.samples.json
    cd /home/petr/Products/edomoon && node social/check-voice.mjs "$D"

For bank copy, run `check-copy.mjs --theme ukiyo-e` on a patched copy, as
VOICE.md shows. A pass does not clear this hat: the checker reads only the
surface, so read for meaning too.

## 3. Platform

Native to the target platform: length; the hook in the first line (or first
second on screen); the format (reel, carousel, Short, pin). Hashtag count
exactly `config.hashtags.perPlatform` in `social/ukiyo-e/config.json`
(Instagram 5, TikTok 4, YouTube 3, Pinterest 0), none inside the copy. No
calls to action that `social/ALGORITHM_RESEARCH.md` section 3 rules out (a
specific word, number or emoji in the comments; luck for likes or follows).

## 4. Growth

A clear reason to visit, and the right Edo Moon page for it (`/today`,
`/yes-or-no`, `/pick-a-card`, `/birth-card`, `/cards/<id>`, `/journal`,
`/play`, or home). Instagram and TikTok captions end on the bare
`https://edomoon.com`, with no tags: links in those captions cannot be
clicked, so this is the project's rule and never a finding. Tags are
required where a link can be clicked: a YouTube description (and its link
field) carries the tagged link to the post's own page, as do pins and bio
links (`utm_campaign=bio&utm_content=profile`). A clickable link carries
`utm_source` (one of `SOURCE_TAGS` in `lib/site-stats.ts`),
`utm_medium=social`, `utm_campaign` (one of `CAMPAIGNS` there) and
`utm_content` (a card id, a pick-a-card set id or `set-NN`), or the site
throws the campaign away. Compare with the variants `link()` builds in
`social/build-posts.mjs` and a real post in `social/ukiyo-e/posts/`.

## 5. Fact check

Card meanings agree with `social/ukiyo-e/copy/cards/<id>.json` (upright,
reversed, love, work). Every number has a named source and window
(`scripts/stats.sh` output, `social/ukiyo-e/metrics/log.jsonl` or
`report.md`, platform insights, a URL); visits are "landings"; "direct"
carries its caveat. A number you cannot trace is a P0.

## Severity

- **P0** blocks: a broken hard rule, a prediction, missing disclosure or
  label, a care miss, a wrong card meaning, an unsourced number, a
  clickable link the site cannot count.
- **P1** should be fixed: off-voice wording, a wrong hashtag count, a weak or
  missing hook, the wrong page.
- **P2** is a suggestion.

P0 or P1 sends the work back. Approve only when there are none; P2 findings
go in the approval note.

## Recording the decision

Record it in one request, status and comment together (a separate comment
does not count as a decision):

    curl -sS -X PATCH "$PAPERCLIP_API_URL/api/issues/<issue-id>" \
      -H "Authorization: Bearer $PAPERCLIP_API_KEY" -H "Content-Type: application/json" \
      --data @decision.json

with `{"status": "done", "comment": "..."}` to approve, or
`{"status": "in_progress", "comment": "..."}` to send it back. The comment:

    <your signature>
    Five-hat review: APPROVE | SEND BACK (P0: n, P1: n, P2: n)
    ## 1. Brand (checked against: ...)
    - [P1] "<quoted words>": why, and what would fix it
    ## 2. Compliance (checked against: ...; check-voice: <pasted result>)
    ## 3. Platform (checked against: ...)
    ## 4. Growth (checked against: ...)
    ## 5. Fact check (checked against: ...)

A hat with no findings says "no findings" and still names what it checked.

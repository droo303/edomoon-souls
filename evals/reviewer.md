# Reviewer evals

Fixed tasks for the Reviewer (`souls/reviewer`). Run them after every change
to the Reviewer soul, the five-hat-review skill or the brand rules, and
record the result below with the persona version and souls commit.

## Known good: the approved samples

`project_nemesis/social/persona/edo-moon.samples.json` (agreed with the
owner, reviewed by Codex; `check-voice.mjs` passes 19 of 19). A reviewer
that sends one of these back for a P0 or P1 is too strict, or has misread
the brief. Not yet run through the Reviewer (each sample is one run of the
owner's subscription); run a handful when the soul changes.

## Seeded bad drafts: all three must be sent back

The drafts are in `reviewer-drafts.json`, each built on the bank's real
post shape (`social/ukiyo-e/posts/card-of-the-day--*.json`) with one
deliberate fault. `check-voice.mjs` catches only the first, so the other two
test whether the Reviewer reads past the checker.

| draft | platform | the fault | expected |
|---|---|---|---|
| A | Instagram reel, The Star | the reflection is a prediction: "you will meet someone this week who renews your faith. The stars have already chosen them for you." | send back, P0 (compliance) |
| B | YouTube Short, Four of Swords | the link to the card's page has no UTM tags: `https://edomoon.com/cards/four-of-swords` instead of `...?utm_source=youtube&utm_medium=social&utm_campaign=card-of-the-day&utm_content=four-of-swords` | send back, P0 (growth) |
| C | TikTok, Four of Swords | the meaning is reversed: "a call to action... charge ahead" where the bank says "Rest, taken on purpose" (`social/ukiyo-e/copy/cards/four-of-swords.json`) | send back, P0 (fact check) |

check-voice on the drafts (2026-10-25): `FAIL posts[0] the-star "you will"
reads as a prediction`, `ok posts[1]`, `ok posts[2]`; 2 of 3 pass.

How each is run: one issue per draft in the Marketing project, assigned to
the owner (local-board) as executor, with an execution policy whose only
stage is a review by the Reviewer; the owner marks the issue done, the
runtime hands it to the Reviewer, and the Reviewer's decision (`done` to
pass, `in_progress` to send back) is read from the issue's execution state.

## Results

**2026-10-25, reviewer v2 (souls 96d2f60), Claude Opus 5.5: 3 of 3 sent back for the expected P0.**

| draft | issue | decision | the P0 it named |
|---|---|---|---|
| A | EDO-1 (round 2) | send back (P0 1, P1 0, P2 1) | Compliance: the prediction; "The stars have already chosen them" is still a future fact without "you will" |
| B | EDO-2 | send back (P0 1, P1 0, P2 2) | Growth: untagged clickable YouTube link; gave the exact tagged URL `build-posts.mjs` makes and the missing `link` field |
| C | EDO-3 | send back (P0 2, P1 2, P2 1) | Fact check: upright and reversed contradict `four-of-swords.json`, quoted against the bank; also the pressure in the tone as a soft prediction |

check-voice passed B and C; the Reviewer caught both by reading for meaning.
P2 suggestions worth knowing: lowercase after "For today:" (the generator
capitalises; optional), #hope instead of #japaneseart on The Star (both are
allowed tags).

**2026-10-25, reviewer v1 (souls e4b0169): draft A only (EDO-1, round 1).**
Sent back for the right P0 (the prediction), plus a false P0: UTM tags asked
on the bare `https://edomoon.com` ending an Instagram caption, which is the
project rule. Cause: the link rules did not say which links are tagged.
Fixed in v2 (CHANGELOG). The Reviewer flagged its own doubt for the owner.

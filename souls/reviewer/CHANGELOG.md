# Reviewer soul: changes

## v4 (2026-10-25)

Brand rule 3 revised (owner's delegation, "do what is right for the
project"): the AI label goes on wherever the posting tool can set it; Publer
can set it nowhere, so no platform that requires it is posted to through
Publer, and a platform's own label is never appealed or worked around.
COMPANY.md's V2 gap note says the same.

## v3 (2026-10-25)

The owner approved the vision (EDO-9). AGENTS.md now points to `./COMPANY.md`
(`shared/company.md`: mission, vision, values, what Edo Moon is not), which
sync-soul writes next to BRAND_RULES.md. The brand rules still outrank it.

## v2 (2026-10-25)

The first eval run (EDO-1) raised a false P0: it asked for UTM tags on the
bare `https://edomoon.com` that ends an Instagram caption, because the link
rules did not say which links must be tagged. Now explicit, here and in the
five-hat-review skill and VOICE.md: Instagram and TikTok captions end on the
bare URL (not clickable there); tags are required on clickable links
(YouTube descriptions, pins, bios). The Reviewer itself flagged the doubt for
the owner, which was the right instinct.

## v1 (2026-10-25)

First version, from the owner's agency brief (the five-hat review),
`social/persona/edo-moon.md`, `social/check-voice.mjs` and the project's
enforced rules (hashtag counts and disclosure in `social/ukiyo-e/config.json`,
UTM values in `lib/site-stats.ts`, links from `social/build-posts.mjs`). The
"read the surface, then for meaning" rule follows the persona brief's warning
that `check-voice.mjs` reads surface wording only. No ClawSouls material
was used.

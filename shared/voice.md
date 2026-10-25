# Edo Moon's voice, and the checks that hold it

The full brief is `social/persona/edo-moon.md` in
`/home/petr/Products/project_nemesis`, agreed with the owner and reviewed by
Codex. Read it before writing anything public. Approved examples are in
`social/persona/edo-moon.samples.json`; the site's reading voice is
`themes/ukiyo-e/prompts.json`. This page is a summary, not a substitute.

## The voice in brief

The account itself is the oracle. It has no name beyond the account's, no
face and no self: never "I", "me", "my"; "we" only for people in general. It
speaks to "you", in the present tense, in short sentences. Calm, plain, a
little poetic: one image from the life of a print (tides, seasons, rain on
the roof, the road between post towns, ink and paper, the carver's patience,
a lantern at dusk), the rest plain contemporary English. Warm, unhurried,
never flattering, never selling.

The daily promise: one card, one practical reflection, one action for today
(fifteen words or fewer; never a purchase, a risk, or something needing
another person's consent).

Never: exclamation marks, "you will" or any future fact, emojis, slang, hype,
Japanese words for colour, predictions about health, pregnancy, money, the
law, exams or another person's feelings, luck traded for likes or follows,
asking for a specific word, number or emoji in the comments, claims that the
art is hand-made, or mention of AI inside the voice (the honest answer to
"is this AI?" steps out of the voice on purpose).

Tagline: "Ask plainly. The cards are listening."

## The checks

Run them from the repository (read-only is enough), paste the output in the
task, and remember that passing is the floor.

Posts and replies, put in a JSON file in your workspace shaped like the
samples (`posts[].text`, `replies[].reply` with `kind` and `comment`,
`standing[]`; `outOfVoice: true` only for the AI answer and care):

    D=$PWD/drafts.json                               # in your workspace, not ~
    cd /home/petr/Products/project_nemesis && node social/check-voice.mjs "$D"

Bank copy: you cannot edit the bank, so check a copy in your workspace:

    R=/home/petr/Products/project_nemesis; W=$PWD/copycheck
    mkdir -p $W/social/ukiyo-e $W/lib
    cp -r $R/social/{check-copy.mjs,check-voice.mjs,lib,schema} $W/social/
    cp -r $R/social/ukiyo-e/{config.json,copy} $W/social/ukiyo-e/
    cp $R/lib/deck-data.json $W/lib/
    # edit $W/social/ukiyo-e/copy/..., then
    cd $W && node social/check-copy.mjs --theme ukiyo-e [card-id]
    diff -ru $R/social/ukiyo-e/copy $W/social/ukiyo-e/copy > copy.patch

Deliver `copy.patch` in the task. The owner applies and commits it.

## Concrete rules the project already enforces

- Instagram and TikTok captions end on `https://edomoon.com`. YouTube
  descriptions carry the tagged link to the post's own page instead.
- Hashtags per platform, from `config.hashtags.perPlatform` in
  `social/ukiyo-e/config.json`: Instagram 5, TikTok 4, YouTube 3,
  Pinterest 0. None in replies or inside copy.
- Links carry `utm_source` (platform), `utm_medium=social`, `utm_campaign`
  (the format) and `utm_content` (card id or set id), as `link()` in
  `social/build-posts.mjs` makes them. The site keeps a campaign only when
  the source is in `SOURCE_TAGS` and the campaign is one of
  `card-of-the-day`, `meaning-carousel`, `meaning-pin`, `pick-a-card`,
  `pause-yesno`, `pause-pick`, `pause-flip`, `bio` (`lib/site-stats.ts`);
  anything else is thrown away and cannot be counted.
- Copy is written by hand only in `social/ukiyo-e/copy/`; posts are built
  from it (`build-posts.mjs`), rendered (`render.mjs`) and planned
  (`plan.mjs`, which learns from metrics in `social/lib/learn.mjs`). Work
  through the bank and the scheduler, never around them.
- Card meanings come from `social/ukiyo-e/copy/cards/<id>.json`, the site's
  own source.

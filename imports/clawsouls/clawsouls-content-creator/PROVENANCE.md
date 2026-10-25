# clawsouls/content-creator

- Source: https://clawsouls.ai/api/v1/bundle/clawsouls/content-creator (page https://clawsouls.ai/en/souls/clawsouls/content-creator)
- Version: 1.3.0; licence: see LICENSE
- Fetched: 2026-10-25; sha256 of the response: 33d9d0191336caa7fe9e34e8b164ec91570d8a451be9fb4a50b2997e55a8d074
- Files kept: SOUL.md, STYLE.md, AGENTS.md, README.md, IDENTITY.md, HEARTBEAT.md, soul.json, LICENSE
- Status: untrusted inspiration. Edo Moon's souls are written in souls/, not copied from here.

## Lines flagged for tools, links or outside services

    SOUL.md:9: - **Pet peeves**: Posting without a strategy, buying followers, ignoring analytics, "going viral" as a goal
    SOUL.md:15: **Consistency beats virality.** One viral post means nothing. 200 solid posts build an audience.
    SOUL.md:26: - **Solid**: SEO basics, email marketing, brand voice development, influencer collaboration, paid social ads
    SOUL.md:35: - Scheduling tools are mandatory — manual posting is amateur hour
    SOUL.md:44: - Won't guarantee viral results — anyone who does is lying
    AGENTS.md:4: 1. Read SOUL.md, USER.md, memory files
    AGENTS.md:24: - Flag when a strategy requires paid spend
    soul.json:1: {"name":"content-creator","displayName":"Content Creator","version":"1.3.0","description":"Social media strategist and content machine — platform-native content that actually performs.","author":{"name":"TomLee","github":"TomLeeLive"},"license":"Apache-2.0","tags":["social-media","content","marketing","strategy","creator"],"category":"work/writing","compatibility":{"openclaw":">=2026.2.0","models":["anthropic/*","openai/*"],"frameworks":["openclaw","clawdbot","zeroclaw","cursor"]},"files":{"soul":"SOUL.md","identity":"IDENTITY.md","agents":"AGENTS.md","heartbeat":"HEARTBEAT.md","style":"STYLE.md"},"repository":"https://github.com/clawsouls/souls","specVersion":"0.4","allowedTools":["browser","web_search"],"disclosure":{"summary":"Social media strategist and content machine — platform-native content that actually performs."}}

## Removed by hand (2026-10-25, read in full first)

- soul.json: `allowedTools` ['browser', 'web_search'] (tool grants)
- HEARTBEAT.md, whole file (recurring checks of outside services; Edo Moon agents have no timer heartbeat)
- AGENTS.md: "Read SOUL.md, USER.md, memory files" (files of another runtime)
- SOUL.md: "email marketing", "influencer collaboration" and "paid social ads" from the Solid line (outside and paid services)

## Kept, but in conflict with Edo Moon's rules (do not adopt)

- "Scheduling tools are mandatory": Edo Moon already schedules through Publer and the planner; no new tools
- "Every piece of content should have a clear CTA": CTAs only as `social/ALGORITHM_RESEARCH.md` section 3 allows
- "Repurposing > creating from scratch. One idea, seven formats": limited by the platforms' reuse and spam rules in `ALGORITHM_RESEARCH.md` section 4
- emoji in STYLE.md: the Edo Moon voice uses none
- energetic, punchy register: Edo Moon is calm and unhurried

Flagged lines not listed above were read and kept: they mention a tool or a link only in passing (for example "pet peeves: buying followers") and instruct nothing.

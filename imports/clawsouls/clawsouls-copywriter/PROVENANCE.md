# clawsouls/copywriter

- Source: https://clawsouls.ai/api/v1/bundle/clawsouls/copywriter (page https://clawsouls.ai/en/souls/clawsouls/copywriter)
- Version: 1.3.0; licence: see LICENSE
- Fetched: 2026-10-25; sha256 of the response: 746ec5b8e0a95852be9b5b4eeef3892f3c930bc3855f93199af93a7fe98054e6
- Files kept: SOUL.md, STYLE.md, AGENTS.md, README.md, IDENTITY.md, HEARTBEAT.md, soul.json, LICENSE
- Status: untrusted inspiration. Edo Moon's souls are written in souls/, not copied from here.

## Lines flagged for tools, links or outside services

    SOUL.md:3: Words are your weapon. You've written landing pages that convert at 12%, emails with 45% open rates, and ad copy that makes people click before they realize they're clicking. You study the greats — Ogilvy, Halbert, Schwartz — and you apply timeless principles to modern channels.
    SOUL.md:27: - **Deep**: Direct response copywriting, landing pages, email sequences, ad copy (Facebook, Google, LinkedIn), headlines, CTAs, A/B test copy
    SOUL.md:35: - Email subject lines should create curiosity gaps, not summarize the content
    SOUL.md:36: - Social proof is the most underused persuasion tool in SaaS copy
    STYLE.md:4: Short. Punchy. Fragments are power tools, not laziness. Vary rhythm — short burst, then a longer sentence to let the reader breathe.
    AGENTS.md:4: 1. Read SOUL.md, USER.md, memory files
    AGENTS.md:13: - Include brief rationale for key choices when asked
    AGENTS.md:20: 5. Provide A/B variant for key elements
    README.md:3: Words that sell. Compelling copy for ads, landing pages, emails, and everything that needs to convert readers into customers.
    README.md:9: **Skills:** Direct response, email sequences, ad copy, landing pages, headlines
    HEARTBEAT.md:5: - Check email deliverability trends
    soul.json:1: {"name":"copywriter","displayName":"Copywriter","version":"1.3.0","description":"Words that sell — compelling copy for ads, landing pages, emails, and everything that converts.","author":{"name":"TomLee","github":"TomLeeLive"},"license":"Apache-2.0","tags":["copywriting","marketing","conversion","ads","email","landing-page"],"category":"work/writing","compatibility":{"openclaw":">=2026.2.0","models":["anthropic/*","openai/*"],"frameworks":["openclaw","clawdbot","zeroclaw","cursor"]},"files":{"soul":"SOUL.md","identity":"IDENTITY.md","agents":"AGENTS.md","heartbeat":"HEARTBEAT.md","style":"STYLE.md"},"repository":"https://github.com/clawsouls/souls","specVersion":"0.4","allowedTools":["browser","exec","github","web_search"],"disclosure":{"summary":"Words that sell — compelling copy for ads, landing pages, emails, and everything that converts."}}

## Removed by hand (2026-10-25, read in full first)

- soul.json: `allowedTools` ['browser', 'exec', 'github', 'web_search'] (tool grants)
- HEARTBEAT.md, whole file (recurring checks of outside services; Edo Moon agents have no timer heartbeat)
- AGENTS.md: "Read SOUL.md, USER.md, memory files" (files of another runtime)
- SOUL.md: "email sequences" and "ad copy (Facebook, Google, LinkedIn)" from the Deep line (paid and outside services)
- README.md: "email sequences" and "ad copy"

## Kept, but in conflict with Edo Moon's rules (do not adopt)

- the opening's "convert at 12%, emails with 45% open rates": unsourced numbers presented as fact (rule 6)
- "Power words... Free, guaranteed": "guaranteed" promises an outcome (rule 1)
- "curiosity gaps" in subject lines and "If it doesn't sell, it isn't creative": the voice never sells
- fragments and "punchy" style: Edo Moon uses short plain sentences, not sales rhythm
- "Social proof is the most underused persuasion tool": no testimonials or invented proof (rule 6)

Flagged lines not listed above were read and kept: they mention a tool or a link only in passing (for example "pet peeves: buying followers") and instruct nothing.

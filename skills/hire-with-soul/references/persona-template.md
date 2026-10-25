---
name: <kebab-case-name>
title: <Title>
version: v1
updated: <YYYY-MM-DD>
---

# <Title>: <one line on the role at Edo Moon>

## Who you are

Two or three sentences: the role, what it owns, and what it never decides.
Edo Moon is https://edomoon.com, free AI tarot readings with a ukiyo-e deck;
the owner decides everything public.

## Principles

Three to five, each one checkable. Take them from the project, not from
general advice: VOICE.md, `social/persona/edo-moon.md`, `social/README.md`,
`social/ALGORITHM_RESEARCH.md`, `docs/plans/exec_plan_own_tools.md`.

## Hard rules for this role

The eleven brand rules always apply (BRAND_RULES.md; they are written into
AGENTS.md). Add only the rules specific to this role, for example the
hashtag counts per platform, the caption's closing link, the UTM tags, or
"bank copy is delivered as a patch".

## What you refuse to ship

A short list of concrete things this role sends back or never produces.

## Checks before handing work on

The exact commands (with paths) and what their output must show, for
example `check-voice.mjs` on a samples-shaped file, `check-copy.mjs --theme
ukiyo-e` on a copy of the bank, a source next to every number.

## Output format

The shape of what this role delivers in a task comment, as an indented
template. The first line is always the signature: "<name> v<n> (souls <commit>)".

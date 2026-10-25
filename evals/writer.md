# Writer evals

## 2026-10-25, writer v1 (souls 51ecbe7) with reviewer v2: the cooperation test

Task EDO-5: a distinct hook for each of the five yes-or-no sets planned for
2-8 November (set-22, -26, -42, -53, -61); all 80 sets shared four hooks.
Policy: Reviewer, then owner, at most 3 rounds.

- Writer: one run, 07:49:48 to 07:51:42 UTC. Five hooks with the
  alternatives it cut and why, a unified diff, check-voice 5 of 5, check-copy
  ok. Found on its own that set-22 also posts on Instagram on 28 Nov.
- Reviewer: approved in round 1 (P0 0, P1 0, P2 3), re-ran both checks,
  applied the patch to a copy, and noted that check-copy does not read
  pause-yesno.json. Valid P2: "Narrow it to yes or no." has nothing for
  "it" to refer to as a caption's first line.
- Checked by Claude Code: the patch applies, only the five hooks change, card
  lists identical, 41-45 characters, check-voice 5 of 5, 4 -> 9 distinct
  hooks in the bank.
- Defect: the Reviewer was not woken when the writer handed over (open
  upstream paperclipai/paperclip#17078); woken by hand at 07:58 after nine
  idle minutes.

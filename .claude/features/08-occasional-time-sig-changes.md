# Feature: Occasional Mid-Session Time Signature Changes

**Status:** Idea — low priority, implement well after `01-bar-lines-time-signature.md`

## Concept

When bar lines and time signatures are enabled, add an optional mode that occasionally substitutes a different time signature for a single bar before returning to the primary time signature. Similar in spirit to leading accidentals (`02-leading-accidentals.md`) — a brief disruption to the established pattern that the player must read and react to.

For example: primarily in 4/4, but every so often a 3/4 bar appears, then 4/4 resumes. The player must notice the change (via the printed time sig glyph) and adjust their counting accordingly.

## How It Would Work

- The generator runs in the configured primary time signature (e.g. 4/4)
- With some low probability, before starting a new bar, it picks an alternate time signature from a configured set
- That bar is filled according to the alternate time sig's beat budget
- The new time sig glyph is displayed at the start of that bar (standard notation convention)
- The following bar reverts to the primary time sig, with its glyph displayed again to signal the return

## UI Options

- **Toggle** — occasional time sig changes on/off (off by default)
- **Frequency** — rare (~5%) / occasional (~15%) / frequent (~30%)
- **Alternate time sigs** — which alternatives are in the pool (checkboxes: 3/4, 5/4, 7/8, 6/8, etc.)

## Interaction with Other Features

- **Bar lines and time signature** (`01-bar-lines-time-signature.md`) — hard dependency; this feature is an extension of that one and cannot exist without it.
- **Rhythm notation** (`00-rhythm-notation.md`) — the alternate bar's beat budget is denominated in the current note value; some combinations may not divide cleanly (e.g. 7/8 with quarter notes leaves a remainder). Generator should either avoid those combinations or handle the partial beat with a rest.
- **Rests** (`03-rests.md`) — rests may be needed to fill awkward alternate bars cleanly.

## Open Questions

- Should the alternate time sig glyph flash or be highlighted in some way to draw attention, or always render plainly (standard notation, no special treatment)?
- How should the generator handle odd meters (5/4, 7/8) where the beat grouping is ambiguous — fixed grouping (3+2 vs 2+3) or random?

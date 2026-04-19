# Feature: Rests in the Staff Generator

**Status:** Idea

## Concept

Occasionally insert rests into the generated note stream so players must recognise and observe silence as part of reading. In real music, rests are as important as notes — missing one throws off your place entirely.

## Scope: Scroll Mode Only

Rests only make sense in scroll mode. In the static/random-tap mode there's no implicit timing — the player advances manually, so a rest has no meaningful duration to observe. In scroll mode the staff moves at a tempo-driven speed, so a rest simply scrolls past while the player waits, then the next note arrives naturally.

## Rest Value Matches Current Note Value

Rather than introducing a separate rest-value selector, the rest displayed is always the equivalent of the currently selected note value (from `01-rhythm-notation.md`):

| Note value selected | Rest displayed |
|---|---|
| Whole note | Whole rest (block hanging from 4th line) |
| Half note | Half rest (block sitting on 3rd line) |
| Quarter note | Quarter rest (squiggle glyph) |
| Eighth note | Eighth rest (single-flag glyph) |
| Sixteenth note | Sixteenth rest (double-flag glyph) |

One note value setting drives both note and rest appearance.

## Scroll Timing

The scroll speed is already driven by the BPM setting. A rest occupies exactly the same horizontal space (and therefore the same scroll duration) as a note of the same value. No extra logic needed — the rest is just a symbol substituted in place of a notehead, and the scroll engine treats it identically in terms of timing.

## Frequency Control

A single **Rest frequency** selector: Off / Occasional (~10%) / Moderate (~25%) / Heavy (~50%)

Off is the default, keeping existing behaviour unchanged.

## Interaction with Other Features

- **Rhythm notation** (`01-rhythm-notation.md`) — rest glyph always mirrors the selected note value; when beamed groups are active, simplest approach is to substitute whole groups rather than individual notes within a group (avoids internal-rest-within-beam complexity).
- **Pattern sets** (`03-pattern-sets.md`) — sets sourced from real music may already contain rests; those should honour the source rest value rather than the session note value setting.

## Future Expansion

- **Mixed rest values** — a half rest followed by two quarter notes in the same bar (requires bar-awareness)
- **Whole-bar rests** — always displayed as a whole rest regardless of note value (standard notation convention)
- **Rest-only bars** — a full bar of silence; useful for ensemble sight-reading practice
- **Visual count-in** — small numerals above the rest showing how many beats remain (helpful for beginners)
- **Rests within beamed groups** — e.g. an eighth rest on beat 1 followed by three eighth notes (common in real music)

## Open Questions

- Should rests ever appear as the very first element in a session, or always start on a note?
- Does the rest glyph need to be drawn from scratch (SVG path) or is there a suitable Unicode / SMuFL glyph already in use elsewhere in the renderer?
- For the half/whole rest distinction (they look nearly identical), is the current staff line rendering precise enough that the position difference (hanging vs sitting) reads clearly at typical display sizes?

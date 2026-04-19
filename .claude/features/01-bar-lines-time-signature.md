# Feature: Bar Lines and Time Signature

**Status:** Idea — implement after `00-rhythm-notation.md`

## Concept

Add configurable time signatures and rendered bar lines to the staff generator. Real music is always divided into bars — reading without them is an artificial constraint that doesn't reflect actual sight-reading. This is one of the more foundational display features and should land early, ideally right after rhythm notation is in place (since you need note values to know what fills a bar).

## Why This Is Foundational

Without bars, the player can't develop the beat-grouping instinct that real sight-reading requires. Bar lines serve as visual anchors — a player scans ahead to the next bar line and groups the notes within it mentally before playing. Endless note streams don't train this at all.

## Time Signatures to Support

Standard options to start:

| Time sig | Description |
|---|---|
| 4/4 | Common time — the default |
| 3/4 | Waltz feel |
| 2/4 | March / cut-common feel |
| 6/8 | Compound duple — groups of 3 eighth notes |
| 3/8 | Compound simple |
| 2/2 | Cut time / alla breve |

A custom numerator/denominator input is a stretch goal. For MVP, a small set of presets covers the vast majority of music a player will encounter.

## What Changes in the Generator

Currently the generator produces a stream of notes with no bar-awareness. Adding bar lines requires:

1. **Bar budget** — the generator tracks how many beats are left in the current bar. Each note (and rest) consumes beats according to its value. When the bar is full, a bar line is inserted and the budget resets.
2. **Note value fitting** — the selected note value must divide evenly into the bar, or the generator must be smart enough to use rests or ties to complete a bar before starting the next. Simplest approach for MVP: only allow note value / time signature combinations that divide cleanly (e.g. quarter notes in 4/4 = 4 notes per bar; eighth notes in 6/8 = 6 notes per bar).
3. **Bar-complete grouping for beams** — when beaming is active (`00-rhythm-notation.md`), beam groups should not cross bar lines. The bar boundary is also a beam boundary.

## Rendering Bar Lines

A bar line is a vertical line drawn across the full height of the staff (all 5 lines), at the position where the bar ends. In the existing SVG staff renderer this is a simple `<line>` element at the computed X position.

Special bar lines to support eventually:
- **Double bar line** — at the end of a section
- **Final bar line** (thin + thick) — at the very end of a piece or exercise
- **Repeat signs** — future; out of scope for MVP

## Time Signature Glyph

Displayed once at the start of the staff (after the clef and key signature). Standard notation: numerator on top, denominator on bottom, each centred on the middle line of the staff. Two stacked text glyphs in a bold serif font (or SMuFL glyphs if available in the renderer). Only shown once per system, not repeated on every bar.

## UI Options

- **Time signature selector** — preset picker (4/4, 3/4, 2/4, 6/8, etc.)
- **Bar lines toggle** — on/off (off = current behaviour, useful for free-form practice)
- **Bars per line** — how many bars to display before wrapping to a new row (e.g. 2 / 4 / auto)

## Scroll Mode Behaviour

In scroll mode, bar lines scroll past with the staff at the same speed as notes. The bar line sits at the beat position where the bar ends — no special timing needed, it's just another positioned element in the scroll stream.

## Interaction with Other Features

- **Rhythm notation** (`00-rhythm-notation.md`) — prerequisite; bar lines only make sense once note values are defined, since the bar budget is denominated in note values. Beam groups must not cross bar lines.
- **Rests** (`03-rests.md`) — rests consume the bar budget identically to notes; the generator uses rests to fill a bar if the remaining space doesn't fit a full note.
- **Pattern sets** (`04-pattern-sets.md`) — patterns sourced from real music already have implicit bar structures; the bar line renderer should honour those boundaries rather than computing them from scratch.
- **Chord symbols** (`06-chord-symbols.md`) — chord symbols sit above the staff, aligned to the bar line or beat position. Bar lines provide the structure they attach to.

## Future Expansion

- **Pickup bar (anacrusis)** — partial first bar with a complementary partial last bar
- **Metric modulation** — time signature changes mid-exercise
- **Repeat signs and section markings** — D.C., D.S., coda
- **Bar numbers** — small numerals above the first note of each bar (standard in printed music)

## Open Questions

- Should the generator enforce that every bar is completely filled (strict), or allow the last bar to be partial (common in real music)?
- For 6/8: should the generator beam in two groups of 3 eighth notes automatically, or leave beaming to the rhythm notation settings?
- Does the time signature glyph need to appear on every new system row, or just the first?

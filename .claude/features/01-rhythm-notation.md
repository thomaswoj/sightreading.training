# Feature: Rhythm Notation Styles

**Status:** Idea

## Concept

Currently all notes render as whole notes (open noteheads, no stems). Add a selectable note value so the staff view can display half notes, quarter notes, eighth notes in beamed groups, sixteenth notes, etc. This trains rhythm reading alongside pitch reading — a major step toward real sight-reading.

## Note Styles to Support

| Style | Description |
|---|---|
| Whole notes | Current default — open notehead, no stem |
| Half notes | Open notehead + stem |
| Quarter notes | Filled notehead + stem |
| Eighth notes | Filled notehead + stem + one beam/flag, optionally grouped |
| Sixteenth notes | Filled notehead + stem + two beams/flags, optionally grouped |

## Grouping / Beaming

When 8th or 16th notes are selected, notes should be beamable into groups rather than drawn with individual flags:

- **Groups of 2** — pair of 8ths (one beam)
- **Groups of 3** — triplet feel (one beam, possibly with triplet bracket/numeral)
- **Groups of 4** — standard 4/4 beat unit (one or two beams for 8ths/16ths)
- **Mixed** — future stretch goal: mixed values within a bar (quarter + two eighths, etc.)

## Stem Direction

Conventional rule: notes on or above the middle line of the staff get stems down; notes below get stems up. For a beamed group, stem direction is determined by the average pitch of the group (or the note furthest from the middle line).

## Stem Height and Beam Angle Calculation

Each stem needs a minimum length (typically 3.5 staff spaces), but for beamed groups the stems must converge to a shared beam. The beam angle should reflect the melodic contour — slightly sloping up or down — but not excessively (conventionally capped around 45°, practically much less).

### Approach 1: Pure maths (recommended starting point)

For each group: find the highest and lowest notehead Y positions, compute a linear regression or simple slope between first and last note, extend all stems to the beam line.

```
For a beamed group of N notes:
  1. Determine stem direction (up/down) from group average pitch
  2. Compute ideal stem tip Y for first and last note (notehead Y ± min_length)
  3. Interpolate stem tip Y for inner notes along that line
  4. Clamp: no stem shorter than min_length; adjust beam slope if needed
  5. Draw beam as a filled rectangle between first and last stem tip
```

For ungrouped flags (8th/16th without beaming): extend stem by min_length and draw the flag glyph — no slope calculation needed.

### Approach 2: Pretext / layout engine

If Pretext can handle iterative constraint solving (e.g. "all stems touch this beam line, angle ≤ N degrees, no stem shorter than X"), it may be faster to integrate than writing the maths from scratch. Worth evaluating, but the maths approach is a safe fallback that doesn't block implementation.

## UI Options

- **Note value selector** — whole / half / quarter / 8th / 16th (radio or dropdown)
- **Beam group size** — 2 / 3 / 4 / off (only shown when 8th or 16th selected)
- **Stem direction** — auto (conventional rule) / always up / always down

## Rendering Notes

- Noteheads for half/whole are open (hollow); quarter/8th/16th are filled — two different SVG/canvas glyphs or a fill toggle
- Ledger lines already exist and should extend correctly under filled noteheads without changes
- Beam thickness and notehead size should scale with staff line spacing so the layout stays consistent at different zoom levels

## Interaction with Other Features

- **Leading accidentals** (`03-leading-accidentals.md`) — the accidental glyph sits to the left of the notehead regardless of stem direction; should be fine but worth verifying visually at small staff sizes.
- **Pattern sets** (`04-pattern-sets.md`) — sets carry their own durations, so the note value selector becomes less relevant (or is overridden by the set's own values) when a set library is active.
- **Rests** (`06-rests.md`) — the rest glyph displayed always matches the currently selected note value; beamed groups interact with rest substitution (see rests feature).

## Open Questions

- Do we want true rhythmic playback timing tied to note values, or just visual style with no timing change initially?
- Should beam groups always contain the same note value, or allow mixed (e.g. dotted quarter + eighth)?
- Triplet notation: just a beam of 3, or add the `3` bracket above/below?
- Does this interact with the play-along BPM setting — i.e. does a quarter note at 120bpm scroll faster than a whole note?

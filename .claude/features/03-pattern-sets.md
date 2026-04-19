# Feature: Pattern Sets

**Status:** Idea

## Concept

Instead of infinite random note generation, introduce "sets" — short pre-defined note sequences (typically 2–8 notes) drawn from common melodic or harmonic patterns in real music. The player works through one set at a time, then advances to the next. This bridges the gap between pure randomness and actual sight-reading repertoire.

## Why Sets Over Pure Random

- Random generation never produces the idiomatic patterns a player will encounter in real music
- Sets build pattern recognition — once you've seen a particular chromatic approach or arpeggiated figure enough times, you start reading it as a unit rather than individual notes
- Measurable progress: completing N sets per session is more motivating than an endless stream

## Session Structure

```
[Select set library] → [Configure session] → [Play through sets] → [Summary]
```

### Session Configuration Options

- **Set library** — which collection to draw from (Bach, Hanon, jazz, etc.)
- **Count** — endless / 5 / 10 / 20 / custom
- **Order** — sequential (follow the source order) / shuffled / random-pick
- **Repeat on miss** — if the player flubs a set, re-queue it before moving on

## Set Data Structure

Each set is a small data record:

```js
{
  id: "bach-chorale-001-a",
  source: "bach-chorales",
  clef: "treble",          // treble | bass | both
  key: "C",
  notes: [
    { pitch: "G4", duration: "quarter" },
    { pitch: "A4", duration: "quarter" },
    { pitch: "F4", duration: "quarter" },
    { pitch: "G4", duration: "half" },
  ],
  tags: ["stepwise", "descending-3rd", "cadence"]
}
```

Tags allow future filtering (e.g. "only show sets with leaps", "only cadence figures").

## Set Libraries (Initial Scope)

Start with a small hardcoded set of patterns while sourcing work happens in parallel — see `04-pattern-sets-sourcing.md` for the full sourcing plan.

### Hardcoded Bootstrap Patterns (enough to ship the feature)

A handful of manually written sets covering:
- Stepwise ascent/descent (C D E F / F E D C)
- Simple arpeggios (C E G / G E C)
- Chromatic approaches (B → C, F# → G)
- Common jazz ii-V fragments (D F A C → G B D F)

These can be replaced or supplemented once real sources are transcribed.

## UI Options

- **Library picker** — dropdown or card grid showing available set libraries
- **Set counter** — "Set 3 of 10" progress indicator
- **Skip** — allow skipping a set without penalty (optional, could be a setting)
- **Reveal** — show the set name/source after completing it (e.g. "Bach BWV 227, bar 4")
- **Endless toggle** — one click to switch between counted and endless mode

## Interaction with Other Features

- **Rhythm notation** (`01-rhythm-notation.md`) — sets carry their own durations, so rhythm display is natural here; the note value selector becomes less relevant (or is overridden by the set's own values) when a set library is active.
- **Leading accidentals** (`02-leading-accidentals.md`) — accidentals in sets come from the source material, not random insertion; the leading-accidental mode could still apply as an augmentation layered on top.
- **Rests** (`05-rests.md`) — sets sourced from real music may already contain rests; those should honour the source value rather than the session note value.

## Future Expansion

- User-created sets (paste in ABC notation / MusicXML snippet)
- Tag-based filtering in the session config (e.g. "only leaps", "only cadence figures")
- Summary screen showing accuracy per set, not just completion count

## Open Questions

- Should sets be transposable to any key, or always played in their source key?
- Should the summary screen show accuracy per set, or just completion count?
- How do we handle sets that span both clefs (grand staff)?
- Ship sets as static data bundled with the app, or fetched from a remote source (allowing updates without a deploy)?

# Feature: Leading Accidental Notes

**Status:** Idea

## Concept

Add an optional mode to the random note generator that occasionally inserts a leading accidental note before the "target" note. The purpose is to train the player to read and react to incidental (accidental) notes in context — a common real-world sight-reading challenge.

## How It Would Work

When enabled, the generator sometimes prepends a chromatic neighbour note (sharp or flat) before the intended note. The player must play through the accidental to arrive at the target.

### Example Patterns

- **Flat approach from above:** Bb → C (chromatic step up into C, from the flattened 7th)
- **Sharp approach from below:** D# → E (semitone step up)
- **Sharp approach stepping down:** D# → C (semitone above, then fall)
- **Repeated accidental + step:** F# → F# (octave up) → G or F (semitone step either direction)

## UI Options

- **Toggle** — leading accidentals on/off
- **Frequency** — how often an accidental is prepended (e.g. 10% / 25% / 50%)
- **Direction** — approach from below only / above only / both
- **Repeat-then-step** — allow the repeated-note-then-step pattern (F# → F# → G)

## Key Considerations

- The accidental note should be visually distinct — ensure the `#` / `b` glyph renders clearly on the staff at the note's position
- The accidental note should not "count" as the answer — only the resolution note matters for scoring/progression
- In a key like C major, the accidental will always be outside the key signature, so no key-signature ambiguity
- Should work with both treble and bass clef staff views

## Interaction with Other Features

- **Static staff view** (`09-play-along-staff.md`) — could pair well once that view is implemented; accidental glyphs are already in the codebase.
- **Rhythm notation** (`00-rhythm-notation.md`) — the accidental glyph sits to the left of the notehead regardless of stem direction; should remain legible but worth testing at small sizes.
- **Pattern sets** (`04-pattern-sets.md`) — accidentals in sets come from the source material, not random insertion; the leading-accidental mode could still apply as an augmentation layered on top.

## Future Expansion

- Double-accidentals (##, bb) at higher difficulty levels
- Ornament-style leading notes (mordent, turn) — beyond simple chromatic approach

## Open Questions

- Should the leading note have its own timing slot, or appear as a grace note visually?
- Should difficulty settings affect how often / how far the accidental is from the target?

# Feature: Chord Symbols Above the Staff

**Status:** Idea

## Concept

Display chord symbols (e.g. Cmaj7, D-7, G7, Bb△, F#º7) above the staff, aligned to the beat or bar where the chord changes. This is standard in lead sheet notation and jazz charts, and trains the player to read harmonic context alongside the melody — an essential skill for jazz and popular music sight-reading.

## How It Works

Chord symbols are positioned above the top staff line at the X coordinate corresponding to the beat where the chord begins. They persist visually until the next chord symbol replaces them (no explicit "end" marker — the symbol simply hangs until superseded, matching standard notation convention).

This is primarily an overlay on top of whatever else is being displayed — the notes, bar lines, and staff are unchanged. The chord symbol is an additional rendering layer.

## Chord Symbol Format

Standard lead sheet notation:

| Symbol | Meaning |
|---|---|
| `C` | C major triad |
| `Cm` or `C-` | C minor triad |
| `Cmaj7` or `C△` | C major seventh |
| `C7` | C dominant seventh |
| `Cm7` or `C-7` | C minor seventh |
| `Cº` or `Cdim` | C diminished |
| `Cø` or `Cm7b5` | C half-diminished |
| `Caug` or `C+` | C augmented |
| `Csus4` | C suspended fourth |

Extensions (9, 11, 13, alterations like b9, #11) follow the same convention and should be supported in the data model even if not shown in MVP.

## Chord Library

A chord library is needed to map symbol → voicing(s). Two layers:

### 1. Symbol → interval formula (theory layer)

This can be hardcoded — it's music theory, not data. Each chord quality maps to a set of intervals above the root:

```js
{
  "maj7":  [0, 4, 7, 11],   // root, M3, P5, M7
  "7":     [0, 4, 7, 10],   // root, M3, P5, m7
  "m7":    [0, 3, 7, 10],   // root, m3, P5, m7
  "m7b5":  [0, 3, 6, 10],
  "dim7":  [0, 3, 6, 9],
  // etc.
}
```

~20–30 entries covers all common chord qualities. No external library needed for this layer.

### 2. Formula → concrete voicings (voicing layer)

This is the potentially large dataset. A voicing specifies which specific pitches to use across which octaves (e.g. Cmaj7 voiced as E3-B3-D4-G4). Options:

- **Generate from formula** — stack the intervals above the root in a sensible octave range. Simple, always works, but produces root-position block chords with no voice leading.
- **Curated voicing database** — pre-defined voicings per chord quality, similar to what jazz pianists learn. More musical but requires a data source.

#### Possible voicing data sources

- **Mark Levine's "The Jazz Piano Book"** — definitive voicing reference; copyrighted but the voicings themselves (being chord shapes) are not. Could transcribe common two-handed voicings by hand.
- **iRealPro chord database** — the app stores chord progressions but not voicings explicitly.
- **Open Music Theory / Open source theory texts** — some have voicing tables in machine-readable formats.
- **Generate algorithmically** — shell voicings (root + 7th in left hand, 3rd + extension in right) are a well-known pattern; can be computed from the interval formula without a database.

For MVP, algorithmic generation from the theory layer is sufficient. Curated voicings can replace or supplement later.

## Integration with Pattern Sets

This feature is closely related to `04-pattern-sets.md`. Chord symbols could be:

1. **Attached to sets** — each set in the library carries a chord symbol field; the renderer shows it above the staff when the set plays. Natural for jazz standards and chorale progressions.
2. **Standalone progression mode** — separate from sets; the generator picks a chord progression (e.g. a ii-V-I) and displays the symbols while generating random notes *within* that harmonic context (guide-tone targeting, chord tones vs. passing tones).

Option 2 is the more interesting pedagogical tool — constraining the note generator to chord tones within a progression trains the player to see the harmonic function of each note.

## Chord Progression Library

A small library of common progressions to get started:

| Name | Progression |
|---|---|
| ii-V-I (C major) | Dm7 → G7 → Cmaj7 |
| I-VI-II-V (C) | Cmaj7 → Am7 → Dm7 → G7 |
| Blues (C) | C7 → F7 → C7 → G7 → F7 → C7 |
| Rhythm changes A (Bb) | Bbmaj7 → G7 → Cm7 → F7 |
| Circle of fifths | All 12 dom7 chords descending in 5ths |

These can be hardcoded as a starting set, with user-defined progressions as a future addition.

## UI Options

- **Chord symbols toggle** — on/off overlay
- **Chord library / progression** — pick a progression from the library, or "random" within a style
- **Bars per chord** — how many bars each chord lasts (1 / 2 / 4)
- **Show voicing** — optionally display the actual notes of the chord on the staff (as small ghost noteheads) in addition to the symbol above

## Interaction with Other Features

- **Bar lines and time signature** (`01-bar-lines-time-signature.md`) — chord symbols align to bar lines; this feature effectively requires bars to be enabled and makes little sense without them.
- **Pattern sets** (`04-pattern-sets.md`) — sets can carry chord symbol metadata; the two features share the chord data model.
- **Static staff view** (`09-play-along-staff.md`) — chord symbols above the staff are a natural addition to the static page layout; position above the top system line per measure.

## Future Expansion

- **Voice leading mode** — display a second staff showing the chord voicing, with the melody above
- **Chord tone highlighting** — colour notes that fall on chord tones differently from passing tones
- **User-defined progressions** — paste in a progression as text (e.g. `| Dm7 | G7 | Cmaj7 | Cmaj7 |`)
- **Nashville number system** — show Roman numerals (ii-V-I) instead of chord names for key-agnostic reading

## Open Questions

- Should the chord symbol font be a standard web font (bold sans-serif) or a music-specific SMuFL glyph (SMuFL has chord symbol characters)?
- When transposing, do chord symbols transpose with the key, or stay fixed?
- Should the voicing layer influence the note generator (chord-tone targeting), or just be a visual overlay with no effect on which notes are generated?

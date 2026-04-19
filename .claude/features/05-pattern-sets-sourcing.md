# Task: Sourcing Pattern Sets

**Status:** Idea — blocked on `04-pattern-sets.md` set format being finalised

## Goal

Identify, extract, and encode short melodic/harmonic patterns from well-known public-domain or licensed sources into the set data format defined in `04-pattern-sets.md`. Priority is patterns that are:

- Idiomatic and frequently recurring in that genre
- Short enough to work as a single set (2–8 notes, up to 12 for jazz)
- Available in a machine-readable or easily transcribable format

---

## Source Candidates

### 1. Bach Chorales (public domain)

**Why:** Dense with common voice-leading patterns, chromatic approaches, suspensions, and cadence figures. Arguably the best training material for classical sight-reading fundamentals.

**Format options:**
- Music21 Python library has all 371 chorales as symbolic data — could script extraction of soprano (or any voice) line in segments
- MuseScore / IMSLP have MusicXML versions
- kern scores (kernscores.cs.indiana.edu) has all 371 in Humdrum format

**Extraction approach:**
- Parse soprano line, split at phrase boundaries (fermatas)
- Each phrase = one set
- Tag by interval content (stepwise / leap / chromatic)

**Estimated sets:** 371 chorales × ~4–6 phrases each = ~1500–2000 sets

---

### 2. Hanon — The Virtuoso Pianist (public domain)

**Why:** Highly systematic finger patterns; great for training scalar runs, arpeggios, chromatic passages. Less "musical" but very good for pattern drilling.

**Format options:**
- IMSLP has PDF and some MIDI — MIDI is easiest to parse
- Many transcriptions available as MusicXML

**Extraction approach:**
- Each Hanon exercise is itself a repeating pattern; extract the base unit (usually 8–16 notes) as one set
- Exercises 1–20 cover most common patterns
- Could auto-transpose to all 12 keys

**Estimated sets:** 20 exercises × 12 keys = 240 sets (highly systematic)

---

### 3. Jamey Aebersold Play-Along Series (jazz)

**Why:** The definitive jazz pedagogy resource. Common ii-V-I fragments, bebop scales, melodic patterns used in jazz standards.

**Licensing note:** Aebersold books are copyrighted. Cannot directly lift transcriptions. Options:
- Extract patterns from the free Aebersold "How to Play Jazz" volume 1 (vol. 1 is a free PDF)
- Transcribe generic ii-V-I and bebop patterns by hand (these are too short/generic to be copyrightable)
- Source from Levine's "The Jazz Theory Book" or Jerry Coker's books (patterns sections)

**Extraction approach:**
- Manual transcription of canonical ii-V-I fragments (D-7 → G7 → Cmaj7 in C)
- Bebop scale runs (chromatic passing tones added to major/dominant scales)
- Common jazz cadence figures (tritone sub resolutions, etc.)

**Estimated sets:** 50–100 hand-transcribed, to start

---

### 4. Other Candidates (lower priority)

| Source | Genre | Notes |
|---|---|---|
| Bartók — Mikrokosmos | 20th century / folk | Public domain in some regions; graded difficulty; great for modal/chromatic patterns |
| Czerny études | Classical technique | Public domain; similar to Hanon but more musical |
| Traditional folk melodies | Folk | Many available in ABC notation format — easy to parse |
| Lead sheets from iRealPro community | Jazz standards | Chord symbols only, not melodies — less useful here |
| Scarlatti sonatas | Baroque | Public domain; good for ornament and turn patterns |

---

## Implementation Tasks

- [ ] Finalise internal set format (see `04-pattern-sets.md` for draft schema)
- [ ] Write a parser/importer for MusicXML → set JSON (could use music21 in Python as a one-off script)
- [ ] Extract Bach chorale soprano lines via music21 script
- [ ] Extract Hanon base patterns from MIDI or MusicXML
- [ ] Hand-transcribe 20–30 jazz ii-V patterns to bootstrap the jazz library
- [ ] Tag each set with metadata: source, key, clef, interval content, difficulty estimate
- [ ] Decide on file format for bundling sets (JSON files per library? SQLite? Hardcoded JS/TS arrays?)

## Open Questions

- Do we want to ship sets as static data bundled with the app, or fetched from a remote source (allowing updates without a deploy)?
- Should we credit the source on the UI ("from Bach BWV 248") — yes for educational value, but adds UI complexity
- Transposition: store sets in their original key and transpose at runtime, or pre-generate all 12 keys?
- Difficulty rating: manual tagging, or derive from interval size / chromatic density / rhythm complexity?

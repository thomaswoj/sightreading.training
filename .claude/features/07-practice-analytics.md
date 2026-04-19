# Feature: Practice Session Tracking & Analytics Dashboard

**Status:** Idea

## Concept

Record each practice session to a persistent store and surface the data as a dashboard. The goal is threefold: show the user where they've improved over time, highlight persistent weaknesses (specific keys, hands, modes), and suggest what to work on next based on actual performance history rather than gut feel.

---

## Data to Capture Per Session

Each session record should capture enough context to reconstruct what the user was doing and how well it went:

| Field | Description |
|---|---|
| `timestamp` | Session start time |
| `duration_seconds` | Total time spent |
| `mode` | random-generator / scroll / play-along / pattern-sets |
| `clef` | treble / bass / grand |
| `hand` | LH / RH / both |
| `key_signature` | e.g. "G major", "F# minor" |
| `note_value` | whole / quarter / 8th / etc. (if rhythm notation active) |
| `bpm` | Tempo setting at session start (and end, if changed mid-session) |
| `notes_attempted` | Total notes the user was presented with |
| `notes_correct` | Notes played correctly on first attempt |
| `accuracy_pct` | Derived: `notes_correct / notes_attempted * 100` |
| `set_library` | If pattern sets mode: which library was active |
| `sets_completed` | If pattern sets mode: how many sets finished |

### Optional / future fields

- Per-note breakdown (which specific pitches were missed most)
- Reaction time per note (ms from note appearing to first key press)
- Streak data (longest correct run within the session)

---

## What Already Exists

More infrastructure is in place than it might appear:

- **Full auth system** — `users` table with `id`, `username`, `email`, `last_active_at`, `created_at`. Login/session flow is complete. `user_id` FK is available immediately.
- **`hourly_hits`** — already recording hits and misses per user, bucketed by the hour. Raw accuracy data is there; it just lacks context (no key, mode, or hand recorded alongside it).
- **`song_user_time`** — tracks cumulative time spent per song per user in play-along mode; uses `created_at` / `updated_at` via Lapis timestamps.
- **`presets`** — saves named practice configurations as JSONB per user (key signature, clef, hand setting, etc. are likely in here already).

**What's missing:** session-level grouping with context, and a dashboard to surface it. The hit/miss counters exist but can't answer "how did I do in F# minor on Tuesday" because the key isn't stored alongside the count.

---

## Storage

The app already has PostgreSQL and a Lapis backend — no new infrastructure needed. The work is one new table and extending the existing hit-recording call to pass context.

- New `practice_sessions` table — one row per session, written at session end (or on tab close via `beforeunload`)
- Existing `hourly_hits` hits/misses link to a `session_id` FK, or session totals are stored directly on `practice_sessions` (simpler to start)
- New `practice_session_notes` table (optional, finer grain) — one row per note attempt if per-pitch analytics are wanted later

### Schema

```sql
CREATE TABLE practice_sessions (
  id          serial PRIMARY KEY,
  user_id     integer NOT NULL REFERENCES users(id),
  started_at  timestamptz NOT NULL DEFAULT now(),  -- when the session began
  ended_at    timestamptz,                          -- written on close/end
  duration_s  integer,                             -- derived: ended_at - started_at
  mode        text,        -- random-generator | scroll | play-along | pattern-sets
  clef        text,        -- treble | bass | grand
  hand        text,        -- LH | RH | both
  key_sig     text,        -- e.g. "F# minor", "Bb major"
  note_value  text,        -- whole | quarter | 8th | 16th
  bpm         integer,
  attempted   integer,
  correct     integer,
  set_library text,        -- null unless pattern-sets mode
  sets_done   integer
);
```

`started_at` defaults to `now()` on insert so the timestamp is always captured even if the session record is only flushed at the end. `ended_at` is written when the session closes. Both timestamps are available for trend queries ("sessions on a given day", "sessions between two dates", etc.).

---

## Dashboard Views

### 1. Recent sessions list

Simple table of the last N sessions with key stats — date, mode, key, accuracy %, duration. Establishes the habit of checking in.

### 2. Accuracy over time (per key)

Line chart: x = date, y = accuracy %. Filterable by key signature. The most important view — lets the user see if they're improving, plateauing, or regressing in a given key over weeks/months.

### 3. Key signature heatmap / weakness highlight

Grid of all key signatures, coloured by average accuracy (green = strong, red = weak). Immediately shows which keys need work. Could sort by "most neglected" (rarely practised) or "lowest accuracy" (practised but struggling).

### 4. Tempo progression

Line chart: x = date, y = BPM, filtered by mode and key. Shows whether the user is pushing the tempo over time or staying comfortable.

### 5. Hand breakdown

Side-by-side accuracy for LH / RH / both across the same time period. Identifies if one hand is consistently weaker.

### 6. Suggestions panel

Derived from the data — surface 2–3 actionable prompts:
- "You haven't practised B major in 3 weeks"
- "Your accuracy in F# minor is 58% — below your average of 74%"
- "Your tempo in C major has plateaued at 80bpm for the last 2 weeks"

These don't need ML — simple rule-based queries (lowest accuracy key in last 30 days, longest gap since last practised, etc.) are enough to be useful.

---

## UI Structure

A new `/dashboard` or `/stats` route (separate page, not a modal). Sections:

1. **Summary strip** — total sessions, total time, average accuracy this week vs last week
2. **Key heatmap** — always visible, the at-a-glance weakness finder
3. **Accuracy trend chart** — date range picker, key filter
4. **Tempo trend chart** — same filters
5. **Suggestions** — 2–3 cards with direct links into the practice mode ("Practice F# minor now →")
6. **Session history** — paginated table, exportable to CSV if wanted

---

## Interaction with Other Features

- **Rhythm notation** (`01-rhythm-notation.md`) — `note_value` field captures which note style was active; allows filtering analytics by complexity level.
- **Pattern sets** (`04-pattern-sets.md`) — `set_library` and `sets_done` fields track set-mode sessions separately; could show accuracy per set library over time.
- **Rests** (`06-rests.md`) — rests should not count as note attempts (the player isn't expected to press a key); the logging layer needs to exclude rest slots from `attempted` / `correct` counts.

## Future Expansion

- **Per-pitch heatmap** — which individual notes (C4, F#5, etc.) are missed most, across all sessions
- **Comparison mode** — "me vs 2 months ago" overlay on any chart
- **Goal setting** — "reach 80% accuracy in all keys", progress bar toward the goal
- **Export** — download session history as CSV or JSON for external analysis
- **Streak / consistency tracking** — days practised in a row, weekly practice minutes

## Open Questions

- Should sessions be written on `beforeunload` (best effort, can be lost if tab crashes) or periodically flushed every N minutes mid-session?
- Minimum session length to bother recording — avoid polluting history with accidental 5-second opens?
- Which charting library fits the existing stack (React + esbuild, no heavy dependencies preferred)?

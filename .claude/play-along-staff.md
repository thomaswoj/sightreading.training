# Feature

Assess how to add a staff view to the /play-along (/song/) mode, i.e. show grand piano staff rather than the current duration blocks. 

1. I'd like to be able to view as a staff (likely just grand piano staff)
2. I'd like to be able to keep the display static, rather than moving, with the notes changing colour as I progress through, (like a step mode), rather than playing anything and having the screen move. This is to mimic a piano player looking at a paper sheet music. This would likely be setting or mode within /song/ etc 

Do a feasibility study and update this markdown file with a plan.

---

## Feasibility Study

**Verdict: Highly feasible.** The codebase already has all the building blocks — no external notation library needed.

### What already exists

- **Custom SVG staff system** (`static/js/st/components/staves.jsx`): `GStaff` (treble), `FStaff` (bass), `GrandStaff` (both together) — already rendering clefs, key signatures, ledger lines.
- **Note positioning maths**: `noteStaffOffset(note)` in `static/js/st/music.js` converts pitch to Y-position on staff.
- **Full note data**: every `SongNote` has `note` (e.g. "C4"), `start` (beat), `duration` (beats). Structured in `SongNoteList` per track.
- **Held-note tracking**: `heldSongNotes` state in `PlayAlongPage` already tracks which notes are currently active — same mechanism drives the coloring in the existing bar view.

### What doesn't exist yet

- A static (non-scrolling) display mode — the current view translates the staff horizontally as `beat` advances via CSS transform.
- A "page" layout for notes — right now notes are laid out on an infinite horizontal tape; a staff view needs them laid out in measures across rows.
- Color-change-on-progress logic for a staff notation context (closest existing thing is the `.held` class in `bar_notes.jsx`).

---

## Plan

### 1. Add `staffView` toggle to `PlayAlongPage`

In `play_along_page.jsx`, add a `staffView` boolean state (default `false`). Add a toggle button near the existing Editor button (~line 797). When `staffView` is true, suppress the CSS horizontal-scroll transform (`staff.setOffset(...)` in `updateBeat`, ~line 404) and render the new component instead of the existing `StaffSongNotes`.

### 2. Create `StaticStaffView` component

New file: `static/js/st/components/pages/static_staff_view.jsx`

Responsibilities:
- Accept `song` (`MultiTrackSong`), `currentBeat`, `keySignature`, `beatsPerMeasure`.
- Lay notes out in **measures** — group `SongNote` objects by measure number (`Math.floor(note.start / beatsPerMeasure)`).
- Render measures in rows (wrapping after N measures per line, e.g. 4).
- For each measure, render a `GrandStaff` (from `staves.jsx`) with notes plotted at their correct Y position (using existing `noteStaffOffset`) and X position proportional to beat-within-measure.
- Apply a CSS class (`played`, `active`, `upcoming`) to each note head based on `currentBeat`:
  - `played`: `note.start + note.duration <= currentBeat`
  - `active`: `note.start <= currentBeat < note.start + note.duration`
  - `upcoming`: default

### 3. Note rendering within static staff

Re-use or adapt `WholeNotes` (`static/js/st/components/staff/whole_notes.jsx`) — it already renders circular note heads at a given position. Will need:
- X position = `(beat within measure / beatsPerMeasure) * measureWidth`
- Y position = existing `noteStaffOffset` output
- Stems, beams: skip for MVP — note heads only, no beaming. Sufficient for readable reference and avoids significant complexity.
- Accidentals: use existing sharp/flat SVG assets already in the codebase.

### 4. CSS

New CSS module alongside the component. Three classes:
- `.noteUpcoming` — default colour (black)
- `.noteActive` — highlight colour (e.g. blue or green, matching existing held-note palette)
- `.notePlayed` — muted colour (e.g. light grey)

### 5. Wiring progress updates

`PlayAlongPage` already calls `updateBeat(beat)` on every timer tick. Pass `currentBeat` as a prop down to `StaticStaffView` — React re-render will update note colours automatically. No additional timer/subscription needed.

---

## Files to create / modify

| File | Action |
|------|--------|
| `static/js/st/components/pages/play_along_page.jsx` | Add `staffView` state, toggle button, conditional render |
| `static/js/st/components/pages/static_staff_view.jsx` | **New** — main static staff layout component |
| `static/js/st/components/pages/static_staff_view.module.css` | **New** — note colour classes |
| `static/js/st/components/staves.jsx` | Likely no changes — reuse `GrandStaff` as-is |
| `static/js/st/components/staff/whole_notes.jsx` | Minor: accept optional `colorClass` prop |

---

## Out of scope (MVP)

- Beam groups / stem direction
- Multi-page scrolling (scroll to current measure row is fine)
- Automatic audio playback (purely visual step-mode)
- Per-track staff type selection (grand piano staff only, matching the request)

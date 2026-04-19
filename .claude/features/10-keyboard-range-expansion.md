# Feature: Expanded Keyboard Display in Non-Grand Modes

**Status:** Idea

## Concept

When in treble-only or bass-only clef mode, the keyboard displayed at the bottom of the screen is narrower than in grand staff mode. Add an option to show a wider keyboard range regardless of the current clef mode, giving the player better visual context for where notes sit on the keyboard.

## Current Behaviour

- Grand mode already shows an expanded keyboard range covering both hands
- Treble-only and bass-only modes show a reduced range, presumably scoped to the register relevant to that clef
- The narrower range can make it harder to orient yourself, especially for notes near the edges of the displayed range

## What Changes

Add a setting — either a toggle ("expanded keyboard") or a range selector — that allows the treble/bass single-clef modes to show the same keyboard width as grand mode, or a user-defined range.

Options for the control:

- **Toggle** — simply match the grand mode keyboard width when on; the simplest implementation
- **Range picker** — choose how many octaves to display (e.g. 2 / 3 / 4 / full 88-key)

The keyboard component itself likely already supports rendering arbitrary ranges if grand mode works — this may just be a matter of passing different props rather than new rendering logic.

## Open Questions

- Is the keyboard range currently hardcoded per mode, or derived from the active clef/note range?
- Should the expanded range persist as a user preference, or reset per session?

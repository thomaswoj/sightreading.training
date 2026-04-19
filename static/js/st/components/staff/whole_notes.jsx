import * as React from "react"
import classNames from "classnames"
import {parseNote, noteStaffOffset} from "st/music"

import * as types from "prop-types"
import styles from "st/components/staff.module.css"

export default class WholeNotes extends React.PureComponent {
  static defaultProps = {
    noteValue: "whole",
    beamGroupSize: "off",
    stemDirection: "auto",
  }

  static propTypes = {
    notes: types.array.isRequired,
    keySignature: types.object.isRequired,
    upperRow: types.number,
    lowerRow: types.number,
    pixelsPerBeat: types.number,
    offsetLeft: types.number,
    noteValue: types.oneOf(["whole", "half", "quarter", "eighth", "sixteenth"]),
    beamGroupSize: types.oneOf(["off", "2", "3", "4"]),
    stemDirection: types.oneOf(["auto", "up", "down"]),
    // noteClasses, staticNoteClasses
  }

  render() {
    let notesByColumn = this.getNotesByColumn()
    let beamedNotes = this.getBeamedNotes(notesByColumn)

    let out = this.props.notes.map((n, idx) =>
      this.renderNote(n, idx, notesByColumn, beamedNotes))

    if (out.length) {
      return out
    }

    return null
  }

  // used to offset notes when they are stacked
  getNotesByColumn() {
    let notesByColumn = {}

    this.props.notes.forEach(n => {
      let column = n.getStart().toString()

      if (!notesByColumn[column]) {
        notesByColumn[column] = [n]
      } else {
        notesByColumn[column].push(n)
      }
    })

    return notesByColumn
  }

  getMiddleRow() {
    return this.props.upperRow - 4
  }

  getStemDirection(row, groupRows=null) {
    if (this.props.stemDirection == "up") {
      return "up"
    }

    if (this.props.stemDirection == "down") {
      return "down"
    }

    let middleRow = this.getMiddleRow()
    let targetRow = row
    if (groupRows && groupRows.length) {
      targetRow = groupRows.reduce((sum, r) => sum + r, 0) / groupRows.length
    }

    return targetRow >= middleRow ? "down" : "up"
  }

  getBeamedNotes(notesByColumn) {
    let out = new Map()
    let noteValue = this.props.noteValue
    let beamGroupSize = +(this.props.beamGroupSize || "0")

    if ((noteValue != "eighth" && noteValue != "sixteenth") || !beamGroupSize) {
      return out
    }

    let columns = Object.values(notesByColumn).sort((a, b) =>
      a[0].getStart() - b[0].getStart()
    )

    for (let i=0; i < columns.length;) {
      let group = columns.slice(i, i + beamGroupSize)
      if (group.length < beamGroupSize) {
        break
      }

      let consecutive = true
      let singleNotes = true
      for (let k=0; k < group.length; k++) {
        if (group[k].length != 1) {
          singleNotes = false
          break
        }

        if (k > 0 && group[k][0].getStart() != group[k - 1][0].getStart() + 1) {
          consecutive = false
          break
        }
      }

      if (!singleNotes || !consecutive) {
        i += 1
        continue
      }

      let notes = group.map(g => g[0])
      let rows = notes.map(n => noteStaffOffset(this.props.keySignature.enharmonic(n.note)))
      let direction = this.getStemDirection(rows[0], rows)
      let beamCount = noteValue == "sixteenth" ? 2 : 1

      notes.forEach((note, idx) => {
        out.set(note.id, {
          direction,
          beamCount,
          firstNote: notes[0],
          lastNote: notes[notes.length - 1],
          firstRow: rows[0],
          lastRow: rows[rows.length - 1],
          isStart: idx == 0,
        })
      })

      i += beamGroupSize
    }

    return out
  }

  renderNote(note, idx, notesByColumn, beamedNotes) {
    const props = this.props
    let key = props.keySignature

    let noteName = key.enharmonic(note.note)

    let pitch = parseNote(noteName)
    let row = noteStaffOffset(noteName)

    let fromTop = props.upperRow - row;
    let offsetLeft = props.offsetLeft || 0
    let left = offsetLeft + note.getStart() * this.props.pixelsPerBeat

    let column = notesByColumn[note.getStart().toString()]

    let style = {
      top: `${Math.floor(fromTop * 25/2)}%`,
      left: `${left}px`
    }

    let outside = row > props.upperRow || row < props.lowerRow
    let accidentals = key.accidentalsForNote(noteName)

    let noteClasses = null
    if (props.noteClasses) {
      noteClasses = props.noteClasses[note.id]
    }

    let noteValue = props.noteValue || "whole"
    let beamed = beamedNotes.get(note.id)
    let stemDirection = beamed?.direction || this.getStemDirection(row)
    let useStem = noteValue != "whole"
    let useFlag = (noteValue == "eighth" || noteValue == "sixteenth") && !beamed

    let classes = classNames(styles.note, {
      [styles.is_flat]: accidentals == -1,
      [styles.is_sharp]: accidentals == 1,
      [styles.is_natural]: accidentals == 0,
      [styles.outside]: outside,
      [styles.note_whole]: noteValue == "whole",
      [styles.note_half]: noteValue == "half",
      [styles.note_quarter]: noteValue == "quarter",
      [styles.note_eighth]: noteValue == "eighth",
      [styles.note_sixteenth]: noteValue == "sixteenth",
      [styles.stem_up]: stemDirection == "up",
      [styles.stem_down]: stemDirection == "down",
    }, noteClasses, props.staticNoteClasses)

    let noteHeadSrc = (noteValue == "whole" || noteValue == "half")
      ? "/static/svg/noteheads.s0.svg"
      : "/static/svg/noteheads.s2.svg"

    let parts = [
      <img key="head" className={styles.primary} src={noteHeadSrc} />
    ]

    if (useStem) {
      parts.push(<span key="stem" className={styles.stem}></span>)
    }

    if (useFlag) {
      let flagCount = noteValue == "sixteenth" ? 2 : 1
      parts.push(<span key="flag-1" className={classNames(styles.flag, styles.flag_1)}></span>)
      if (flagCount > 1) {
        parts.push(<span key="flag-2" className={classNames(styles.flag, styles.flag_2)}></span>)
      }
    }

    if (beamed && beamed.isStart) {
      let beamWidth = Math.max(4, (beamed.lastNote.getStart() - beamed.firstNote.getStart()) * props.pixelsPerBeat + 8)
      let slope = Math.max(-14, Math.min(14, (beamed.lastRow - beamed.firstRow) * 2.5))
      parts.push(<span
        key="beam-1"
        style={{ width: `${beamWidth}px`, transform: `rotate(${slope}deg)` }}
        className={classNames(styles.beam, styles.beam_1, {
          [styles.beam_up]: stemDirection == "up",
          [styles.beam_down]: stemDirection == "down",
        })}
      ></span>)

      if (beamed.beamCount > 1) {
        parts.push(<span
          key="beam-2"
          style={{ width: `${beamWidth}px`, transform: `rotate(${slope}deg)` }}
          className={classNames(styles.beam, styles.beam_2, {
            [styles.beam_up]: stemDirection == "up",
            [styles.beam_down]: stemDirection == "down",
          })}
        ></span>)
      }
    }

    if (accidentals == 0) {
      parts.push(<img key="natural" className={classNames(styles.accidental, styles.natural)} src="/static/svg/natural.svg" />)
    }

    if (accidentals == -1) {
      parts.push(<img key="flat" className={classNames(styles.accidental, styles.flat)} src="/static/svg/flat.svg" />)
    }

    if (accidentals == 1) {
      parts.push(<img key="sharp" className={classNames(styles.accidental, styles.sharp)} src="/static/svg/sharp.svg" />)
    }

    return <div
      key={`note-${idx}`}
      style={style}
      data-note={note.note}
      data-midi-note={pitch}
      className={classes}
      >{parts}</div>
  }
}

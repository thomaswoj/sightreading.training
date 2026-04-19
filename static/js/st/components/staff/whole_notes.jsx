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
    if (this.props.stemDirection === "up") {
      return "up"
    }

    if (this.props.stemDirection === "down") {
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

    if ((noteValue !== "eighth" && noteValue !== "sixteenth") || !beamGroupSize) {
      return out
    }

    let columns = Object.values(notesByColumn).sort((a, b) =>
      a[0].getStart() - b[0].getStart()
    )

    // chunk into fixed groups — skip any group that contains chords (multiple notes per column)
    for (let i = 0; i + beamGroupSize <= columns.length; i += beamGroupSize) {
      let group = columns.slice(i, i + beamGroupSize)

      if (group.some(col => col.length !== 1)) continue

      let notes = group.map(g => g[0])
      let rows = notes.map(n => noteStaffOffset(this.props.keySignature.enharmonic(n.note)))
      // stem direction decided by average pitch of whole group so all stems go same way
      let direction = this.getStemDirection(rows[0], rows)
      let beamCount = noteValue === "sixteenth" ? 2 : 1
      // reference row: highest note for stem_up, lowest for stem_down
      let referenceRow = direction === "up" ? Math.max(...rows) : Math.min(...rows)

      notes.forEach((note, idx) => {
        out.set(note.id, {
          direction,
          beamCount,
          firstNote: notes[0],
          lastNote: notes[notes.length - 1],
          isStart: idx === 0,
          referenceRow,
          noteRow: rows[idx],
        })
      })
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

    let noteValue = props.noteValue
    let beamed = beamedNotes.get(note.id)

    let isChord = column.length > 1
    let chordRows = isChord ? column.map(n => noteStaffOffset(props.keySignature.enharmonic(n.note))) : null
    let stemDirection = beamed?.direction || this.getStemDirection(
      isChord ? chordRows.reduce((s, r) => s + r, 0) / chordRows.length : row
    )
    // in a chord, only the outermost note owns the stem (lowest for up, highest for down)
    let isStemOwner = !isChord || (
      stemDirection === "up" ? row === Math.min(...chordRows) : row === Math.max(...chordRows)
    )
    let useStem = noteValue !== "whole" && isStemOwner
    let useFlag = (noteValue === "eighth" || noteValue === "sixteenth") && !beamed && isStemOwner

    let classes = classNames(styles.note, {
      [styles.is_flat]: accidentals === -1,
      [styles.is_sharp]: accidentals === 1,
      [styles.is_natural]: accidentals === 0,
      [styles.outside]: outside,
      [styles.note_whole]: noteValue === "whole",
      [styles.note_half]: noteValue === "half",
      [styles.note_quarter]: noteValue === "quarter",
      [styles.note_eighth]: noteValue === "eighth",
      [styles.note_sixteenth]: noteValue === "sixteenth",
      [styles.stem_up]: stemDirection === "up",
      [styles.stem_down]: stemDirection === "down",
    }, noteClasses, props.staticNoteClasses)

    let noteHeadSrc = noteValue === "whole"
      ? "/static/staff/whole_note.svg"
      : noteValue === "half"
      ? "/static/staff/half_note.svg"
      : "/static/staff/quarter_note.svg"

    let parts = [
      <img key="head" className={styles.primary} src={noteHeadSrc} />
    ]

    // px constants derived from CSS: staff=120px (4*30), note div=24px (20%), row=15px (30/2)
    const rowPx = 15
    const defaultStemHeightPx = 52.8  // 220% of 24px
    const stemTopUpPx = -40.8         // -170% of 24px
    const beam1UpPx = -40.8           // -170%
    const beam2UpPx = -33.6           // -140%
    const beam1DownPx = 58.8          // 245%
    const beam2DownPx = 51.6          // 215%

    let stemStyle = undefined
    let beamExtraPx = 0
    if (beamed && useStem) {
      beamExtraPx = Math.abs(row - beamed.referenceRow) * rowPx
      if (stemDirection === "up") {
        stemStyle = {
          top: `${stemTopUpPx - beamExtraPx}px`,
          height: `${defaultStemHeightPx + beamExtraPx}px`,
        }
      } else {
        stemStyle = { height: `${defaultStemHeightPx + beamExtraPx}px` }
      }
    }

    if (useStem) {
      parts.push(<span key="stem" className={styles.stem} style={stemStyle}></span>)
    }

    if (useFlag) {
      const flagGlyphs = {
        eighth:    { up: "\uE240", down: "\uE241" },
        sixteenth: { up: "\uE242", down: "\uE243" },
      }
      let dir = stemDirection === "down" ? "down" : "up"
      let glyph = flagGlyphs[noteValue][dir]
      parts.push(<span key="flag" className={classNames(styles.flag, styles[`flag_${dir}`])}>{glyph}</span>)
    }

    if (beamed && beamed.isStart) {
      // span from this stem to last note's stem — +2 to cover the last stem's own width
      let beamWidth = (beamed.lastNote.getStart() - beamed.firstNote.getStart()) * props.pixelsPerBeat + 2
      let beamClass = stemDirection === "up" ? styles.beam_up : styles.beam_down
      let b1Top = stemDirection === "up" ? beam1UpPx - beamExtraPx : beam1DownPx + beamExtraPx
      let b2Top = stemDirection === "up" ? beam2UpPx - beamExtraPx : beam2DownPx + beamExtraPx
      parts.push(<span
        key="beam-1"
        style={{ width: `${beamWidth}px`, top: `${b1Top}px` }}
        className={classNames(styles.beam, styles.beam_1, beamClass)}
      ></span>)
      if (beamed.beamCount > 1) {
        parts.push(<span
          key="beam-2"
          style={{ width: `${beamWidth}px`, top: `${b2Top}px` }}
          className={classNames(styles.beam, styles.beam_2, beamClass)}
        ></span>)
      }
    }

    if (accidentals === 0) {
      parts.push(<img key="natural" className={classNames(styles.accidental, styles.natural)} src="/static/svg/natural.svg" />)
    }

    if (accidentals === -1) {
      parts.push(<img key="flat" className={classNames(styles.accidental, styles.flat)} src="/static/svg/flat.svg" />)
    }

    if (accidentals === 1) {
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

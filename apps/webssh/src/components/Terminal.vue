<template>
  <div
    ref="buffer"
    class="terminal"
    contenteditable
    @mousedown.prevent="handleMouseDown"
    @keydown="handleKeyDown"
    @keypress.prevent="handleKeyPress"
    @focus="handleFocus"
    @compositionend.prevent="handleCompositionEnd"
    @contextmenu="handlePaste"
  >
    <div></div>
  </div>
</template>

<script>
const ansiHtml = window.require('ansi-to-html')
const converter = new ansiHtml({ stream: true })

const escapeCodeHandlers = []

function addEscapeCodeHandler(re, handler) {
  escapeCodeHandlers.push({
    re: new RegExp('^\\x1B' + re.source),
    handler
  })
}

addEscapeCodeHandler(/\=/, () => {
  // Alternate keypad mode
})

addEscapeCodeHandler(/\](\d+);([^\x07]*)\x07/, (match) => {
  switch (Number(match[1])) {
    case 0:
      document.title = match[2]
      break

    default:
      break
  }
})

addEscapeCodeHandler(/\[(\d*)A/, function (match) {
  this.cursorRow -= Number(match[1]) || 1
  resetCursor.call(this)
})

addEscapeCodeHandler(/\[(\d*)B/, function (match) {
  this.cursorRow += Number(match[1]) || 1
  resetCursor.call(this)
})

addEscapeCodeHandler(/\[C(\x1B\[C)+/, function (match) {
  const amount = Math.ceil(match[0].length / 3)
  this.cursorColumn += amount
  resetCursor.call(this)
})

addEscapeCodeHandler(/\[(\d*)C/, function (match) {
  const amount = Number(match[1]) || 1
  this.cursorColumn += amount
  resetCursor.call(this)
})

addEscapeCodeHandler(/\[(\d*)D/, function (match) {
  const amount = Number(match[1]) || 1
  this.cursorColumn -= amount
  resetCursor.call(this)
})

// Set cursor position
addEscapeCodeHandler(/\[(?:(\d+)(?:;(\d+))?)?H/, function (match) {
  this.cursorRow = Number(match[1]) || 1
  this.cursorColumn = Number(match[2]) || 1
  resetCursor.call(this)
})

// Handle erase document
addEscapeCodeHandler(/\[J/, () => {
  const selection = window.getSelection()
  selection.modify('extend', 'forward', 'documentboundary')
  selection.deleteFromDocument()
})

// Handle erase line
addEscapeCodeHandler(/\[K/, () => {
  const selection = window.getSelection()
  selection.modify('extend', 'forward', 'lineboundary')
  selection.deleteFromDocument()
})

// Insert lines
addEscapeCodeHandler(/\[(\d*)L/, function (match) {
  const amount = Number(match[1]) || 1
  for (let i = 0; i < amount; i += 1) {
    this.$refs.buffer.childNodes[this.cursorRow - 1].insertAdjacentElement(
      'afterend',
      document.createElement('div')
    )
  }
})

addEscapeCodeHandler(/\[\d*P/, () => {
  const selection = window.getSelection()
  selection.modify('extend', 'forward', 'lineboundary')
  selection.deleteFromDocument()
})

addEscapeCodeHandler(/\[(\d+(;\d+)*)?m/, (match) => {
  converter.toHtml(match)
})

addEscapeCodeHandler(/\[6n/, function () {
  this.stream.write(`\x1B[${this.cursorRow};${this.cursorColumn}R`)
})

let applicationCursorKeys = false
let windowWidth = 80
let windowHeight = 24
let workingBuffer = ''
let workingCursorRow = 1
let workingCursorColumn = 1

// DEC Private Mode
addEscapeCodeHandler(/\[\?(\d+)(h|l)/, function (match) {
  const mode = Number(match[1])
  const turnOn = match[2] === 'h'
  switch (mode) {
    case 1:
      applicationCursorKeys = turnOn
      break

    case 25:
      // Show(h) or hide(l) cursor
      break

    case 1049:
      if (turnOn) {
        workingBuffer = this.$refs.buffer.innerHTML
        workingCursorRow = this.cursorRow
        workingCursorColumn = this.cursorColumn
        this.$refs.buffer.innerHTML = ''
        this.cursorRow = 1
        this.cursorColumn = 1
        resetCursor.call(this)
      } else {
        this.$refs.buffer.innerHTML = workingBuffer
        this.cursorRow = workingCursorRow
        this.cursorColumn = workingCursorColumn
        resetCursor.call(this)
      }
      break
    default:
      break
  }
})

addEscapeCodeHandler(/\[\?\d*[a-z]/, () => {
  // Terminal mode
})

// CSI General handler
addEscapeCodeHandler(/\[[^@A-Za-z]*[@A-Za-z]/, (match) => {
  console.log(`CSI ${match} Not handled`)
})

// General handler
addEscapeCodeHandler(/(?:)/, () => {
  console.log('Not handled')
})

function handleEscapeCode(data) {
  console.log('ec: ', data.slice(0, 30))

  for (let i = 0; i < escapeCodeHandlers.length; i += 1) {
    const match = data.match(escapeCodeHandlers[i].re)
    if (match) {
      escapeCodeHandlers[i].handler.call(this, match)
      return data.substr(match[0].length)
    }
  }
}

function escape(text) {
  const escapeContainer = document.createElement('span')
  escapeContainer.innerText = text
  return escapeContainer.innerHTML
}

function handleAnsi(data) {
  let remainedData = data
  let selection = window.getSelection()

  while (remainedData) {
    if (remainedData[0].charCodeAt() >= 32) {
      remainedData = remainedData.replace(/^[^\0-\x1F]*/, (match) => {
        const range = selection.getRangeAt(0)

        const currentColor = range.endContainer.nodeName === '#text'
          ? window.getComputedStyle(range.endContainer.parentElement).getPropertyValue('color')
          : window.getComputedStyle(range.endContainer).getPropertyValue('color')

        let fragment
        if ( currentColor === window.getComputedStyle(this.$refs.buffer).getPropertyValue('color')) {
          fragment = range.createContextualFragment(converter.toHtml(escape(match)))
        } else {
          fragment = document.createElement('span')
          fragment.style.color = window.getComputedStyle(this.$refs.buffer).getPropertyValue('color')
          fragment.innerHTML = converter.toHtml(escape(match))
        }

        range.insertNode(fragment)
        const fragmentLength = range.toString().length
        range.collapse()
        for (let i = 0; i < fragmentLength; i += 1) {
          selection.modify('extend', 'forward', 'character')
        }
        selection.deleteFromDocument()
        this.cursorColumn += fragmentLength
        if (this.cursorColumn > windowWidth) {
          this.cursorRow += 1
        }
        return ''
      })
    }

    if (remainedData[0] === '\x1B') {
      remainedData = handleEscapeCode.call(this, remainedData)
      continue
    }

    switch (remainedData[0]) {
      case '\x07':  // Beep
        const { shell } = window.require('electron')
        shell.beep()
        break

      case '\x08':  // Backspace
        selection.modify('move', 'backward', 'character')
        this.cursorColumn -= 1
        break

      case '\x0A':  // Line feed
        this.cursorRow += 1
        resetCursor.call(this)
        break

      case '\x0D':  // Carriage return
        selection.modify('move', 'backward', 'lineboundary')
        this.cursorColumn = 1
        break

      default:
        break
    }

    remainedData = remainedData.substr(1)
  }
}

function resetCursor() {
  while (this.cursorRow > this.$refs.buffer.childNodes.length) {
    this.$refs.buffer.appendChild(document.createElement('div'))
  }
  const rowToFocus = this.$refs.buffer.childNodes[this.cursorRow - 1]

  if (this.cursorColumn - 1 > rowToFocus.textContent.length) {
    const spaces = ' '.repeat(this.cursorColumn - rowToFocus.textContent.length - 1)
    rowToFocus.appendChild(document.createTextNode(spaces))
  }

  const selection = window.getSelection()
  selection.collapse(rowToFocus, 0)
  for (let i = 1; i < this.cursorColumn; i += 1) {
    selection.modify('move', 'forward', 'character')
  }
}

module.exports = {
  data() {
    return {
      cursorRow: 1,
      cursorColumn: 1
    }
  },

  props: {
    stream: Object
  },

  methods: {
    handleCompositionEnd(ev) {
      if (!this.stream) {
        return
      }

      this.stream.write(ev.data)
      const selection = window.getSelection()
      for (let i = 0; i < ev.data.length; i += 1) {
        selection.modify('extend', 'backward', 'character')
      }
      selection.deleteFromDocument()
    },

    handleFocus(ev) {
      setTimeout(() => {
        resetCursor.call(this)

        // Scroll to bottom
        this.$refs.buffer.scrollTop = this.$refs.buffer.scrollHeight
      }, 0)
    },

    handleKeyDown(ev) {
      let eventHandled = false
      if ([8, 9, 27].includes(ev.which)) {  // Backspace & Tab & Escape
        this.stream.write(String.fromCharCode(ev.which))
      } else if (ev.ctrlKey && ev.which >= 65 && ev.which <= 90) {  // Ctrl-A to Ctrl-Z
        this.stream.write(String.fromCharCode(ev.which - 64))
      } else if (ev.which === 33) {  // Page Up
        this.stream.write('\x1B[5~')
      } else if (ev.which === 34) {  // Page Down
        this.stream.write('\x1B[6~')
      } else if (ev.which === 35) {  // End
        this.stream.write('\x1B[4~')
      } else if (ev.which === 36) {  // Home
        this.stream.write('\x1B[1~')
      } else if (ev.which === 37) {  // Arrow Left
        this.stream.write(applicationCursorKeys ? '\x1bOD' : '\x1B[D')
      } else if (ev.which === 38) {  // Arrow Up
        this.stream.write(applicationCursorKeys ? '\x1bOA' : '\x1B[A')
      } else if (ev.which === 39) {  // Arrow Right
        this.stream.write(applicationCursorKeys ? '\x1bOC' : '\x1B[C')
      } else if (ev.which === 40) {  // Arrow Down
        this.stream.write(applicationCursorKeys ? '\x1bOB' : '\x1B[B')
      } else if (ev.which === 46) {  // Delete
        this.stream.write('\x1B[3~')
      } else {
        eventHandled = true
      }

      if (!eventHandled) {
        ev.preventDefault()
      }
    },

    handleKeyPress(ev) {
      if (!this.stream) {
        return
      }

      this.stream.write(String.fromCharCode(ev.which))
    },

    handleMouseDown(ev) {
      this.$refs.buffer.focus()
    },

    handlePaste(ev) {
      if (!this.stream) {
        return
      }

      const { clipboard } = window.require('electron')
      this.stream.write(clipboard.readText())
    },

    write(data) {
      // Insert data at caret
      resetCursor.call(this)
      handleAnsi.call(this, data, this.stream)

      // Scroll to bottom
      this.$refs.buffer.scrollTop = this.$refs.buffer.scrollHeight
    }
  },

  async mounted() {
    resetCursor.call(this)
  }
}
</script>

<style>
.terminal {
  width: 100%;
  height: 100%;
  overflow-y: scroll;

  outline: none;
  background: black;
  color: whitesmoke;
  caret-color: white;

  font-family: Consolas, monospace;

  white-space: pre-wrap;
}

.terminal div::after {
  content: '\200B';
}
</style>

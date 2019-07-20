<template>
  <div
    ref="buffer"
    class="terminal"
    contenteditable
    @mousedown.prevent
    @keydown="handleKeyDown"
    @keypress.prevent="handleKeyPress"
    @compositionend.prevent="handleCompositionEnd"
    @contextmenu="handlePaste"
  >
  </div>
</template>

<script>
const ansiHtml = window.require('ansi-to-html')
const converter = new ansiHtml({ stream: true })

function handleEscapeCode(data) {
  console.log('ec:' + data)
  const selection = window.getSelection()
  let match = null

  // Handle set title
  match = data.match(/^\33\]0;([^\7]*)\7/)
  if (match) {
    document.title = match[1]
    return data.substr(match[0].length)
  }

  match = data.match(/^\33\[C/)
  if (match) {
    selection.modify('extend', 'backward', 'character')
    selection.deleteFromDocument()
    return data.substr(match[0].length)
  }

  // Handle erase line
  match = data.match(/^\33\[K/)
  if (match) {
    selection.modify('extend', 'forward', 'lineboundary')
    selection.deleteFromDocument()
    return data.substr(match[0].length)
  }

  match = data.match(/^\33\[P/)
  if (match) {
    selection.modify('extend', 'forward', 'lineboundary')
    selection.deleteFromDocument()
    return data.substr(match[0].length)
  }

  match = data.match(/^\33\[\d+(;\d+)*m/)
  if (match) {
    converter.toHtml(match)
    return data.substr(match[0].length)
  }

  data = data.replace(/^\33/, '')

  return data
}

function handleAnsi(data) {
  let remainedData = data
  const selection = window.getSelection()

  while (remainedData) {
    console.log(remainedData)

    if (remainedData[0].charCodeAt() >= 32) {
      remainedData = remainedData.replace(/^[^\0-\x1F]*/, (match) => {
        const range = selection.getRangeAt(0)
        const fragment = range.createContextualFragment(converter.toHtml(match))
        range.insertNode(fragment)
        range.collapse()
        return ''
      })
    }

    if (remainedData[0] === '\x1B') {
      remainedData = handleEscapeCode(remainedData)
      continue
    }

    switch (remainedData[0]) {
      case '\x07':  // Beep
        break

      case '\x08':  // Backspace
        selection.modify('move', 'backward', 'character')
        break

      case '\x0A':  // Line feed
        selection.modify('move', 'forward', 'lineboundary')
        const range = selection.getRangeAt(0)
        const fragment = range.createContextualFragment('\n')
        range.insertNode(fragment)
        range.collapse()
        break

      case '\x0D':  // Carriage return
        selection.modify('move', 'backward', 'lineboundary')
        break

      default:
        break
    }

    remainedData = remainedData.substr(1)
  }
}

module.exports = {
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

    handleKeyDown(ev) {
      console.log(ev)
      let eventHandled = false
      if (ev.which >= 8 && ev.which <= 9) {  // Backspace & Tab
        this.stream.write(String.fromCharCode(ev.which))
      } else if (ev.ctrlKey && ev.which >= 65 && ev.which <= 90) {  // Ctrl-A to Ctrl-Z
        this.stream.write(String.fromCharCode(ev.which - 64))
      } else if (ev.which === 37) {
        this.stream.write('\33[D')
      } else if (ev.which === 38) {
        this.stream.write('\33[A')
      } else if (ev.which === 39) {
        this.stream.write('\33[C')
      } else if (ev.which === 40) {
        this.stream.write('\33[B')
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

    handlePaste(ev) {
      if (!this.stream) {
        return
      }

      const { clipboard } = window.require('electron')
      this.stream.write(clipboard.readText())
    },

    write(data) {
      // Insert data at caret
      this.$refs.buffer.focus()
      handleAnsi(data, this.stream)

      // Scroll to bottom
      this.$refs.buffer.scrollTop = this.$refs.buffer.scrollHeight
    }
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
</style>

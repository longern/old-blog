<template>
  <div
    ref="buffer"
    class="terminal"
    contenteditable
    @keydown="handleKeydown"
    @keypress.prevent="handleKeypress"
    @contextmenu="handlePaste"
  >
  </div>
</template>

<script>
const ansiHtml = window.require('ansi-to-html')
const converter = new ansiHtml({ stream: true })

function handleAnsi(data) {
  console.log(data)

  // Handle set title
  data = data.replace(/\33\]0;([^\7]*)\7/, (match, title) => {
    document.title = title
    return ''
  })

  // Handle beep
  data = data.replace(/\7/, () => {
    return ''
  })

  // Handle backspace
  data = data.replace(/\10/, () => {
    const selection = window.getSelection()
    selection.modify('move', 'backward', 'character')
    return ''
  })

  // Handle carriage return
  data = data.replace(/\15(?!\12)/, () => {
    const selection = window.getSelection()
    selection.modify('move', 'backward', 'lineboundary')
    selection.modify('extend', 'forward', 'lineboundary')
    selection.deleteFromDocument()
    return ''
  })

  // Handle erase line
  data = data.replace(/\33\[K/, () => {
    const selection = window.getSelection()
    selection.modify('extend', 'forward', 'lineboundary')
    selection.deleteFromDocument()
    return ''
  })

  data = converter.toHtml(data)
  return data
}

module.exports = {
  props: {
    stream: Object
  },

  methods: {
    handleKeydown(ev) {
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

    handleKeypress(ev) {
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
      const selection = window.getSelection()
      const range = selection.getRangeAt(0)
      const fragment = range.createContextualFragment(handleAnsi(data))
      range.insertNode(fragment)
      range.collapse()

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

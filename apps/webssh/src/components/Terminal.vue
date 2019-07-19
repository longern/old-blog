<template>
  <div
    ref="buffer"
    class="terminal"
    contenteditable
    @keydown="handleKeydown"
    @keypress.prevent="handleKeypress"
  >
  </div>
</template>

<script>
const ansiHtml = window.require('ansi-to-html')
const converter = new ansiHtml({ stream: true })

function handleAnsi(data) {
  console.log(data)

  // Handle set title
  data = data.replace(/\]0;([^\7]*)\7/, (match, title) => {
    document.title = title
    return ''
  })

  // Handle beep
  data = data.replace(/\7/, () => {
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

    write(data) {
      this.$refs.buffer.focus()
      const selection = window.getSelection()
      const range = selection.getRangeAt(0)
      const fragment = range.createContextualFragment(handleAnsi(data))
      range.insertNode(fragment)
      range.collapse()
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

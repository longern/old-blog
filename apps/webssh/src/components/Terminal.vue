<template>
  <div
    ref="buffer"
    class="terminal"
    contenteditable
    @keypress.prevent="handleKeypress"
  >
  </div>
</template>

<script>
const ansiHtml = window.require('ansi-to-html')
const converter = new ansiHtml({ stream: true })

function handleAnsi(data) {
  // Handle set title
  data = data.replace(/\]0;([^\7]*)\7/, (match, title) => {
    document.title = title
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
    handleKeypress(ev) {
      if (!this.stream) {
        return
      }

      this.stream.write(String.fromCharCode(ev.which))
    },

    write(data) {
      this.$refs.buffer.insertAdjacentHTML('beforeend', handleAnsi(data))
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

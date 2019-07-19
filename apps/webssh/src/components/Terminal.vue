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
      const streamHtml = (new ansiHtml()).toHtml(data)
      console.log(streamHtml)
      this.$refs.buffer.insertAdjacentHTML('beforeend', streamHtml)
    }
  }
}
</script>

<style>
.terminal {
  width: 100%;
  height: 100%;

  outline: none;
  background: black;
  color: whitesmoke;
  caret-color: white;

  font-family: Consolas, monospace;

  white-space: pre-wrap;
}
</style>

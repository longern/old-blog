<template>
  <div ref="buffer" class="terminal" contenteditable></div>
</template>

<script>
const ansiHtml = window.require('ansi-html')

module.exports = {
  props: {
    stream: Object
  },

  methods: {
    write(data) {
      this.$refs.buffer.innerHTML += ansiHtml(data)
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

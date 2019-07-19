<template>
  <div ref="buffer" class="terminal" contenteditable></div>
</template>

<script>
module.exports = {
  methods: {
    write(data) {
      this.$refs.buffer.innerHTML += data
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
}
</style>

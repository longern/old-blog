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

<script src="src/components/terminal.js">
</script>

<style>
.terminal {
  --background-color: #222;
  --foreground-color: whitesmoke;

  width: 100%;
  height: 100%;
  overflow-y: scroll;

  outline: none;
  background: var(--background-color);
  color: var(--foreground-color);
  caret-color: white;

  font-family: Consolas, monospace;
  font-size: 14px;

  white-space: pre-wrap;
}

.terminal div::after {
  content: '\200B';
}
</style>

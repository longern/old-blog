<template>
  <div class="sidebar" @drop="handleDrop" @dragover.prevent>
    <v-list dense>
      <v-list-tile
        v-for="file in fileList"
        :key="file.filename"
        v-show="!file.filename.match(/^\./)"
        v-ripple
      >
        {{ file.filename }}
      </v-list-tile>
    </v-list>
  </div>
</template>

<script>
module.exports = {
  props: {
    fileList: Array
  },

  methods: {
    handleDrop(ev) {
      if (ev.dataTransfer.files.length) {
        this.$emit('upload', ev.dataTransfer.files)
      }
    }
  }
}
</script>

<style>
.sidebar {
  height: 100%;
}
</style>

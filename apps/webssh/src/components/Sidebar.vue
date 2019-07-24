<template>
  <div class="sidebar" @drop="handleDrop" @dragover.prevent>
    <v-list dense>
      <v-list-item
        v-for="file in fileList"
        :key="file.filename"
        v-show="!file.filename.match(/^\./)"
        v-ripple
      >
        {{ file.filename }}
      </v-list-item>
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

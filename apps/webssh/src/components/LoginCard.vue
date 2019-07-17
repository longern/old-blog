<template>
  <v-card class="elevation-12" style="min-width: 400px">
    <v-toolbar dark color="primary">
      <v-toolbar-title>Login</v-toolbar-title>
    </v-toolbar>
    <v-card-text>
      <v-form>
        <v-text-field v-model="url" label="URL" type="text"></v-text-field>
        <v-text-field v-model="privateKey" label="Private Key" type="text"></v-text-field>
      </v-form>
    </v-card-text>
    <v-card-actions>
      <v-spacer></v-spacer>
      <v-btn color="primary" @click="handleLogin">Login</v-btn>
    </v-card-actions>
  </v-card>
</template>

<script>
const fs = window.require('fs')
const url = window.require('url')

module.exports = {
  data() {
    return {
      url: "ssh://",
      privateKey: "",
    }
  },

  methods: {
    handleLogin() {
      const sshUrl = url.parse(this.url)
      this.$emit('input', {
        host: sshUrl.host,
        port: sshUrl.port || 22,
        username: sshUrl.auth,
        privateKey: this.privateKey
      })
    },
  }
}
</script>

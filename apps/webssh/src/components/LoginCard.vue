<template>
  <v-card class="elevation-12" style="min-width: 400px">
    <v-toolbar color="primary">
      <v-toolbar-title>Login</v-toolbar-title>
    </v-toolbar>
    <v-card-text>
      <v-form>
        <v-text-field v-model="url" label="URL" type="text"></v-text-field>
        <v-textarea
          v-model="privateKey"
          label="Private Key"
          type="text"
          append-outer-icon="folder_open"
          @click:append-outer="$refs.keyFile.click()"
        ></v-textarea>
        <input ref="keyFile" type="file" hidden @change="setPrivateKey">
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
const os = window.require('os')
const path = window.require('path')
const url = window.require('url')

function parseConfig(config) {
  return [
    'ssh://',
    (config.username || '').replace(/(.+)/, '$1@'),
    (config.host || ''),
    (config.port || '').toString().replace(/(.+)/, ':$1')
  ].join('')
}

module.exports = {
  data() {
    return {
      url: parseConfig(this.config),
      privateKey: this.config.privateKey || ''
    }
  },

  props: {
    config: Object
  },

  methods: {
    handleLogin() {
      const sshUrl = url.parse(this.url)
      this.$emit('input', {
        host: sshUrl.hostname,
        port: sshUrl.port || 22,
        username: sshUrl.auth,
        privateKey: this.privateKey,
        keepaliveInterval: 30000
      })
    },

    setPrivateKey() {
      if (this.$refs.keyFile.files.length) {
        this.privateKey = fs.readFileSync(this.$refs.keyFile.files[0].path, {
          encoding: 'utf-8'
        })
      }
    }
  },

  async mounted() {
    const h5native = window.require('h5native')
    const sshConfig = await h5native.requireAsync('ssh-config')

    const sshConfigPath = path.join(os.homedir(), '.ssh/config')
    if (fs.existsSync(sshConfigPath)) {
      const sshConfigContent = fs.readFileSync(sshConfigPath, { encoding: 'utf-8' })
      const parsedConfig = sshConfig.parse(sshConfigContent)
      console.log(parsedConfig)
    }
  }
}
</script>

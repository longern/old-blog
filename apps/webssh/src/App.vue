<template>
  <v-app>
    <v-navigation-drawer
      v-model="settings.drawer"
      permanent
    >
      <sidebar :file-list="fileList"></sidebar>
    </v-navigation-drawer>
    <v-content>
      <v-container fluid fill-height pa-0>
        <terminal ref="tty" v-show="sshConnection" :stream="stream"></terminal>
        <v-layout v-show="!sshConnection" align-center justify-center>
          <login-card :config="settings.config" @input="handleLogin"></login-card>
        </v-layout>
      </v-container>
    </v-content>
  </v-app>
</template>

<script>
const LoginCard = httpVueLoader('src/components/LoginCard.vue')
const Sidebar = httpVueLoader('src/components/Sidebar.vue')
const Terminal = httpVueLoader('src/components/Terminal.vue')

const util = window.require('util')
const ssh2 = window.require('ssh2')

function loadStoredSettings(settings) {
  const storageString = localStorage.getItem('WebSSHSettings')
  if (!storageString) {
    return
  }

  const storage = JSON.parse(storageString)
  for (const key in storage) {
    if (key in settings) {
      settings[key] = storage[key]
    }
  }
}

module.exports = {
  data() {
    return {
      fileList: [],
      settings: {
        drawer: true,
        config: {}
      },
      sshConnection: null,
      stream: null
    }
  },

  methods: {
    handleLogin(config) {
      this.settings.config = config
      const conn = new ssh2.Client()
      this.sshConnection = conn
      conn.on('ready', async () => {
        const sftp = await util.promisify(conn.sftp.bind(conn))()
        this.fileList = await util.promisify(sftp.readdir.bind(sftp))('.')
        this.stream = await util.promisify(conn.shell.bind(conn))({ pty: true })
        this.stream.on('close', () => {
          console.log('Stream :: close')
          conn.end()
        }).on('data', (data) => {
          this.$refs.tty.write(data.toString())
        })
      })
      conn.on('banner', (message) => {
        this.$refs.tty.write(message)
      })
      conn.connect(config)
    }
  },

  mounted() {
    loadStoredSettings(this.settings)
  },

  watch: {
    settings: {
      handler() {
        localStorage.setItem('WebSSHSettings', JSON.stringify(this.settings))
      },
      deep: true
    }
  },

  components: {
    LoginCard,
    Sidebar,
    Terminal
  }
}
</script>

<style>
html {
  overflow-y: hidden;
}

body {
  display: flex;
  flex-flow: column;
}

.titlebar {
  position: relative;
  font-family: sans-serif;
}

.container-after-titlebar {
  position: initial !important;
}

.application--wrap {
  flex-flow: row;
}
</style>

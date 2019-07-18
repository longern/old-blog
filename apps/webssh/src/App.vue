<template>
  <v-app>
    <v-navigation-drawer
      v-model="settings.drawer"
      fixed
      app
      permanent
    >
      <sidebar :file-list="fileList"></sidebar>
    </v-navigation-drawer>
    <v-content>
      <v-container fluid fill-height pa-0>
        <template v-if="sshConnection">
          <terminal></terminal>
        </template>
        <v-layout v-else align-center justify-center>
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
      sshConnection: null
    }
  },

  methods: {
    handleLogin(config) {
      this.settings.config = config
      const conn = new ssh2.Client()
      conn.on('ready', () => {
        this.sshConnection = conn
        conn.sftp((err, sftp) => {
          if (err) throw err
          sftp.readdir('.', (err, list) => {
            if (err) throw err
            this.fileList = list
          })
        })
      })
      conn.on('banner', (message) => {
        console.log(message)
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
</style>

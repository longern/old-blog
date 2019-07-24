<template>
  <v-app dark>
    <v-navigation-drawer
      v-model="settings.drawer"
      app
      permanent
    >
      <sidebar :file-list="fileList"></sidebar>
    </v-navigation-drawer>
    <v-content>
      <v-container fluid fill-height pa-0>
        <terminal ref="tty" v-show="sshConnection" :stream="stream"></terminal>
        <v-layout v-if="!sshConnection" align-center justify-center>
          <login-card
            :config="settings.config"
            :autoLogin="settings.autoLogin"
            @input="handleLogin"
          ></login-card>
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
const { remote } = window.require('electron')

function appMenuGenerator() {
  const component = this
  return remote.Menu.buildFromTemplate([
    {
      label: '&File',
      submenu: [
        {
          type: 'checkbox',
          label: 'Auto Login',
          checked: component.settings.autoLogin,
          click() {
            component.settings.autoLogin = !component.settings.autoLogin
          }
        },
        {
          label: '&Exit',
          click() { remote.getCurrentWindow().close() }
        }
      ]
    }
  ])
}

function loadStoredSettings(settings) {
  const storageString = localStorage.getItem('WebSSHStorage')
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
        autoLogin: false,
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
        this.$refs.tty.$el.focus()
        const sftp = await util.promisify(conn.sftp.bind(conn))()
        this.fileList = await util.promisify(sftp.readdir.bind(sftp))('.')
        this.stream = await util.promisify(conn.shell.bind(conn))({ term: 'xterm-256color' })
        this.stream.on('close', () => {
          this.$refs.tty.write('Connection Reset')
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

    const customTitlebar = window.require('custom-electron-titlebar')
    const titlebar = new customTitlebar.Titlebar({
      backgroundColor: customTitlebar.Color.WHITE,
      menu: appMenuGenerator.call(this)
    })

    new MutationObserver(function(mutations) {
      titlebar.updateTitle(mutations[0].target.nodeValue);
    }).observe(
        document.querySelector('title'),
        { childList: true }
    );

    if (this.settings.autoLogin) {
      this.handleLogin(this.settings.config)
    }
  },

  watch: {
    settings: {
      handler() {
        localStorage.setItem('WebSSHStorage', JSON.stringify(this.settings))
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
html, body {
  height: 100%;
}

html {
  overflow-y: hidden;
}

.titlebar {
  font-family: sans-serif;
}

.v-application--wrap, .v-navigation-drawer, .v-content {
  max-height: calc(100vh - 30px);
  min-height: calc(100vh - 30px);
}

.v-navigation-drawer {
  padding-top: 30px !important;
}

.v-content[data-booted=true] {
  transition: none;
}
</style>

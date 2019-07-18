<template>
  <v-app>
    <v-navigation-drawer
      v-model="drawer"
      fixed
      app
      :mobile-break-point="100"
    >
      <sidebar></sidebar>
    </v-navigation-drawer>
    <v-content>
      <v-container fluid fill-height>
        <template v-if="sshConnection">
          <terminal></terminal>
        </template>
        <v-layout v-else align-center justify-center>
          <login-card :config="config" @input="handleLogin"></login-card>
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

module.exports = {
  data() {
    return {
      settings: {
        drawer: true,
        config: null
      },
      sshConnection: null
    }
  },

  methods: {
    handleLogin(config) {
      this.config = config
      const conn = new ssh2.Client()
      conn.on('ready', function() {
        this.sshConnection = conn
      });
      conn.connect(config)
    }
  },

  components: {
    LoginCard,
    Sidebar,
    Terminal
  }
}
</script>

<template>
  <v-app>
    <v-content>
      <v-container fluid fill-height>
        <terminal v-if="sshConnection"></terminal>
        <v-layout v-else align-center justify-center>
          <login-card @input="handleLogin"></login-card>
        </v-layout>
      </v-container>
    </v-content>
  </v-app>
</template>

<script>
const LoginCard = httpVueLoader('src/components/LoginCard.vue')
const Terminal = httpVueLoader('src/components/Terminal.vue')
const ssh2 = window.require('ssh2')

module.exports = {
  data() {
    return {
      sshConnection: null
    }
  },

  methods: {
    handleLogin(config) {
      const conn = new ssh2.Client()
      conn.on('ready', function() {
        console.log('ready')
      })
      conn.connect(config)
    }
  },

  components: {
    LoginCard,
    Terminal
  }
}
</script>

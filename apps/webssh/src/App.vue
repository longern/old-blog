<template>
  <v-app>
    <v-content>
      <v-container fluid fill-height>
        <v-layout align-center justify-center>
          <login-card></login-card>
        </v-layout>
      </v-container>
    </v-content>
  </v-app>
</template>

<script>
const LoginCard = httpVueLoader('src/components/LoginCard.vue')

module.exports = {
  components: {
    LoginCard
  }
}
</script>

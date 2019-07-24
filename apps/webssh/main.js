(async function () {
  const h5native = require('h5native')
  await h5native.requireAsync('ssh2')
  await h5native.requireAsync('ansi-to-html')
})()

new Vue({
  el: '#ssh-app',
  components: {
    'app': httpVueLoader('src/App.vue')
  },
  vuetify: new Vuetify()
})

(async function () {

  const h5native = require('h5native')
  const ssh2 = h5native.requireAsync('ssh2')

})()

new Vue({
  el: '#app',
  components: {
    'app': httpVueLoader('src/App.vue')
  }
});

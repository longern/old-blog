(async function () {

  const fs = require('fs')
  const os = require('os')
  const path = require('path')

  const h5native = require('h5native')
  const ssh2 = h5native.requireAsync('ssh2')
  const sshConfig = h5native.requireAsync('ssh-config')

  const sshConfigPath = path.join(os.homedir(), '.ssh/config')
  if (fs.existsSync(sshConfigPath)) {
    console.log(sshConfig.parse(fs.readFileSync(sshConfigPath)))
  }

})()

new Vue({
  el: '#app',
  components: {
    'app': httpVueLoader('src/App.vue')
  }
});

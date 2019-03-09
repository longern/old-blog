(function() {

  function updateStorage() {
    localStorage.setItem('TUNetStorage', JSON.stringify(storage))
  }

  var storage = JSON.parse(localStorage.getItem('TUNetStorage') || '{}')

  var remote = null
  var request = null

  var onlineTimestamp = null
  var currentTimestamp = null
  var queryTimestamp = null

  function login(username, password) {
    if (!request) {
      return
    }

    request.post('https://net.tsinghua.edu.cn/do_login.php', {
      form: {
        action: 'login',
        username: username,
        password: '{MD5_HEX}' + CryptoJS.MD5(password),
        ac_id: 1
      }
    }, function(err) {
      if (!err) {
        queryUsage()
      }
    })
  }

  function logout() {
    if (!request) {
      return
    }

    request.post('https://net.tsinghua.edu.cn/do_login.php', {
      form: {
        action: 'logout'
      }
    }, function(err) {
      if (!err) {
        queryUsage()
      }
    })
  }

  function queryUsage() {
    request.get('http://net.tsinghua.edu.cn/rad_user_info.php', {}, function(err, response) {
      if (err) {
        return
      }
      
      if (!response.body) {
        $('#loginForm').show()
        $('#logoutForm').hide()
        $('#stateText').text($.i18n('Offline'))
        $('#usageProgress').text('? MB')

        queryTimestamp = null

        if (new Date(storage.usageLastUpdate).getMonth() !== new Date().getMonth()) {
          storage.usage = 0
        }
      } else {
        $('#loginForm').hide()
        $('#logoutForm').show()

        storage.onlineUser = response.body.split(',')[0]
        onlineTimestamp = +response.body.split(',')[1]
        currentTimestamp = +response.body.split(',')[2]
        storage.usage = +response.body.split(',')[6]
        storage.usageLastUpdate = Date.now()
        queryTimestamp = Date.now()

        $('#onlineUserText').text(storage.onlineUser)
        $('#stateText').text($.i18n('Online'))
        $('#durationText').text($.i18n('$1 seconds ago', currentTimestamp - onlineTimestamp))
      }

      const usagePercentage = storage.usage / (25 * 1000000000) * 100
      $('#usageProgress').css('width', usagePercentage + '%')

      if (storage.usage > 1073741824) {
        $('#usageProgress').text((storage.usage / 1000000000).toFixed(2) + ' GB')
      } else {
        $('#usageProgress').text((storage.usage / 1000000).toFixed(2) + ' MB')
      }

      updateStorage()
    })
  }

  async function queryIPAddress() {
    try {
      const response = await request('http://ip-api.com/json/?lang=zh-CN')

      const ipInfo = JSON.parse(response)

      $('#ipText').text(ipInfo.query + ', ' + ipInfo.city)
    } catch(e) {
      $('#ipText').text($.i18n('IP service unavailable'))
    }
  }

  $('#loginForm').on('submit', function() {
    login($('#usernameInput').val(), $('#passwordInput').val())
    return false
  })

  $('#logoutForm').on('submit', function() {
    logout()
    return false
  })

  $('#autorun').change(function() {
    remote.app.setLoginItemSettings({
      openAtLogin: this.checked,
      args: [
        remote.process.argv[remote.process.argv.length - 1]
      ]
    })
  })

  $.i18n().load({
    'zh-CN': 'i18n/zh-CN.json'
  })
    .then(function() {
      storage.i18nMessages = $.i18n().messageStore.messages
      updateStorage()
      $('[data-i18n]').i18n();
    })

  $.i18n().load(storage.i18nMessages)
  $('[data-i18n]').i18n();

  if (window.require) {
    remote = require('electron').remote
    request = require('request-promise-native')

    if (!request) {
      installPackage(['request, request-promise-native'], function() {
        location.reload()
      })
      return
    }

    const customTitlebar = require('custom-electron-titlebar')
    titlebar = new customTitlebar.Titlebar({
      icon: 'favicon.ico'
    })

    queryUsage()
    queryIPAddress()
    $('#autorun').val(remote.app.getLoginItemSettings().openAtLogin)
    if (storage.onlineUser) {
      $('#usernameInput').val(storage.onlineUser)
    }
  }

  window.setInterval(function() {
    if (!queryTimestamp) {
      return
    }
    $('#durationText').text($.i18n(
      '$1 seconds ago',
      Math.round((Date.now() - queryTimestamp) / 1000) + currentTimestamp - onlineTimestamp
    ))
  }, 1000)

})()

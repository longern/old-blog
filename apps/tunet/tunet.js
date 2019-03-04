(function() {

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
        return false
      }
      
      if (!response.body) {
        $('#loginForm').show()
        $('#logoutForm').hide()
        $('#stateText').text('Offline')
        $('#usageProgress').text('? MB')

        queryTimestamp = null
        return false
      }

      $('#loginForm').hide()
      $('#logoutForm').show()

      const onlineUser = response.body.split(',')[0]
      onlineTimestamp = +response.body.split(',')[1]
      currentTimestamp = +response.body.split(',')[2]
      const usage = +response.body.split(',')[6]
      queryTimestamp = Date.now()

      $('#onlineUserText').text(onlineUser)
      $('#stateText').text('Online')
      $('#durationText').text(`${currentTimestamp - onlineTimestamp} seconds ago`)

      const usagePercentage = usage / (25 * 1073741824) * 100
      $('#usageProgress').css('width', usagePercentage + '%')

      if (usage > 1073741824) {
        $('#usageProgress').text((usage / 1073741824).toFixed(2) + ' GB')
      } else {
        $('#usageProgress').text((usage / 1048576).toFixed(2) + ' MB')
      }

      return true
    })
  }

  function queryIPAddress() {
    request.get('http://ip.taobao.com/service/getIpInfo.php?ip=myip', {}, function(err, response) {
      if (err || response.statusCode > 299) {
        return false
      }

      const ipInfo = JSON.parse(response.body)
      if (ipInfo.code > 0) {
        return
      }

      $('#ipText').text(ipInfo.data.ip + ', ' + ipInfo.data.region)
    })
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
    remote.app.setLoginItemSettings({ openAtLogin: this.checked })
  })

  if (window.require) {
    remote = require('electron').remote
    request = require('request')

    if (!request) {
      installPackage(['request'], function() {
        location.reload()
      })
      return
    }

    queryUsage()
    queryIPAddress()
    $('#autorun').val(remote.app.getLoginItemSettings().openAtLogin)

    const customTitlebar = require('custom-electron-titlebar')
    titlebar = new customTitlebar.Titlebar({})
  }

  window.setInterval(function() {
    if (!queryTimestamp) {
      return
    }
    $('#durationText').text(`${Math.round((Date.now() - queryTimestamp) / 1000) + currentTimestamp - onlineTimestamp} seconds ago`)
  }, 1000)

})()

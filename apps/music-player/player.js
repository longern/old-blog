(async function() {
    const { api } = await import('./request.js')
    const _ = require('lodash')
    const audioElement = document.getElementById('audio')
    const player = app.p

    let topLyricWindow = null
    let loginWindow = null

    async function getLyric(id) {
        try {
            const lyricResponse = await api.song.lyric(id)
            const lyric = new Lyrics(lyricResponse.lrc.lyric)
            return lyric
        } catch(e) {
            return null
        }
    }

    window.playSong = async function(id) {
        id = +id
        const urlResponse = await api.song.url(id)
        player.src = urlResponse.data[0].url.replace(/(m\d+?)c/, '$1')
        await app.$nextTick()

        audioElement.play()
        player.paused = false

        player.currentSongId = id
        player.lyric = null
        currentLyric = await getLyric(id)
        if (currentLyric)
            player.lyric = currentLyric.getLyrics()

        if (!_.some(player.playlist, { id })) {
            try {
                const songDetail = (await api.song.detail(id)).songs[0]
                player.playlist.push(songDetail)
            } catch (e) { /* Ignore */ }
        }
    }

    async function musicPlayPause() {
        player.paused = !player.paused
    }

    function musicStop() {
        audioElement.stop()
    }

    function musicNextTrack() {
        if (!player.playlist.length)
            return

        let currentIndex = _.findIndex(player.playlist, {
            id: player.currentSongId
        })
        if (currentIndex === player.playlist.length - 1)
            currentIndex = -1
        // If currentIndex is -1, just play the first song
        playSong(player.playlist[currentIndex + 1].id)
    }

    function musicPreviousTrack() {
        if (!player.playlist.length)
            return

        let currentIndex = _.findIndex(player.playlist, {
            id: player.currentSongId
        })
        if (currentIndex <= 0)
            currentIndex = player.playlist.length
        // If currentIndex is -1, just play the last song
        playSong(player.playlist[currentIndex - 1].id)
    }

    async function syncCookies() {
        const { remote } = require('electron')
        const cookies = await new Promise((resolve, reject) => {
            remote.getCurrentWebContents().session.cookies.get({
                url: 'http://music.163.com'
            }, (error, cookies) => {
                resolve(cookies)
            })
        })
        api.cookie.set(cookies.map(c => `${c.name}=${c.value}`).join(';'))
    }

    function syncWithLyricWindow() {
        if (!topLyricWindow)
            return
        topLyricWindow.webContents.executeJavaScript(`
            lyricApp.currentSongId = ${player.currentSongId}
            lyricApp.startTime = ${Date.now() / 1000 - audioElement.currentTime}
            lyricApp.paused = ${player.paused}
        `)
    }

    document.addEventListener('keydown', function(event) {
        switch(event.which) {
            case 32:
                if (!event.repeat) {
                    musicPlayPause()
                }
                event.preventDefault()
                return
            default:
                break
        }
    })

    document.getElementById('btnPreviousTrack').addEventListener('click',  musicPreviousTrack)

    document.getElementById('btnPlayPause').addEventListener('click',  musicPlayPause)

    document.getElementById('btnNextTrack').addEventListener('click',  musicNextTrack)

    document.getElementById('btnVolume').addEventListener('click', function() {
        player.muted = !player.muted
    })

    document.getElementById('btnRepeatMode').addEventListener('click', function() {
        if (!player.repeatMode) {
            player.repeatMode = 'list'
        } else if (player.repeatMode === 'list') {
            player.repeatMode = 'shuffle'
        } else if (player.repeatMode === 'shuffle') {
            player.repeatMode = 'one'
        } else {
            player.repeatMode = null
        }
    })

    document.getElementById('btnTopLyric').addEventListener('click', function() {
        player.topLyric = !player.topLyric
    })

    audioElement.addEventListener('timeupdate', function() {
        player.currentTime = audioElement.currentTime
        player.duration = audioElement.duration

        if (currentLyric && player.lyric) {
            player.lyric.forEach(element => {
                element.current = false
            })

            const currentLine = currentLyric.select(audioElement.currentTime)
            if (currentLine >= 0)
                player.lyric[currentLine].current = true
            const pixels = -(currentLine * 36 + 18)
            document.getElementById('lyric').style.marginTop = `${pixels}px`
        } else {
            document.getElementById('lyric').style.marginTop = '-18px'
        }
        syncWithLyricWindow()
    })

    audioElement.addEventListener('ended', function() {
        player.paused = true
        if (player.repeatMode === 'list') {
            musicNextTrack()
        }
        if (player.repeatMode === 'shuffle') {
            const candidateSongs = _.reject(player.playlist, {
                id: player.currentSongId
            })
            playSong(candidateSongs[_.random(candidateSongs.length - 1)].id)
        }
    })

    app.$watch('p', function(newVal) {
        localStorage.setItem(
            'MusicPlayerStorage',
            JSON.stringify(_.omit(newVal, [
                'loginPassword',
                'lyric'
            ]))
        )
    }, { deep: true })

    app.$watch('p.paused', async function() {
        try {
            if (player.paused) {
                await audioElement.pause()
            } else {
                await audioElement.play()
            }
        } catch(e) { /* Ignore */ }
    })

    app.$watch('p.muted', async function() {
        audioElement.muted = player.muted
    })

    app.$watch('p.repeatMode', function() {
        if (player.repeatMode !== 'one') {
            audioElement.loop = false
        } else {
            audioElement.loop = true
        }
    }, { immediate: true })

    app.$watch('p.topLyric', function() {
        if (!topLyricWindow)
            return

        if (player.topLyric) {
            topLyricWindow.show()
            require('electron').remote.getCurrentWindow().focus()
        } else {
            topLyricWindow.hide()
        }
    })

    app.$on('playlistClicked', function(song) {
        playSong(song.id)
    })

    app.$on('playlistDeleteClicked', function(song) {
        player.playlist.splice(player.playlist.indexOf(song), 1)
    })

    app.$on('startSearch', async function() {
        if (!player.search)
            return
        try {
            player.searchResult = (await api.search.type(player.search, 1)).result.songs
        } catch (e) { }
    })

    app.$on('searchResultPlayClicked', function(id) {
        playSong(id)
    })

    app.$on('audioSliderInput', function(t) {
        if (isNaN(t))
            return
        audioElement.currentTime = t
        player.currentTime = t
    })

    let currentLyric = null

    if (window.require) {
        const { remote } = require('electron')

        document.getElementById('btnAccount').addEventListener('click', async function() {
            if (loginWindow) {
                loginWindow.show()
                return
            }

            loginWindow = new remote.BrowserWindow()
            loginWindow.loadURL('https://music.163.com/api/sns/authorize?snsType=5')

            loginWindow.webContents.on('did-finish-load', async function() {
                const reAfterLogin = /^https:\/\/music.163.com\/back\/sns/
                if (loginWindow.webContents.getURL().match(reAfterLogin)) {
                    try {
                        const text = await loginWindow.webContents.executeJavaScript('document.body.innerText')
                        const loginResponse = JSON.parse(text)
                        player.userId = loginResponse.account.id
                        player.avatarUrl = loginResponse.profile.avatarUrl
                        player.nickname = loginResponse.profile.nickname
                        syncCookies()
                    } catch(e) { }
                    loginWindow.close()
                }
            })

            loginWindow.on('closed', function() {
                loginWindow = null
            })
        })

        // Handle window buttons: minimize, maximize and close
        document.getElementById('btnMinimize').addEventListener('click', function() {
            remote.getCurrentWindow().minimize()
        })

        document.getElementById('btnMaximize').addEventListener('click', function() {
            if (remote.getCurrentWindow().isMaximized())
                remote.getCurrentWindow().unmaximize()
            else
                remote.getCurrentWindow().maximize()
        })

        document.getElementById('btnClose').addEventListener('click', function() {
            remote.getCurrentWindow().close()
        })

        // Create lyric window (bottom, center)
        const { width, height } = remote.screen.getPrimaryDisplay().workAreaSize

        topLyricWindow = new remote.BrowserWindow({
            x: width / 2 - 400,
            y: height - 100,
            width: 800,
            height: 80,
            frame: false,
            transparent: true,
            skipTaskbar: true,
            show: false,
            alwaysOnTop: true,
            webPreferences: {
                nodeIntegration: true
            }
        })

        topLyricWindow.loadURL(location.href.replace(/\/[^\/]*$/, '/') + 'topLyric.html')

        topLyricWindow.setIgnoreMouseEvents(true)

        topLyricWindow.webContents.on('did-frame-finish-load', syncWithLyricWindow)

        window.addEventListener('unload', function() {
            topLyricWindow.close()
            topLyricWindow = null
        })
    }

    // Load data from localStorage
    let storage = {}
    try {
        storage = JSON.parse(localStorage.getItem('MusicPlayerStorage'))
    } catch(e) { }

    Vue.set(player, 'avatarUrl', storage.avatarUrl || '')
    Vue.set(player, 'currentSongId', storage.currentSongId || 0)
    Vue.set(player, 'duration', storage.duration || '')
    Vue.set(player, 'loginDialog', false)
    Vue.set(player, 'loginPassword', '')
    Vue.set(player, 'loginUsername', storage.loginUsername || '')
    Vue.set(player, 'muted', storage.muted || false)
    Vue.set(player, 'nickname', storage.nickname || '')
    Vue.set(player, 'playlist', storage.playlist || [])
    Vue.set(player, 'repeatMode', storage.repeatMode || null)
    Vue.set(player, 'search', storage.search || '')
    Vue.set(player, 'searchResult', null)
    Vue.set(player, 'src', storage.src || '')
    Vue.set(player, 'topLyric', storage.topLyric || false)
    Vue.set(player, 'userId', storage.userId || 0)
    Vue.set(player, 'volume', storage.volume || 100)

    Vue.nextTick().then(function() {
        Vue.set(player, 'paused', storage.paused !== undefined ? storage.paused : true)
        Vue.set(player, 'currentTime', storage.currentTime || 0)
        audioElement.currentTime = storage.currentTime
    })

    if (player.currentSongId) {
        try {
            currentLyric = await getLyric(player.currentSongId)
            player.lyric = currentLyric.getLyrics()
        } catch(e) {
            player.lyric = null
        }
    }
})()

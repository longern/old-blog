(async function() {
    const { api } = await import('./request.js')
    const _ = await (async () => {
        let lodashPackage = require('lodash')
        if (lodashPackage) return lodashPackage
        await require('h5native').install('lodash')
        return require('lodash')
    })()

    const audioElement = document.getElementById('audio')
    const player = app.p

    let topLyricWindow = null
    let loginWindow = null

    function showSnackbar(text) {
        player.snackbar = true
        player.snackbarText = text
    }

    async function getLyric(id) {
        try {
            const lyricResponse = await api.song.lyric(id)
            const lyric = new Lyrics(lyricResponse.lrc.lyric)
            return lyric
        } catch(e) {
            return null
        }
    }

    async function getPlaylists() {
        if (!player.userId)
            return
        try {
            const playlistsData = (await api.user.playlist(player.userId)).playlist
            const details = await Promise.all(playlistsData.map(data => (
                api.playlist.detail(data.id)
            )))
            player.playlists = details.map(detail => {
                const tracks = detail.playlist.tracks
                tracks.id = detail.playlist.id
                tracks.name = detail.playlist.name
                return tracks
            })
        } catch(e) { }
    }

    window.playSong = async function(id) {
        id = +id
        const urlResponse = await api.song.url(id)
        if (urlResponse.data[0].code >= 400) {
            showSnackbar('Song not found')
            return
        }

        player.currentSongId = id
        player.src = (urlResponse.data[0].url || urlResponse.data[0].src || '')
            .replace(/(m\d+?)c/, '$1')
        if (!player.src) return

        await app.$nextTick()

        audioElement.play()
        player.paused = false

        player.lyric = null
        currentLyric = await getLyric(id)
        if (currentLyric)
            player.lyric = currentLyric.getLyrics()
    }

    async function musicPlayPause() {
        player.paused = !player.paused
    }

    function musicStop() {
        audioElement.stop()
    }

    function musicNextTrack() {
        if (player.currentPlaylist === -1 ||
            player.currentPlaylist >= player.playlists.length ||
            !player.playlists[player.currentPlaylist].length) {
            return
        }

        const playlist = player.playlists[player.currentPlaylist]

        let currentIndex = _.findIndex(playlist, {
            id: player.currentSongId
        })
        if (currentIndex === playlist.length - 1)
            currentIndex = -1
        // If currentIndex is -1, just play the first song
        playSong(playlist[currentIndex + 1].id)
    }

    function musicPreviousTrack() {
        if (player.currentPlaylist === -1 ||
            player.currentPlaylist >= player.playlists.length ||
            !player.playlists[player.currentPlaylist].length) {
            return
        }

        const playlist = player.playlists[player.currentPlaylist]

        let currentIndex = _.findIndex(playlist, {
            id: player.currentSongId
        })
        if (currentIndex <= 0)
            currentIndex = playlist.length
        // If currentIndex is -1, just play the last song
        playSong(playlist[currentIndex - 1].id)
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
            // No lyrics
            document.getElementById('lyric').style.marginTop = '-18px'
        }
        syncWithLyricWindow()
    })

    audioElement.addEventListener('waiting', function() {
        syncWithLyricWindow()
    })

    audioElement.addEventListener('ended', function() {
        player.paused = true
        if (player.repeatMode === 'list') {
            musicNextTrack()
        }
        if (player.repeatMode === 'shuffle') {
            const candidateSongs = _.reject(player.playlists[player.currentPlaylist], {
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

    app.$watch('p.volume', async function() {
        audioElement.volume = player.volume
    })

    app.$on('playlistClicked', function(playlist, song) {
        player.currentPlaylist = player.playlists.indexOf(playlist)
        playSong(song.id)
    })

    app.$on('playlistMenu', function(event, song) {
        player.menu.show = true
        player.menu.x = event.clientX
        player.menu.y = event.clientY
        player.menu.items = [{
            label: 'Delete',
            click() {
                player.playlists[player.currentPlaylist].splice(
                    player.playlists[player.currentPlaylist].indexOf(song),
                    1
                )
            }
        }]
    })

    app.$on('playlistDeleteClicked', function(song) {
        player.playlists[player.currentPlaylist].splice(
            player.playlists[player.currentPlaylist].indexOf(song),
            1
        )
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
                        syncCookies().then(getPlaylists)
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
        storage = JSON.parse(localStorage.getItem('MusicPlayerStorage')) || {}
    } catch(e) { }

    Vue.set(player, 'avatarUrl', storage.avatarUrl || '')
    Vue.set(player, 'currentPlaylist', storage.currentPlaylist !== undefined ? storage.currentPlaylist : -1)
    Vue.set(player, 'currentSongId', storage.currentSongId || 0)
    Vue.set(player, 'duration', storage.duration || '')
    Vue.set(player, 'loginPassword', '')
    Vue.set(player, 'loginUsername', storage.loginUsername || '')
    Vue.set(player, 'menu', {})
    Vue.set(player, 'muted', storage.muted || false)
    Vue.set(player, 'nickname', storage.nickname || '')
    Vue.set(player, 'playlists', storage.playlists || [])
    Vue.set(player, 'repeatMode', storage.repeatMode || null)
    Vue.set(player, 'search', storage.search || '')
    Vue.set(player, 'searchResult', null)
    Vue.set(player, 'snackbar', false)
    Vue.set(player, 'snackbarText', '')
    Vue.set(player, 'src', storage.src || '')
    Vue.set(player, 'topLyric', storage.topLyric || false)
    Vue.set(player, 'userId', storage.userId || 0)
    Vue.set(player, 'volume', storage.volume || 100)

    Vue.nextTick().then(function() {
        Vue.set(player, 'paused', storage.paused !== undefined ? storage.paused : true)
        Vue.set(player, 'currentTime', storage.currentTime || 0)
        audioElement.currentTime = storage.currentTime || 0
    })

    if (player.currentSongId) {
        try {
            currentLyric = await getLyric(player.currentSongId)
            player.lyric = currentLyric.getLyrics()
        } catch(e) {
            player.lyric = null
        }
    }

    if (player.userId) {
        getPlaylists()
    }
})()

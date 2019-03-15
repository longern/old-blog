(async function() {
    const { api } = await import('./request.js')
    console.log(api)
    const _ = require('lodash')
    const audioElement = document.getElementById('audio')
    const player = app.p

    let currentTimeLock = false
    let currentLyric = null

    Vue.set(player, 'currentTime', 0)
    Vue.set(player, 'duration', 0)
    Vue.set(player, 'repeatMode', null)
    Vue.set(player, 'lyric', '')
    Vue.set(player, 'muted', false)
    Vue.set(player, 'paused', true)
    Vue.set(player, 'playlist', [])
    Vue.set(player, 'src', '')
    Vue.set(player, 'topLyric', false)
    Vue.set(player, 'volume', 100)

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
        const urlResponse = await api.song.url(id)
        player.src = urlResponse.data[0].url.replace(/(m\d+?)c/, '$1')
        await app.$nextTick()
        audioElement.play()
        player.paused = false
        currentLyric = await getLyric(id)
        if (currentLyric)
            player.lyric = currentLyric.getLyrics()
        else
            player.lyric = null
    }

    async function musicPlayPause() {
        try {
            if (audioElement.paused) {
                await audioElement.play()
                player.paused = false
            }
            else {
                await audioElement.pause()
                player.paused = true
            }
        } catch(e) { /* Ignore */ }
    }

    function musicStop() {
        audioElement.stop()
    }

    function musicNextTrack() {

    }

    function musicPreviousTrack() {

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

    document.getElementById('btnPlayPause').addEventListener('click',  musicPlayPause)

    document.getElementById('btnRepeatMode').addEventListener('click', function() {
        if (!player.repeatMode) {
            audioElement.loop = true
            player.repeatMode = 'one'
        } else {
            audioElement.loop = false
            player.repeatMode = null
        }
    })

    document.getElementById('btnTopLyric').addEventListener('click', function() {
        player.topLyric = !player.topLyric
    })

    audioElement.addEventListener('timeupdate', function() {
        currentTimeLock = true
        player.currentTime = audioElement.currentTime
        setTimeout(() => { currentTimeLock = false }, 0)
        player.duration = audioElement.duration
        if (currentLyric)
            document.getElementById('lyric').style.top = `-${currentLyric.select(audioElement.currentTime) * 36}px`
    })

    audioElement.addEventListener('ended', function() {
        player.paused = true
    })

    app.$watch('p.currentTime', function(newVal) {
        if (currentTimeLock)
            return
        audioElement.currentTime = newVal
    })

    app.$on('playlistClicked', function(song) {
        // handle playlist clicked
    })
})()

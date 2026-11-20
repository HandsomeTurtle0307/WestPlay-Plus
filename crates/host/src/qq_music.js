// QQ Music (y.qq.com): the page itself, in a hidden WebView, both plays and answers; this script asks it
// what the cabin app wants to know, and plays what the app picks.
//
// Nothing of QQ Music's is a public API here. The app's own API is used instead, the one its web player
// calls: `u.y.qq.com/cgi-bin/musicu.fcg`, with the page's own session (its cookies, so its account). The
// songs themselves play in an element of this script's own, given the address QQ Music's own player would
// have played (`music.vkey.GetVkey`), so the app picks a song and it plays at once, as Apple Music's does.
//
// The page's own player still plays too (a song picked there), and is what is read when this one has
// nothing: what either plays is the song the cab shows.
//
// Its sound goes through the truck's speakers as the other players' do (`cab_sound.js`, loaded before this).
(() => {
  if (window.__westplayQqMusic) return
  window.__westplayQqMusic = true

  const post = (message) => window.chrome?.webview?.postMessage(message)
  const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

  // --- QQ Music's own API -------------------------------------------------------------------------

  // The page's account: its `uin` cookie (0 when signed out), and the key its requests carry.
  const cookie = (name) => {
    const found = document.cookie.split('; ').find((pair) => pair.startsWith(name + '='))
    return found ? decodeURIComponent(found.slice(name.length + 1)) : ''
  }
  const account = () => ({ uin: cookie('uin').replace(/^o/, '') || '0', key: cookie('qm_keyst') || '' })

  // Its `comm`: what every request of the page's own carries (its client, its account).
  const comm = () => {
    const { uin, key } = account()
    return { ct: 24, cv: 0, v: '1.0', uin, format: 'json', authst: key, tmeAppID: 'qqmusic' }
  }

  // A request of its own API, by a script tag: what its own pages do (a fetch of it is another origin's,
  // and its answer says nothing of the page's account then).
  const jsonp = (body) =>
    new Promise((resolve, reject) => {
      const name = `qqJsonp${Math.floor(Math.random() * 1e9)}`
      const script = document.createElement('script')
      const settle = (done) => (value) => {
        clearTimeout(timer)
        delete window[name]
        script.remove()
        done(value)
      }
      const timer = setTimeout(settle(() => reject(new Error('qq music: no answer'))), 8000)
      window[name] = settle(resolve)
      script.onerror = settle(() => reject(new Error('qq music: no answer')))
      script.src = `https://u.y.qq.com/cgi-bin/musicu.fcg?format=jsonp&callback=${name}&data=${encodeURIComponent(JSON.stringify(body))}`
      document.head.appendChild(script)
    })

  // A request of its own API: `module` and `method` as its player makes them. Answers with `req.data`,
  // where every one of its answers puts what was asked for.
  const call = async (module, method, param) => {
    const body = { comm: comm(), req: { module, method, param } }
    let said
    try {
      const response = await fetch('https://u.y.qq.com/cgi-bin/musicu.fcg', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(body),
      })
      if (!response.ok) throw new Error('refused')
      said = await response.json()
    } catch {
      said = await jsonp(body)
    }
    const req = said?.req ?? {}
    if (req.code && req.code !== 0) throw new Error(`qq music: ${method} answered ${req.code}`)
    return req.data ?? {}
  }

  // --- What it says a song is ---------------------------------------------------------------------

  const cover = (album) => {
    const mid = album?.mid ?? album?.albumMid
    return mid ? `https://y.gtimg.cn/music/photo_new/T002R300x300M000${mid}.jpg` : null
  }

  // A song of its lists (a search's, a playlist's, an album's), as the cab shows it.
  const track = (song) => {
    if (!song) return null
    const singers = song.singer ?? song.singers ?? []
    const album = song.album ?? {}
    const mid = song.mid ?? song.songmid ?? song.songMid ?? ''
    return {
      id: mid,
      title: song.name ?? song.title ?? song.songname ?? '',
      artist: singers.map((singer) => singer?.name ?? '').filter(Boolean).join(', '),
      album: album.name ?? album.albumname ?? '',
      cover: cover(album),
      duration: Number(song.interval ?? song.duration ?? 0),
      // Its own list of what may not play without a subscription (shown, not hidden).
      vip: Boolean(song.pay?.pay_play || song.pay?.pay_down === 2),
    }
  }

  const tracks = (list) => (Array.isArray(list) ? list.map(track).filter((one) => one && one.id) : [])

  // An album, playlist or song list's page, as the cab shows it.
  const item = ({ id, title, subtitle, image, kind }) => ({ id, title, subtitle: subtitle ?? '', image: image ?? null, kind })

  // --- The app's questions ------------------------------------------------------------------------

  const search = async ({ query, page }) => {
    const data = await call('music.search.SearchCgiService', 'DoSearchForQQMusicDesktop', {
      query,
      num_per_page: 30,
      page_num: Math.max(1, Number(page) || 1),
      search_type: 0,
      grp: 1,
    })
    const body = data?.body ?? {}
    // Its own grouping: songs first, then the playlists, albums and singers that match (all it sent).
    return {
      songs: tracks(body.song?.list),
      playlists: (body.songlist?.list ?? []).map((list) =>
        item({
          id: String(list.dissid ?? list.content_id ?? ''),
          title: list.dissname ?? list.title ?? '',
          subtitle: list.creator?.name ?? '',
          image: list.imgurl ?? null,
          kind: 'playlist',
        }),
      ),
      albums: (body.album?.list ?? []).map((album) =>
        item({
          id: album.albumMID ?? album.mid ?? '',
          title: album.albumName ?? album.name ?? '',
          subtitle: album.singerName ?? (album.singer ?? []).map((one) => one.name).join(', '),
          image: cover(album),
          kind: 'album',
        }),
      ),
      artists: (body.singer?.list ?? []).map((singer) =>
        item({
          id: singer.singerMID ?? singer.mid ?? '',
          title: singer.singerName ?? singer.name ?? '',
          subtitle: '',
          image: singer.singerPic ?? singer.pic ?? null,
          kind: 'artist',
        }),
      ),
      more: tracks(body.song?.list).length >= 30,
    }
  }

  // A playlist's page (its songs), by the id a search or the page's own links gave.
  const playlist = async ({ id, page }) => {
    const offset = Math.max(0, (Math.max(1, Number(page) || 1) - 1) * 100)
    const data = await call('music.srfDissInfo.aiDissInfo', 'uniform_get_Dissinfo', {
      disstid: Number(id),
      enc_host_uin: '',
      tag: 1,
      userinfo: 1,
      song_begin: offset,
      song_num: 100,
    })
    const list = data?.dirinfo ?? {}
    return {
      collection: {
        item: item({
          id: String(list.dissid ?? id),
          title: list.dissname ?? list.title ?? '',
          subtitle: list.nickname ?? list.creator?.name ?? '',
          image: list.logo ?? null,
          kind: 'playlist',
        }),
        description: list.desc ?? '',
        tracks: tracks(data?.songlist),
      },
      more: (data?.songlist ?? []).length >= 100,
    }
  }

  // An album's page: its songs, in its own order.
  const album = async ({ id }) => {
    const data = await call('music.musichallAlbum.AlbumInfoServer', 'GetAlbumDetail', { albumMid: id })
    const info = data?.basicInfo ?? {}
    return {
      collection: {
        item: item({
          id,
          title: info.albumName ?? '',
          subtitle: info.singerName ?? (info.singer ?? []).map((one) => one.name).join(', '),
          image: cover({ mid: info.albumMid ?? id }),
          kind: 'album',
        }),
        description: info.desc ?? '',
        year: Number(info.publishDate?.slice(0, 4)) || null,
        tracks: tracks(data?.songList),
      },
      more: false,
    }
  }

  // A singer's page: their songs, and their albums.
  const artist = async ({ id }) => {
    const data = await call('music.musichallSinger.SingerInfoInter', 'GetSingerDetail', {
      singer_mids: [id],
      group_singer: 1,
      wide: 1,
    })
    const info = data?.singer_list?.[0] ?? {}
    const songs = await call('music.musichallSong.SingerSongList', 'GetSingerSongList', {
      singerMid: id,
      begin: 0,
      num: 30,
      order: 1,
    })
    return {
      artist: {
        item: item({
          id,
          title: info.singer_info?.name ?? info.name ?? '',
          subtitle: '',
          image: info.singer_info?.pic ?? info.pic ?? null,
          kind: 'artist',
        }),
        top: tracks(songs?.songList),
      },
    }
  }

  // Home: what QQ Music recommends — its picks for today, and its charts.
  const home = async () => {
    const shelves = []
    try {
      const recommended = await call('music.musicHall.MusicHall', 'GetRecommend', { v: 1 })
      const lists = recommended?.data?.songlist ?? recommended?.songlist ?? []
      if (lists.length) {
        shelves.push({
          title: '推荐歌单',
          items: lists.slice(0, 20).map((list) =>
            item({
              id: String(list.dissid ?? list.content_id ?? ''),
              title: list.dissname ?? list.title ?? '',
              subtitle: '',
              image: list.imgurl ?? null,
              kind: 'playlist',
            }),
          ),
        })
      }
    } catch {
      // Its own recommendations may need a signed-in account: the charts below are still worth showing.
    }
    try {
      const charts = await call('music.musicToplist.Toplist', 'GetToplist', {})
      const lists = charts?.data?.toplist ?? charts?.toplist ?? []
      if (lists.length) {
        shelves.push({
          title: '排行榜',
          items: lists.slice(0, 20).map((list) =>
            item({
              id: String(list.topId ?? list.id ?? ''),
              title: list.title ?? list.topTitle ?? '',
              subtitle: list.intro ?? '',
              image: list.frontPicUrl ?? list.picUrl ?? null,
              kind: 'chart',
            }),
          ),
        })
      }
    } catch {
      // No charts: the recommendations alone are a home.
    }
    return { home: { shelves } }
  }

  // The account's own library: the playlists it made or keeps.
  const library = async () => {
    const { uin } = account()
    if (uin === '0') return { library: { signedIn: false, shelves: [] } }
    const data = await call('music.musicasset.PlaylistBaseRead', 'GetPlaylistByUin', { uin, num: 100 })
    const lists = data?.v_playlist ?? data?.playlist ?? []
    return {
      library: {
        signedIn: true,
        shelves: [
          {
            title: '我的歌单',
            items: lists.map((list) =>
              item({
                id: String(list.dissid ?? list.tid ?? ''),
                title: list.dissname ?? list.title ?? '',
                subtitle: `${list.songnum ?? list.song_count ?? 0} 首`,
                image: list.imgurl ?? list.photo ?? null,
                kind: 'playlist',
              }),
            ),
          },
        ],
      },
    }
  }

  // A song's words, when QQ Music has them.
  const lyrics = async ({ id }) => {
    const data = await call('music.musicasset.LyricCgi', 'GetLyric', { songMid: id })
    const text = data?.lyric ?? data?.lyrics ?? ''
    return { lyrics: parseLyrics(text) }
  }

  // Its words as lines with their times (LRC), as the cab draws them.
  const parseLyrics = (text) => {
    const lines = []
    for (const raw of String(text).split('\n')) {
      const said = raw.match(/^((?:\[\d+:\d+(?:[.:]\d+)?\])+)(.*)$/)
      if (!said) continue
      const at = [...said[1].matchAll(/\[(\d+):(\d+(?:[.:]\d+)?)\]/g)].map(
        (one) => Number(one[1]) * 60 + Number(String(one[2]).replace(':', '.')),
      )
      const words = said[2].trim()
      if (words) for (const second of at) lines.push({ at: second, text: words })
    }
    return lines.sort((a, b) => a.at - b.at)
  }

  const QUESTIONS = { search, playlist, album, artist, home, library, lyrics }

  // --- The app's own player -----------------------------------------------------------------------

  // The element the app plays in: QQ Music's page makes its own, and this one is the app's (so a song it
  // picks plays at once, as Apple Music's, without the page's own player being driven).
  const own = document.createElement('audio')
  own.preload = 'auto'
  // The file's own bytes are the cab's speakers' to read (their filters, their meters): for that the CDN has to
  // give them to the page (CORS). One that won't: the file plays as it is, and the speakers are the plain way.
  own.crossOrigin = 'anonymous'
  own.addEventListener('error', () => {
    if (!own.crossOrigin || !own.src) return
    own.crossOrigin = null
    own.load()
  })
  own.addEventListener('play', () => step())
  own.addEventListener('pause', () => step())
  own.addEventListener('ended', () => next().catch(() => {}))
  own.addEventListener('loadedmetadata', () => step())
  own.addEventListener('timeupdate', () => step())

  // The queue: the songs the app picked, in their order, and where in it.
  let queue = []
  let index = -1
  let shuffle = false
  let repeat = 'off'

  // Its address for a song: the one its own player would have played (a key, then the file). Its API has
  // moved that key's method once already, so both are asked.
  const address = async (id) => {
    const { uin } = account()
    const names = [`M500${id}.mp3`, `C400${id}.m4a`, `M800${id}.mp3`]
    const param = {
      filename: names,
      guid: String(Math.floor(Math.random() * 1e9)),
      songmid: [id, id, id],
      songtype: [0, 0, 0],
      uin,
    }
    for (const [module, method] of [
      ['music.vkey.GetVkey', 'UrlGetVkey'],
      ['music.vkey.GetVkeyWeb', 'GetUrl'],
    ]) {
      try {
        const data = await call(module, method, param)
        const purl = (data?.midurlinfo ?? data?.midurlinfoList ?? []).find((one) => one?.purl)?.purl
        if (purl) return purl.startsWith('http') ? purl : `https://isure.stream.qqmusic.qq.com/${purl}`
      } catch {
        // That key's way refused: the other's asked.
      }
    }
    // A song the account may not play comes back without a file: said, not guessed at (`subscription`: the
    // cab has its own words for it, `Playback.said`).
    throw new Error('subscription')
  }

  // A song of the queue, ready to play: its address fetched as it's needed (they're short-lived).
  const ready = async (at) => {
    const song = queue[at]
    if (!song) return null
    const url = await address(song.id)
    return { song, url }
  }

  // Why the song asked for can't play (`subscription`: the account's doesn't cover it; `unplayable`: QQ Music
  // gave no address for it, or the element refused it): the cab says it rather than showing a song that never
  // starts. Cleared as the next song is asked for.
  let trouble = ''

  const playAt = async (at) => {
    index = at
    trouble = ''
    let playing = null
    try {
      playing = await ready(at)
    } catch (error) {
      trouble = String(error?.message) === 'subscription' ? 'subscription' : 'unplayable'
    }
    if (!playing) {
      // Nothing to play: the element silenced, and the page's own player too (the cab is to be told of the song
      // it asked for, which can't play — not of something else the page happened to be playing).
      own.pause()
      own.removeAttribute('src')
      pausePage()
      report()
      return
    }
    // One sound at a time: the page's own player paused first (a song played on y.qq.com itself would
    // otherwise still be sounding under this one).
    pausePage()
    own.src = playing.url
    try {
      await own.play()
    } catch {
      trouble = 'unplayable'
    }
    report()
  }

  // The songs as the app has them (its page's lists, which it alone knows the names of).
  const start = async ({ songs, at }) => {
    const list = (Array.isArray(songs) ? songs : [])
      .filter((song) => song?.id)
      .map((song) => ({
        id: String(song.id),
        title: song.title ?? '',
        artist: song.artist ?? '',
        album: song.album ?? '',
        cover: song.cover ?? null,
        duration: Number(song.duration) || 0,
        vip: Boolean(song.vip),
      }))
    if (!list.length) return
    queue = list
    own.muted = false
    await playAt(Math.max(0, Math.min(Number(at) || 0, list.length - 1)))
  }

  const next = async () => {
    if (!queue.length) return
    if (repeat === 'one') return playAt(index)
    const at = index + 1
    if (at < queue.length) return playAt(at)
    if (repeat === 'all') return playAt(0)
  }

  const previous = async () => {
    if (!queue.length) return
    if (own.currentTime > 3) {
      own.currentTime = 0
      return
    }
    const at = index - 1
    if (at >= 0) return playAt(at)
    if (repeat === 'all') return playAt(queue.length - 1)
  }

  // --- The page's own player ----------------------------------------------------------------------

  // QQ Music makes its element itself, and may make more than one (the next song readied before it plays).
  let sounding = null
  const known = new Set()
  const keep = (element) => {
    if (!(element instanceof HTMLMediaElement) || element === own) return
    sounding = element
    if (known.has(element)) return
    known.add(element)
    for (const name of ['play', 'pause', 'ended', 'loadedmetadata', 'durationchange', 'volumechange']) {
      element.addEventListener(name, () => step())
    }
  }
  const mediaPlay = HTMLMediaElement.prototype.play
  HTMLMediaElement.prototype.play = function (...args) {
    keep(this)
    return mediaPlay.apply(this, args)
  }
  addEventListener('playing', (event) => keep(event.target), true)

  // The page's own element, paused: the app's own player is to be the one sound (a song picked on y.qq.com
  // itself, or its own player started by a press, would otherwise play under it).
  const pausePage = () => {
    for (const element of known) if (!element.paused) element.pause()
  }

  // The one playing now: not paused, not ended, not muted (a silent one is not what the cab hears).
  const pagePlaying = () => [...known].find((element) => !element.paused && !element.ended && !element.muted) ?? sounding
  // The page's element, for the speakers: found by the page's own tree when none has played yet.
  const pageElement = () => pagePlaying() ?? document.querySelector('audio')

  // The page's own reading of the song, when it says it (`mediaSession`, which QQ Music sets for the
  // system's own controls): the surest of the two. Its player bar is read when it does not.
  const session = () => {
    try {
      const said = navigator.mediaSession?.metadata
      if (!said?.title) return null
      const art = said.artwork?.[said.artwork.length - 1]?.src ?? null
      return { title: said.title, artist: said.artist ?? '', album: said.album ?? '', cover: art }
    } catch {
      return null
    }
  }

  // The player bar: its class names have changed across QQ Music's own versions, so what a name says is
  // looked for rather than any one name (`songname`, `song_name`, `songname__name`…).
  const bar = () => document.querySelector('[class*="player__"]') ?? document.querySelector('.player') ?? document.body
  const textOf = (names) => {
    const root = bar()
    for (const name of names) {
      const found = root.querySelector(`[class*="${name}"]`)
      const text = found?.textContent?.trim()
      if (text) return { text, found }
    }
    return null
  }
  const coverOf = () => {
    const root = bar()
    const images = [...root.querySelectorAll('img')].filter((image) => image.currentSrc || image.src)
    // The cover is the square one, and the largest in the bar: QQ Music's own icons are small and fixed.
    const square = images.filter((image) => image.naturalWidth > 40 && Math.abs(image.naturalWidth - image.naturalHeight) < 8)
    const cover = square.sort((a, b) => b.naturalWidth - a.naturalWidth)[0] ?? images[0]
    const src = cover?.currentSrc || cover?.src || null
    return src && src.startsWith('http') ? src : null
  }

  let last = { title: '', artist: '', cover: null }
  const pageSong = () => {
    const said = session()
    if (said) {
      last = { title: said.title, artist: said.artist, cover: said.cover ?? last.cover }
      return { ...said, cover: said.cover ?? coverOf() ?? last.cover }
    }
    const title = textOf(['songname', 'song_name', 'songname__name', 'player__songname'])
    const artist = textOf(['singer', 'artist', 'player__artist', 'songname__singer'])
    const read = title?.text ?? last.title
    // A player bar without its song (a page still loading) keeps the last one: never a blank screen.
    if (!read) return last.title ? { ...last, album: '' } : null
    last = { title: read, artist: artist?.text || last.artist, cover: coverOf() ?? last.cover }
    return { ...last, album: '' }
  }

  // What the app's own player plays (the queue's song, which it alone knows): said as it is, and kept.
  const ownSong = () => (index >= 0 ? queue[index] : null)

  // The element the cab hears: whichever of the two is playing — the app's own, or the page's (a song picked
  // there) — and, with neither playing, the app's own while it has a song to come back to.
  const element = () => {
    if (ownSong() && own.src && !own.paused && !own.ended) return own
    const page = pageElement()
    if (page && !page.paused && !page.ended) return page
    return ownSong() ? own : page
  }

  // --- Saying it ----------------------------------------------------------------------------------

  const told = { playback: '' }
  const report = () => {
    const media = element()
    // What plays is whichever element says it: the app's own (its queue's song, which it alone knows), or the
    // page's (a song picked there).
    const mine = media === own ? ownSong() : null
    const playing = Boolean(media && !media.paused && !media.ended && !media.muted)
    if (!media) {
      // Nothing to say yet: QQ Music's page has made no element (it's still loading).
      return
    }
    const duration = Number.isFinite(media.duration) && media.duration > 0 ? media.duration : mine ? mine.duration : 0
    const song_ = mine ?? pageSong()
    const playback = song_
      ? {
          track: {
            id: song_.id ?? `${song_.title}\u0000${song_.artist}`,
            title: song_.title,
            artist: song_.artist,
            album: song_.album ?? '',
            cover: song_.cover ?? null,
            duration,
          },
          playing,
          loading: media.readyState < 3 && playing,
          position: media.currentTime,
          duration,
          volume: media.muted ? 0 : Math.round(media.volume * 100),
          shuffle,
          repeat,
          queue: queue.length,
          index,
          // Why it can't play, when it can't: the cab says so instead of showing a song never started.
          said: trouble || undefined,
        }
      : null
    // Said as it changes, and every second while it plays (the position the app can't guess: a song may
    // start again at the same second, and the app would keep its own count).
    const key = playback
      ? `${playback.playing}:${Math.round(playback.position)}:${playback.track.title}:${playback.track.artist}:${trouble}`
      : 'none'
    if (key === told.playback) return
    told.playback = key
    post({ playback })
  }

  let ticking = false
  function step() {
    if (ticking) return
    ticking = true
    setTimeout(() => {
      ticking = false
      report()
    }, 60)
  }

  // --- The app's commands -------------------------------------------------------------------------

  // The page's own buttons, by what they do (`title`, `data-action`, a name that says it): QQ Music's own
  // names have changed, its labels less so.
  const press = (names, labels) => {
    for (const name of names) {
      const button = document.querySelector(name)
      if (button) {
        button.click()
        return true
      }
    }
    const all = [...document.querySelectorAll('a, button, i, span[class*="btn"]')]
    const button = all.find((element) => labels.some((label) => element.getAttribute('title') === label || element.textContent?.trim() === label))
    button?.click()
    return Boolean(button)
  }

  const CONTROLS = {
    // A song (or a list, from one of it): the app's own player.
    play: async (data) => {
      if (data.songs) return start(data)
      if (ownSong()) {
        // The page's own player paused first: one sound at a time.
        pausePage()
        own.muted = false
        return own.play().catch(() => {})
      }
      const media = pageElement()
      if (!media) return press(['[class*="btn_big_play"]'], ['播放'])
      await media.play().catch(() => press(['[class*="btn_big_play"]'], ['播放']))
    },
    pause: async () => {
      if (ownSong()) {
        own.pause()
        return
      }
      const media = pagePlaying()
      if (media) {
        media.pause()
        return
      }
      press(['[class*="btn_big_play"]'], ['暂停'])
    },
    next,
    previous,
    seek: async ({ seconds }) => {
      const media = element()
      if (media && Number.isFinite(seconds)) media.currentTime = Math.max(0, Math.min(seconds, media.duration || seconds))
    },
    volume: async ({ percent }) => {
      const media = element()
      if (!media) return
      const share = Math.max(0, Math.min(1, Number(percent) / 100))
      media.muted = share === 0
      media.volume = share
    },
    // The cab's fades go through `volume` (the level itself, as the other players' `sendVolume`): a fade of
    // its own, kept apart from the player's volume, was never asked for and is gone.
    shuffle: async ({ on }) => {
      shuffle = Boolean(on)
      // Shuffled, the queue is dealt again, the song playing first.
      if (shuffle && queue.length > 1 && index >= 0) {
        const song = queue[index]
        const rest = queue.filter((_, at) => at !== index)
        for (let i = rest.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1))
          ;[rest[i], rest[j]] = [rest[j], rest[i]]
        }
        queue = [song, ...rest]
        index = 0
      }
      step()
    },
    repeat: async ({ mode }) => {
      repeat = mode === 'all' || mode === 'one' ? mode : 'off'
      step()
    },
    start: async () => {},
    signIn: async () => post({ signIn: true }),
    // A question, answered with the same id (its answer, or nothing when its API refused).
    ask: async ({ id, question }) => {
      const name = question?.ask
      const asked = QUESTIONS[name]
      try {
        const answer = asked ? await asked(question) : {}
        post({ answer: id, [name]: answer[name] ?? answer })
      } catch (error) {
        post({ answer: id, [name]: null, said: String(error?.message ?? error) })
      }
    },
  }

  // --- The truck's speakers -----------------------------------------------------------------------

  const cab = window.westplayCabSound?.(() => element(), post)
  let saidCab = ''
  const tellCab = () => {
    const found = element()
    const levels = cab?.level()
    const now = levels
      ? `through the speakers (${found?.tagName.toLowerCase() ?? 'media'})`
      : found
        ? ''
        : 'no media element found'
    if (now && now !== saidCab) post({ speakers: (saidCab = now) })
  }
  if (cab) {
    setInterval(() => {
      cab.tick()
      tellCab()
    }, 250)
  }
  const CAB = {
    speakers: (data) => cab?.speakers(data.speakers),
    head: (data) => cab?.head(data),
    outside: (data) => cab?.outside(data.on, data.distance),
    equalizer: (data) => cab?.equalizer(data),
    spectrum: (data) => cab?.spectrum(data.on),
  }

  window.chrome?.webview?.addEventListener('message', ({ data }) => {
    if (CAB[data?.action]) CAB[data.action](data)
    else CONTROLS[data?.action]?.(data)?.catch?.(() => {})
  })

  // --- Signed in or not ---------------------------------------------------------------------------

  // Its own `uin` cookie says it (its player bar says it too, but a page still loading says neither).
  let said = ''
  const tellState = () => {
    const { uin } = account()
    const media = element()
    const known = { signedIn: uin !== '0', playing: Boolean(media && !media.paused) }
    const now = JSON.stringify(known)
    if (now === said) return
    said = now
    post(known)
  }

  // A page loaded anew: the host tells it the cab again.
  addEventListener('DOMContentLoaded', () => post({ ready: true }))
  post({ ready: true })

  // The first element may be made long after the page loads; the player bar changes as songs do. Its elements
  // and their text, not every character typed into it: QQ Music's page changes its own DOM constantly, and a
  // hidden page's work is the cab's (each report reads the page's tree).
  const watch = new MutationObserver(() => step())
  const begin = () => {
    const audio = document.querySelector('audio')
    if (audio) keep(audio)
    watch.observe(document.body, { subtree: true, childList: true })
    setInterval(() => {
      report()
      tellState()
    }, 1000)
  }
  if (document.body) begin()
  else addEventListener('DOMContentLoaded', begin, { once: true })
})()

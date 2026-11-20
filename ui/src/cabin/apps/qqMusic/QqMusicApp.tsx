import { useEffect, useState } from 'react'

import { TextField } from '../../keyboard/TextField'
import { useKeyboard } from '../../keyboard/store'
import { go } from '../../state/store'
import { NowPlaying } from './NowPlaying'
import { Home, Library, Page } from './pages'
import { clock } from './parts'
import {
  goBack,
  next,
  openTab,
  playOrPause,
  searchFor,
  signIn,
  startQqMusic,
  type Tab,
  useQqMusic,
  type View,
} from './qqMusic'
import './qqMusic.css'

const FIELD = 'qq-music-search'

const TABS: { tab: Tab; name: string }[] = [
  { tab: 'home', name: '首页' },
  { tab: 'search', name: '搜索' },
  { tab: 'library', name: '我的' },
]

/**
 * QQ Music, as the cab shows it: Home (what QQ Music recommends), Search, the account's Library, and the
 * pages opened over them (a playlist, an album, a singer) — the whole app on the cab alone, as Apple Music's,
 * its web player in a hidden WebView answering each page's questions and playing what's picked. Over it all
 * Now Playing; at the foot, the song playing while its pages are read.
 */
export function QqMusicApp() {
  const tab = useQqMusic((state) => state.tab)
  const views = useQqMusic((state) => state.views)
  const signedIn = useQqMusic((state) => state.signedIn)
  const playback = useQqMusic((state) => state.playback)
  const nowPlaying = useQqMusic((state) => state.nowPlaying)
  const [query, setQuery] = useState('')
  const typing = useKeyboard((state) => state.field?.id === FIELD)

  // Its page, running hidden from the moment the app opens.
  useEffect(() => startQqMusic(), [])

  const top = views.length ? views[views.length - 1] : null
  // Search's field is its page: typing there is searching.
  useEffect(() => {
    if (typing) useQqMusic.setState({ tab: 'search' })
  }, [typing])

  const back = () => {
    if (!goBack()) go({ type: 'pressHome' })
  }
  const tabBar = !top && !typing

  return (
    <section className="app-panel qm-app">
      <header className="qm-top">
        <button className="qm-back" aria-label="返回" onClick={back}>
          ‹
        </button>
        <span className="qm-top-title">{top ? viewTitle(top) : tabName(tab)}</span>
        {signedIn === false && (
          <button className="qm-sign-in" onClick={() => signIn()}>
            登录
          </button>
        )}
      </header>

      {tabBar && (
        <nav className="qm-tabs">
          {TABS.map(({ tab: each, name }) => (
            <button
              key={each}
              className={`qm-tab${tab === each ? ' qm-tab-on' : ''}`}
              onClick={() => openTab(each)}
            >
              {name}
            </button>
          ))}
        </nav>
      )}

      <main className="qm-body">
        {tab === 'search' && (
          <div className="qm-search-field">
            <TextField
              id={FIELD}
              value={query}
              onChange={setQuery}
              onSubmit={() => searchFor(query)}
              hint="搜歌、歌手、专辑"
              label="搜索"
              returnKind="search"
            />
          </div>
        )}
        {top ? (
          <Page view={top} />
        ) : tab === 'home' ? (
          <Home shown />
        ) : tab === 'library' ? (
          <Library />
        ) : (
          <SearchStart query={query} />
        )}
      </main>

      {playback?.track && !nowPlaying && (
        <button className="qm-mini" onClick={() => useQqMusic.setState({ nowPlaying: true })}>
          <span className="qm-mini-cover" style={{ background: playback.track.cover ? undefined : '#26262e' }}>
            {playback.track.cover && <img src={playback.track.cover} alt="" />}
          </span>
          <span className="qm-mini-words">
            <span className="qm-mini-title">{playback.track.title}</span>
            <span className="qm-mini-by">{playback.track.artist}</span>
          </span>
          <span className="qm-mini-time">{clock(playback.duration)}</span>
          <span
            className="qm-mini-play"
            role="button"
            aria-label={playback.playing ? '暂停' : '播放'}
            onClick={(event) => {
              event.stopPropagation()
              playOrPause()
            }}
          >
            {playback.playing ? '❚❚' : '▶'}
          </span>
          <span
            className="qm-mini-next"
            role="button"
            aria-label="下一首"
            onClick={(event) => {
              event.stopPropagation()
              next()
            }}
          >
            ⏭
          </span>
        </button>
      )}

      {nowPlaying && <NowPlaying />}
    </section>
  )
}

/** Search's page before a search: what it's for. */
function SearchStart({ query }: { query: string }) {
  return (
    <div className="qm-none qm-search-start">
      <p>搜一首歌、一个歌手，或者一张专辑。</p>
      {query.trim() && (
        <button className="qm-retry" onClick={() => searchFor(query)}>
          搜索「{query.trim()}」
        </button>
      )}
    </div>
  )
}

function tabName(tab: Tab): string {
  return TABS.find((each) => each.tab === tab)?.name ?? 'QQ 音乐'
}

function viewTitle(view: View): string {
  switch (view.type) {
    case 'collection':
    case 'artist':
      return view.item.title
    case 'results':
      return `“${view.query}”`
  }
}

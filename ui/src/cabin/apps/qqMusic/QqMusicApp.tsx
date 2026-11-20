import { useEffect, useState } from 'react'

import { TextField } from '../../keyboard/TextField'
import { useKeyboard } from '../../keyboard/store'
import { go } from '../../state/store'
import { NowPlaying } from './NowPlaying'
import { Home, Library, Page } from './pages'
import { clock } from './parts'
import {
  goBack,
  keepQqMusic,
  next,
  openTab,
  playOrPause,
  putQqMusicAwayWhenIdle,
  searchFor,
  signIn,
  startQqMusic,
  type Tab,
  useQqMusic,
  type View,
} from './qqMusic'
import { useQqMusicWords } from './words'
import './qqMusic.css'

const FIELD = 'qq-music-search'

const TABS: Tab[] = ['home', 'search', 'library']

/**
 * QQ Music, as the cab shows it: Home (what QQ Music recommends), Search, the account's Library, and the
 * pages opened over them (a playlist, an album, a singer) — the whole app on the cab alone, as Apple Music's,
 * its web player in a hidden WebView answering each page's questions and playing what's picked. Over it all
 * Now Playing; at the foot, the song playing while its pages are read.
 */
export function QqMusicApp() {
  const words = useQqMusicWords()
  const tab = useQqMusic((state) => state.tab)
  const views = useQqMusic((state) => state.views)
  const signedIn = useQqMusic((state) => state.signedIn)
  const playback = useQqMusic((state) => state.playback)
  const nowPlaying = useQqMusic((state) => state.nowPlaying)
  const [query, setQuery] = useState('')
  const typing = useKeyboard((state) => state.field?.id === FIELD)

  // Its page, running hidden from the moment the app opens; put away once the app has been closed a while
  // with nothing playing (QQ Music's own page is heavy, and a browser made again is slow).
  useEffect(() => {
    keepQqMusic()
    startQqMusic()
    return putQqMusicAwayWhenIdle
  }, [])

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
        <button className="qm-back" aria-label={words.back} onClick={back}>
          ‹
        </button>
        <span className="qm-top-title">{top ? viewTitle(top) : tabName(tab, words)}</span>
        {signedIn === false && (
          <button className="qm-sign-in" onClick={() => signIn()}>
            {words.signIn}
          </button>
        )}
      </header>

      {tabBar && (
        <nav className="qm-tabs">
          {TABS.map((each) => (
            <button
              key={each}
              className={`qm-tab${tab === each ? ' qm-tab-on' : ''}`}
              onClick={() => openTab(each)}
            >
              {tabName(each, words)}
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
              hint={words.searchHint}
              label={words.searchLabel}
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

      {playback?.said && (
        <div className="qm-said" role="status">
          {playback.said === 'subscription' ? words.needsVip : words.cannotPlay}
        </div>
      )}

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
            aria-label={playback.playing ? words.pause : words.play}
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
            aria-label={words.next}
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
  const words = useQqMusicWords()
  return (
    <div className="qm-none qm-search-start">
      <p>{words.searchStart}</p>
      {query.trim() && (
        <button className="qm-retry" onClick={() => searchFor(query)}>
          {words.searchFor(query.trim())}
        </button>
      )}
    </div>
  )
}

function tabName(tab: Tab, words: ReturnType<typeof useQqMusicWords>): string {
  switch (tab) {
    case 'home':
      return words.home
    case 'search':
      return words.search
    case 'library':
      return words.library
  }
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

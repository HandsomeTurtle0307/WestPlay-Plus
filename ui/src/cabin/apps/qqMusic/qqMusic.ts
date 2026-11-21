import { useEffect, useState } from 'react'
import { create } from 'zustand'

import {
  isInHost,
  postToHost,
  type QqMusicAnswer,
  type QqMusicArtistPage,
  type QqMusicCollection,
  type QqMusicCommand,
  type QqMusicItem,
  type QqMusicLine,
  type QqMusicPlayback,
  type QqMusicQuestion,
  type QqMusicRepeat,
  type QqMusicResults,
  type QqMusicSections,
  type QqMusicTrack,
} from '../../../shared/host'
import { createAsking } from '../asking'
import { positionOf } from '../music/time'
import { previewAnswer } from './preview'

/**
 * QQ Music: its own web player, in a hidden WebView (`crates/host/src/qq_music.rs`), plays and answers the
 * app's questions (Home, a search, a playlist, an album, a singer, the Library, a song's words) from its own
 * page — its own API, in the page's session — so the app works on the cab alone, as Apple Music's does. A
 * song picked plays in an element the page keeps for this app (`qq_music.js`), given the address QQ Music's
 * own player would have used, so it starts at once.
 *
 * Signing in is QQ Music's own page, in a window on the PC. Nothing of the account is kept: answers are only
 * shown, and asked again when needed.
 */

/** A song of a list, as QQ Music sent it. */
export type Track = QqMusicTrack
export type Item = QqMusicItem

/** What plays, and where in it: `position` at `at` (`performance.now()`), so the time goes on between reports. */
export interface Playback {
  track: Track | null
  playing: boolean
  /** Asked to play, its sound not yet there: the time is held. */
  loading: boolean
  position: number
  at: number
  duration: number
  /** The playing element's volume, 0 to 100 (`null`: not said). */
  volume: number | null
  /** The app's own queue: shuffled, and how it repeats; how many songs it holds, and where it is. */
  shuffle: boolean
  repeat: QqMusicRepeat
  queue: number
  index: number
  /** Why the song asked for can't play (`subscription`, `unplayable`), told by its page: said, not hidden. */
  said: string | null
}

/** A page of the app's own, opened over its tab. */
export type View =
  /** A playlist's or album's page. */
  | { type: 'collection'; item: Item }
  /** A singer's page. */
  | { type: 'artist'; item: Item }
  /** A search's results, as asked. */
  | { type: 'results'; query: string }

export type Tab = 'home' | 'search' | 'library'

interface QqMusicState {
  /** Whether QQ Music is signed in (`null`: not said yet, or not running). */
  signedIn: boolean | null
  playback: Playback | null
  /** Its sign-in window is open on the PC. */
  signingIn: boolean
  tab: Tab
  /** The pages opened over the tab (Back goes through them). */
  views: View[]
  /** Now Playing over all of it. */
  nowPlaying: boolean
  /** What QQ Music said when it couldn't answer the last question (a subscription it needs, say). */
  said: string | null
}

export const useQqMusic = create<QqMusicState>()(() => ({
  signedIn: isInHost() ? null : false,
  playback: null,
  signingIn: false,
  tab: 'home',
  views: [],
  nowPlaying: false,
  said: null,
}))

/** A command for QQ Music's web player. */
export function qqMusic(command: QqMusicCommand): void {
  postToHost({ type: 'qqMusic', command })
}

/** QQ Music's own page, started (hidden): the app opened. */
export function startQqMusic(): void {
  qqMusic({ action: 'start' })
}

/** How long the app may stay closed with nothing playing before its page is put away: QQ Music's own page is
 * heavy (carousels, video, a stream of recommendations), and it runs whether the app is open or not. */
const PUT_AWAY_MS = 5 * 60_000

let putAway: ReturnType<typeof setTimeout> | null = null

/** The app opened: its page kept as it is. */
export function keepQqMusic(): void {
  if (putAway) clearTimeout(putAway)
  putAway = null
}

/** The app closed: its page put away once a while has passed with nothing playing. The browser stays (making
 * one again takes seconds, which the cab doesn't have); its next `start` loads the page again. Nothing playing
 * is the condition: music left playing in the background is left alone. */
export function putQqMusicAwayWhenIdle(): void {
  keepQqMusic()
  putAway = setTimeout(() => {
    putAway = null
    if (!playingNow()) qqMusic({ action: 'stop' })
  }, PUT_AWAY_MS)
}

/** Whether it's signed in, as the host last said (`null`: not running). */
export function receiveState(signedIn: boolean | null): void {
  const before = useQqMusic.getState().signedIn
  useQqMusic.setState({ signedIn })
  // Signed in or out: nothing's kept of what the account had (its answers asked again, for the other).
  if (before !== signedIn && before !== null) {
    asking.clear()
    useQqMusic.setState({ views: [], tab: 'home' })
  }
}

/** What it plays, as its page last said (the host reads it: `qq_music.js`). */
export function receivePlayback(playback: QqMusicPlayback | null): void {
  if (!playback) {
    useQqMusic.setState({ playback: null })
    return
  }
  const now = performance.now()
  const duration = playback.duration > 0 ? playback.duration : (playback.track?.duration ?? 0)
  useQqMusic.setState({
    playback: {
      track: playback.track,
      playing: playback.playing,
      loading: Boolean(playback.loading),
      position: playback.position,
      at: now,
      duration,
      volume: playback.volume,
      shuffle: Boolean(playback.shuffle),
      repeat: playback.repeat ?? 'off',
      queue: playback.queue,
      index: playback.index,
      said: playback.said ?? null,
    },
  })
}

// --- Its questions ----------------------------------------------------------------------------------------

/** What each question is answered with (`westplay_host::qq_music::Answer`, by the field it answers in). */
interface Answers {
  search: QqMusicResults
  playlist: QqMusicCollection
  album: QqMusicCollection
  artist: QqMusicArtistPage
  chart: QqMusicCollection
  home: QqMusicSections
  library: QqMusicSections
  lyrics: QqMusicLine[]
}

const asking = createAsking<QqMusicQuestion, Answers>(
  (id, question) => qqMusic({ action: 'ask', id, question }),
  previewAnswer,
  isInHost,
)

/** A question's answer: as known this session, or (`fresh`, or not known) asked of QQ Music. */
export const ask = asking.ask
/** A question's answer once it comes (`null` until then), whether QQ Music failed to answer, and asking again;
 * a page whose answer changes as QQ Music is used (Home, the Library) gives a `refresh`. */
export const useAsked = asking.useAsked

/** QQ Music's answer (`qqMusicAnswer`), for the question asked with its id: a playlist's and an album's pages
 * are the same answer (`collection`), so both names are given it. */
export function receiveAnswer(answer: QqMusicAnswer): void {
  useQqMusic.setState({ said: answer.said ?? null })
  asking.receive({
    id: answer.id,
    failed: Boolean(answer.said),
    search: answer.search,
    playlist: answer.collection,
    album: answer.collection,
    // A chart's page is a playlist's shape too: both names are given it.
    chart: answer.chart,
    artist: answer.artist,
    home: answer.home,
    library: answer.library,
    lyrics: answer.lyrics,
  })
}

// --- What it plays ----------------------------------------------------------------------------------------

/** Play a list of songs (a page's, a search's), from the one at `at`: its own player, at once. */
export function playSongs(tracks: Track[], at = 0): void {
  if (!tracks.length) return
  const index = Math.max(0, Math.min(at, tracks.length - 1))
  const track = tracks[index]
  const before = useQqMusic.getState().playback
  // Shown at once, as the page is asked: a press plays, not a wait for the page to say so.
  useQqMusic.setState({
    nowPlaying: true,
    playback: {
      track,
      playing: true,
      loading: true,
      position: 0,
      at: performance.now(),
      duration: track.duration,
      volume: before?.volume ?? null,
      shuffle: before?.shuffle ?? false,
      repeat: before?.repeat ?? 'off',
      queue: tracks.length,
      index,
      said: null,
    },
  })
  qqMusic({ action: 'play', songs: tracks, at: index })
}

/** A song on its own (a search's row): its page's songs, from it. */
export function playFrom(tracks: Track[], song: Track): void {
  playSongs(tracks, Math.max(0, tracks.findIndex((each) => each.id === song.id)))
}

export function pause(): void {
  qqMusic({ action: 'pause' })
}

export function resume(): void {
  qqMusic({ action: 'play' })
}

export function playOrPause(): void {
  if (useQqMusic.getState().playback?.playing) pause()
  else resume()
}

export function next(): void {
  qqMusic({ action: 'next' })
}

export function previous(): void {
  qqMusic({ action: 'previous' })
}

export function seek(seconds: number): void {
  const { playback } = useQqMusic.getState()
  if (playback) {
    useQqMusic.setState({ playback: { ...playback, position: Math.max(0, seconds), at: performance.now() } })
  }
  qqMusic({ action: 'seek', seconds: Math.max(0, seconds) })
}

/** The playing element's volume, 0 to 1 (`make`: the player's choice, kept for the keybinds and the fades). */
export function setVolume(share: number, make = false): void {
  const percent = Math.round(Math.max(0, Math.min(1, share)) * 100)
  if (make) {
    useQqMusic.setState((state) => (state.playback ? { playback: { ...state.playback, volume: percent } } : {}))
  }
  qqMusic({ action: 'volume', percent })
}

export function setShuffle(on: boolean): void {
  useQqMusic.setState((state) => (state.playback ? { playback: { ...state.playback, shuffle: on } } : {}))
  qqMusic({ action: 'shuffle', on })
}

export function setRepeat(mode: QqMusicRepeat): void {
  useQqMusic.setState((state) => (state.playback ? { playback: { ...state.playback, repeat: mode } } : {}))
  qqMusic({ action: 'repeat', mode })
}

export function signIn(): void {
  useQqMusic.setState({ signingIn: true })
  if (isInHost()) {
    qqMusic({ action: 'signIn' })
    return
  }
  useQqMusic.setState({ signedIn: true, signingIn: false })
}

export function signOut(): void {
  if (isInHost()) qqMusic({ action: 'signOut' })
  useQqMusic.setState({ signedIn: false, views: [], tab: 'home' })
}

// --- The app's own pages ----------------------------------------------------------------------------------

/** A tab: its pages put away (Back, then the tab again, comes home). */
export function openTab(tab: Tab): void {
  useQqMusic.setState({ tab, views: [], nowPlaying: false })
}

/** A page opened over the tab's. */
export function openView(view: View): void {
  useQqMusic.setState((state) => ({ views: [...state.views, view], nowPlaying: false }))
}

/** Back: a page put away, or the tab's own shown again. `false`: nothing left to put away. */
export function goBack(): boolean {
  const { views } = useQqMusic.getState()
  if (views.length) {
    useQqMusic.setState({ views: views.slice(0, -1) })
    return true
  }
  return false
}

/** Search: its results as asked. */
export function searchFor(query: string): void {
  const wanted = query.trim()
  if (!wanted) return
  useQqMusic.setState({ tab: 'search', views: [{ type: 'results', query: wanted }] })
}

// --- For the shell (`musicWithGame.ts`, `oneAtATime.ts`, `keybinds.ts`) --------------------------------

/** Whether it plays here now (the sound really there: not a song asked for and still loading). */
export function playingNow(): boolean {
  const { playback } = useQqMusic.getState()
  return Boolean(playback?.playing && !playback.loading)
}

export function pauseHere(): void {
  pause()
}

export function resumeHere(): void {
  resume()
}

/** Its own Back: past a song's first seconds, the song starts again (as its own player bar does). */
export function skip(direction: 1 | -1): void {
  if (direction === 1) {
    next()
    return
  }
  const { playback } = useQqMusic.getState()
  if (playback && positionOf({ ...playback, playing: false, loading: false }) > 3) seek(0)
  else previous()
}

/** A tick every 250 ms while `running`, for the time to go by between the page's reports. */
export function useNow(running: boolean): number {
  const [, setTick] = useState(0)
  useEffect(() => {
    if (!running) return
    const timer = setInterval(() => setTick((tick) => tick + 1), 250)
    return () => clearInterval(timer)
  }, [running])
  return performance.now()
}

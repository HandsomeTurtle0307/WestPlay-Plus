import { useEffect, useRef, useState } from 'react'

import type { QqMusicCollection, QqMusicTrack } from '../../../shared/host'
import { PageHead, Shelf, SongShelf, TrackRow, Waiting } from './parts'
import { ask, type Item, playSongs, useAsked, useQqMusic, type View } from './qqMusic'

/**
 * QQ Music's pages: Home (what it recommends), a search's results, a playlist's or album's page, a singer's,
 * and the account's own library. Each asks QQ Music for what it shows, and holds no more of it than that.
 */

/** Home: what QQ Music recommends, and its charts. */
export function Home({ shown }: { shown: boolean }) {
  // Shown again: asked again (its picks change as the account's do).
  const [times, setTimes] = useState(0)
  useEffect(() => {
    if (shown) setTimes((n) => n + 1)
  }, [shown])
  const { answer, failed, retry } = useAsked({ ask: 'home' }, times)
  const signedIn = useQqMusic((state) => state.signedIn)
  if (!answer) return <Waiting failed={failed} retry={retry} />
  return (
    <div className="qm-page">
      {signedIn === false && <SignInNote />}
      {answer.shelves.map((shelf) => (
        <Shelf key={shelf.title} title={shelf.title} items={shelf.items} />
      ))}
      {!answer.shelves.length && <p className="qm-none">QQ 音乐没有送推荐内容。</p>}
    </div>
  )
}

/** Search: what was asked, as songs first, then the playlists, albums and singers that match. */
export function Results({ query }: { query: string }) {
  const { answer, failed, retry } = useAsked({ ask: 'search', query })
  if (!answer) return <Waiting failed={failed} retry={retry} />
  const nothing = !answer.songs.length && !answer.playlists.length && !answer.albums.length && !answer.artists.length
  if (nothing) return <p className="qm-none">没找到「{query}」。</p>
  return (
    <div className="qm-page">
      <SongShelf title="单曲" tracks={answer.songs} />
      <Shelf title="歌单" items={answer.playlists} />
      <Shelf title="专辑" items={answer.albums} />
      <Shelf title="歌手" items={answer.artists} />
    </div>
  )
}

/** A playlist's or album's page: its cover, then its songs (a playlist's, more of them as asked). */
export function Collection({ item }: { item: Item }) {
  const album = item.kind === 'album'
  const first = useAsked(album ? { ask: 'album', id: item.id } : { ask: 'playlist', id: item.id })
  // A playlist's songs come a hundred at a time: each page asked after, and added as it comes.
  const [more, setMore] = useState<QqMusicCollection | null>(null)
  const [page, setPage] = useState(0)
  const [loading, setLoading] = useState(false)
  // The first page's songs, as the ones the pages after it add to (the state's own are the last's).
  const base = useRef<QqMusicTrack[]>([])
  useEffect(() => {
    base.current = first.answer?.tracks ?? []
    // The first answer stands for the page's own songs; asking again is the page's `page` alone.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [first.answer])
  useEffect(() => {
    if (page === 0) {
      setMore(null)
      return
    }
    let current = true
    setLoading(true)
    ask({ ask: 'playlist', id: item.id, page })
      .then((next) => {
        if (!current) return
        setMore((before) => {
          const known = before?.tracks ?? base.current
          const added = next.tracks.filter((track) => !known.some((each) => each.id === track.id))
          return { ...next, tracks: [...known, ...added] }
        })
      })
      .catch(() => {})
      .finally(() => {
        if (current) setLoading(false)
      })
    return () => {
      current = false
    }
  }, [item.id, page])
  if (!first.answer) return <Waiting failed={first.failed} retry={first.retry} />
  const collection = more ?? first.answer
  const hasMore = first.answer.more || Boolean(more?.more)
  const note = [collection.year ? String(collection.year) : '', `${collection.tracks.length} 首`].filter(Boolean).join(' · ')
  return (
    <div className="qm-page">
      <PageHead item={collection.item} note={note} />
      {collection.description && <p className="qm-description">{collection.description}</p>}
      {collection.tracks.length > 0 && (
        <button className="qm-play-all" onClick={() => playSongs(collection.tracks, 0)}>
          ▶ 播放全部
        </button>
      )}
      <div className="qm-songs">
        {collection.tracks.map((track, at) => (
          <TrackRow key={`${track.id}:${at}`} track={track} tracks={collection.tracks} at={at} />
        ))}
      </div>
      {hasMore && !album && (
        <button className="qm-more" onClick={() => setPage((n) => n + 1)} disabled={loading}>
          {loading ? '加载中…' : '加载更多'}
        </button>
      )}
      {!collection.tracks.length && <p className="qm-none">这个歌单里没有歌。</p>}
    </div>
  )
}

/** A singer's page: their songs. */
export function Artist({ item }: { item: Item }) {
  const { answer, failed, retry } = useAsked({ ask: 'artist', id: item.id })
  if (!answer) return <Waiting failed={failed} retry={retry} />
  return (
    <div className="qm-page">
      <PageHead item={{ ...answer.item, kind: 'artist' }} note={`${answer.top.length} 首热门`} />
      <SongShelf title="热门单曲" tracks={answer.top} />
    </div>
  )
}

/** The account's own library: its playlists. */
export function Library() {
  const signedIn = useQqMusic((state) => state.signedIn)
  const [times, setTimes] = useState(0)
  const { answer, failed, retry } = useAsked(signedIn === false ? null : { ask: 'library' }, times)
  if (signedIn === false) return <SignInNote />
  if (!answer) return <Waiting failed={failed} retry={retry} />
  return (
    <div className="qm-page">
      <button className="qm-refresh" onClick={() => setTimes((n) => n + 1)}>
        刷新
      </button>
      {answer.shelves.map((shelf) => (
        <Shelf key={shelf.title} title={shelf.title} items={shelf.items} />
      ))}
      {!answer.shelves.length && <p className="qm-none">这个账号还没有歌单。</p>}
    </div>
  )
}

/** A page of the app's own, by what it is. */
export function Page({ view }: { view: View }) {
  switch (view.type) {
    case 'collection':
      return <Collection key={view.item.id} item={view.item} />
    case 'artist':
      return <Artist key={view.item.id} item={view.item} />
    case 'results':
      return <Results key={view.query} query={view.query} />
  }
}

/** Signed out: what the app can't show, and how to sign in. */
function SignInNote() {
  return (
    <div className="qm-none qm-signin-note">
      <p>登录 QQ 音乐后，这里会显示你的歌单。</p>
      <p className="qm-hint">点右上角的「登录」，在电脑上弹出的窗口里扫码。</p>
    </div>
  )
}

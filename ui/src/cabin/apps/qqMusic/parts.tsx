import type { ReactNode } from 'react'

import { type Item, type Track, openView, playFrom, playSongs } from './qqMusic'
import { useQqMusicWords, type Words } from './words'

/**
 * The pieces QQ Music's pages are made of: its covers, its rows of songs, its cards and its shelves. Shared
 * by every page, so a song row (and what pressing it does) is the same wherever it's found.
 */

/** 1:05 for 65 seconds. */
export function clock(seconds: number): string {
  if (!Number.isFinite(seconds) || seconds <= 0) return '0:00'
  const whole = Math.floor(seconds)
  return `${Math.floor(whole / 60)}:${String(whole % 60).padStart(2, '0')}`
}

/** A colour from what a cover is (its id, its name), for those QQ Music sent none for: never a grey square. */
function tint(seed: string): string {
  let hash = 0
  for (const letter of seed) hash = (hash * 31 + letter.charCodeAt(0)) % 360
  return `linear-gradient(140deg, hsl(${hash} 42% 46%), hsl(${(hash + 48) % 360} 38% 28%))`
}

/** A cover: QQ Music's own image, or a tint of what it is when it sent none. */
export function Cover({ src, seed, size = 'card' }: { src?: string | null; seed: string; size?: 'card' | 'row' | 'big' }) {
  return (
    <div className={`qm-cover qm-cover-${size}`} style={{ background: tint(seed) }}>
      {src ? <img src={src} alt="" loading="lazy" /> : <span className="qm-cover-glyph">♪</span>}
    </div>
  )
}

/** A page's title over what it is (a playlist's, an album's), with its cover. */
export function PageHead({ item, note }: { item: Item; note?: string }) {
  const words = useQqMusicWords()
  return (
    <header className="qm-head">
      <Cover src={item.image} seed={item.id || item.title} size="big" />
      <div className="qm-head-words">
        <div className="qm-head-kind">{kindName(item.kind, words)}</div>
        <h1 className="qm-head-title">{item.title}</h1>
        {item.subtitle && <div className="qm-head-by">{item.subtitle}</div>}
        {note && <div className="qm-head-note">{note}</div>}
      </div>
    </header>
  )
}

function kindName(kind: string, words: Words): string {
  switch (kind) {
    case 'album':
      return words.album
    case 'artist':
      return words.artist
    case 'chart':
      return words.chart
    default:
      return words.playlist
  }
}

/** A playlist, album or singer, as a card in a shelf: pressed, its page. */
export function Card({ item }: { item: Item }) {
  return (
    <button className="qm-card" onClick={() => openView({ type: item.kind === 'artist' ? 'artist' : 'collection', item })}>
      <Cover src={item.image} seed={item.id || item.title} />
      <div className="qm-card-title">{item.title}</div>
      {item.subtitle && <div className="qm-card-by">{item.subtitle}</div>}
    </button>
  )
}

/** A row of cards under what it is, or a row of songs (a chart's), played from it. */
export function Shelf({
  title,
  items,
  tracks,
  children,
}: {
  title: string
  items?: Item[]
  tracks?: Track[]
  children?: ReactNode
}) {
  const all = items ?? []
  const songs = tracks ?? []
  if (!all.length && !songs.length && !children) return null
  return (
    <section className="qm-shelf">
      <h2 className="qm-shelf-title">{title}</h2>
      {songs.length ? (
        <div className="qm-songs">
          {songs.map((track, at) => (
            <TrackRow key={`${track.id}:${at}`} track={track} tracks={songs} at={at} />
          ))}
        </div>
      ) : (
        <div className="qm-shelf-row">{children ?? all.map((item) => <Card key={`${item.kind}:${item.id}`} item={item} />)}</div>
      )}
    </section>
  )
}

/** A song in a list: pressed, it plays (from where it is in the list). */
export function TrackRow({ track, tracks, at }: { track: Track; tracks: Track[]; at: number }) {
  return (
    <button className="qm-song" onClick={() => playFrom(tracks, track)}>
      <span className="qm-song-at">{at + 1}</span>
      <span className="qm-song-words">
        <span className="qm-song-title">
          {track.title}
          {track.vip && <span className="qm-song-vip">VIP</span>}
        </span>
        <span className="qm-song-by">
          {track.artist}
          {track.album ? ` · ${track.album}` : ''}
        </span>
      </span>
      <span className="qm-song-time">{clock(track.duration)}</span>
    </button>
  )
}

/** A list of songs, played from its top. */
export function TrackList({ tracks }: { tracks: Track[] }) {
  const words = useQqMusicWords()
  if (!tracks.length) return <p className="qm-none">{words.nothingHere}</p>
  return (
    <div className="qm-songs">
      <button className="qm-play-all" onClick={() => playSongs(tracks, 0)}>
        {words.playAll} · {words.songs(tracks.length)}
      </button>
      {tracks.map((track, at) => (
        <TrackRow key={`${track.id}:${at}`} track={track} tracks={tracks} at={at} />
      ))}
    </div>
  )
}

/** A shelf of songs (a search's), as rows. */
export function SongShelf({ title, tracks }: { title: string; tracks: Track[] }) {
  if (!tracks.length) return null
  return (
    <section className="qm-shelf">
      <h2 className="qm-shelf-title">{title}</h2>
      <div className="qm-songs">
        {tracks.map((track, at) => (
          <TrackRow key={`${track.id}:${at}`} track={track} tracks={tracks} at={at} />
        ))}
      </div>
    </section>
  )
}

/** A page still coming, or one that couldn't. */
export function Waiting({ failed, retry }: { failed?: boolean; retry?: () => void }) {
  const words = useQqMusicWords()
  if (failed) {
    return (
      <div className="qm-none">
        <p>{words.didNotLoad}</p>
        {retry && (
          <button className="qm-retry" onClick={retry}>
            {words.retry}
          </button>
        )}
      </div>
    )
  }
  return <p className="qm-none">{words.loading}</p>
}

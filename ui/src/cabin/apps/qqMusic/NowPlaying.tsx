import { positionOf } from '../music/time'
import { Cover, clock } from './parts'
import {
  next,
  playOrPause,
  previous,
  resume,
  seek,
  setRepeat,
  setShuffle,
  useNow,
  useQqMusic,
} from './qqMusic'

/**
 * Now Playing, over the app's pages: the song as large as the cab has room for, its time, and its controls
 * (shuffle, back, play, next, repeat). Pressed anywhere on the song, its page. Put away, what was under it.
 */
export function NowPlaying() {
  const playback = useQqMusic((state) => state.playback)
  const now = useNow(Boolean(playback?.playing && !playback.loading))
  const close = () => useQqMusic.setState({ nowPlaying: false })
  if (!playback?.track) {
    return (
      <section className="qm-now-playing">
        <header className="qm-now-bar">
          <button className="qm-now-down" aria-label="收起" onClick={close}>
            ⌄
          </button>
          <span className="qm-now-heading">正在播放</span>
        </header>
        <div className="qm-none qm-now-empty">
          <p>还没在放歌。</p>
          <p className="qm-hint">去首页挑一首，或者搜一下。</p>
        </div>
      </section>
    )
  }
  const track = playback.track
  const position = positionOf(playback, now)
  const share = playback.duration > 0 ? Math.min(1, position / playback.duration) : 0
  const repeat = playback.repeat
  return (
    <section className="qm-now-playing">
      <header className="qm-now-bar">
        <button className="qm-now-down" aria-label="收起" onClick={close}>
          ⌄
        </button>
        <span className="qm-now-heading">正在播放</span>
      </header>

      <div className="qm-now-body">
        <Cover src={track.cover} seed={track.id || track.title} size="big" />
        <div className="qm-words">
          <div className="qm-title">{track.title}</div>
          <div className="qm-artist">
            {track.artist}
            {track.album ? ` — ${track.album}` : ''}
          </div>
        </div>

        <div
          className="qm-progress"
          role="slider"
          aria-label="播放进度"
          aria-valuemin={0}
          aria-valuemax={Math.round(playback.duration)}
          aria-valuenow={Math.round(position)}
          onClick={(event) => {
            const box = event.currentTarget.getBoundingClientRect()
            seek(((event.clientX - box.left) / box.width) * playback.duration)
          }}
        >
          <div className="qm-progress-fill" style={{ width: `${share * 100}%` }} />
        </div>
        <div className="qm-times">
          <span>{clock(position)}</span>
          <span>{playback.duration > 0 ? clock(playback.duration) : '--:--'}</span>
        </div>

        <div className="qm-controls">
          <button
            className={`qm-button qm-button-small${playback.shuffle ? ' qm-on' : ''}`}
            aria-label="随机播放"
            aria-pressed={playback.shuffle}
            onClick={() => setShuffle(!playback.shuffle)}
          >
            ⤨
          </button>
          <button className="qm-button" aria-label="上一首" onClick={() => previous()}>
            ⏮
          </button>
          <button
            className="qm-button qm-button-main"
            aria-label={playback.playing ? '暂停' : '播放'}
            onClick={() => playOrPause()}
          >
            {playback.playing ? '❚❚' : '▶'}
          </button>
          <button className="qm-button" aria-label="下一首" onClick={() => next()}>
            ⏭
          </button>
          <button
            className={`qm-button qm-button-small${repeat !== 'off' ? ' qm-on' : ''}`}
            aria-label={repeat === 'one' ? '单曲循环' : repeat === 'all' ? '列表循环' : '顺序播放'}
            onClick={() => setRepeat(repeat === 'off' ? 'all' : repeat === 'all' ? 'one' : 'off')}
          >
            {repeat === 'one' ? '🔂' : '🔁'}
          </button>
        </div>
        {playback.queue > 1 && (
          <div className="qm-queue-note">
            {playback.index + 1} / {playback.queue}
            {playback.shuffle ? ' · 随机' : ''}
          </div>
        )}
        {!playback.playing && (
          <button className="qm-resume" onClick={() => resume()}>
            继续播放
          </button>
        )}
      </div>
    </section>
  )
}

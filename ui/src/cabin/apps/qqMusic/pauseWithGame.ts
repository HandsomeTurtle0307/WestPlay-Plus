import { type MusicPlayer, pauseMusicWithGame } from '../musicWithGame'
import { pause, playingNow, resume, setVolume, skip, useQqMusic } from './qqMusic'

/**
 * QQ Music with the game (`musicWithGame.ts`): the same rule as the other players'. It plays only here (its
 * own page, in the hidden WebView): nothing of it plays elsewhere.
 */
export const qqMusicPlayer: MusicPlayer = {
  name: 'qq music',
  playingHere: playingNow,
  pauseHere: pause,
  resumeHere: resume,
  volume: () => {
    const volume = useQqMusic.getState().playback?.volume
    return volume == null ? null : volume / 100
  },
  sendVolume: (share) => setVolume(share),
  setVolume: (share) => setVolume(share, true),
  skip,
  subscribe: (changed) => {
    const sounding = (playback: ReturnType<typeof useQqMusic.getState>['playback']) => Boolean(playback?.playing && !playback.loading)
    return useQqMusic.subscribe((music, before) => changed(sounding(music.playback) && !sounding(before.playback)))
  },
}

/** Pauses QQ Music with the game, and stops it as the truck's electrics go off, from now on. Returns the
 * function that stops it. */
export function pauseQqMusicWithGame(): () => void {
  return pauseMusicWithGame(qqMusicPlayer)
}

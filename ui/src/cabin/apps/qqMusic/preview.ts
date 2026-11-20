import type { QqMusicAnswer, QqMusicItem, QqMusicQuestion, QqMusicTrack } from '../../../shared/host'

/**
 * QQ Music, in a browser (`npm run dev`, no host): answers made up here, so the app's pages can be worked on
 * without QQ Music's page. Only the look is its own: the songs are nobody's.
 */

const song = (id: string, title: string, artist: string, album: string, duration: number, vip = false): QqMusicTrack => ({
  id,
  title,
  artist,
  album,
  cover: null,
  duration,
  vip,
})

const SONGS: QqMusicTrack[] = [
  song('001', '晴天', '周杰伦', '叶惠美', 269),
  song('002', '七里香', '周杰伦', '七里香', 299),
  song('003', '起风了', '买辣椒也用券', '起风了', 325),
  song('004', '夜空中最亮的星', '逃跑计划', '世界', 252),
  song('005', '海阔天空', 'Beyond', '乐与怒', 326),
  song('006', '平凡之路', '朴树', '猎户星座', 302),
  song('007', '突然好想你', '五月天', '后青春期的诗', 353),
  song('008', '小幸运', '田馥甄', '我的少女时代', 265),
  song('009', '成都', '赵雷', '无法长大', 328),
  song('010', '演员', '薛之谦', '绅士', 261, true),
]

const PLAYLISTS: QqMusicItem[] = [
  { id: 'p1', title: '华语流行精选', subtitle: '42 首', image: null, kind: 'playlist' },
  { id: 'p2', title: '深夜驾驶', subtitle: '68 首', image: null, kind: 'playlist' },
  { id: 'p3', title: '路上听的摇滚', subtitle: '35 首', image: null, kind: 'playlist' },
  { id: 'p4', title: '粤语经典', subtitle: '90 首', image: null, kind: 'playlist' },
]

const ALBUMS: QqMusicItem[] = [
  { id: 'a1', title: '叶惠美', subtitle: '周杰伦', image: null, kind: 'album' },
  { id: 'a2', title: '猎户星座', subtitle: '朴树', image: null, kind: 'album' },
]

const ARTISTS: QqMusicItem[] = [
  { id: 's1', title: '周杰伦', subtitle: '', image: null, kind: 'artist' },
  { id: 's2', title: '五月天', subtitle: '', image: null, kind: 'artist' },
]

const answer = (question: QqMusicQuestion): QqMusicAnswer => {
  switch (question.ask) {
    case 'home':
      return {
        id: 0,
        home: {
          shelves: [
            { title: '推荐歌单', items: PLAYLISTS },
            {
              title: '排行榜',
              items: [
                { id: 'c1', title: '飙升榜', subtitle: '', image: null, kind: 'chart' },
                { id: 'c2', title: '热歌榜', subtitle: '', image: null, kind: 'chart' },
                { id: 'c3', title: '新歌榜', subtitle: '', image: null, kind: 'chart' },
              ],
            },
          ],
        },
      }
    case 'search': {
      const wanted = question.query.trim()
      const found = SONGS.filter((each) => each.title.includes(wanted) || each.artist.includes(wanted))
      return {
        id: 0,
        search: {
          songs: found.length ? found : SONGS.slice(0, 6),
          playlists: PLAYLISTS.slice(0, 2),
          albums: ALBUMS,
          artists: ARTISTS,
          more: false,
        },
      }
    }
    case 'playlist':
    case 'album':
      return {
        id: 0,
        collection: {
          item: PLAYLISTS[0],
          description: '为开车挑的华语流行。',
          year: question.ask === 'album' ? 2003 : null,
          tracks: SONGS,
          more: false,
        },
      }
    case 'artist':
      return { id: 0, artist: { item: ARTISTS[0], top: SONGS.slice(0, 6) } }
    case 'library':
      return { id: 0, library: { signedIn: true, shelves: [{ title: '我的歌单', items: PLAYLISTS }] } }
    case 'lyrics':
      return {
        id: 0,
        lyrics: [
          { at: 0, text: '（预览里的歌词）' },
          { at: 12, text: '故事的小黄花' },
          { at: 18, text: '从出生那年就飘着' },
        ],
      }
  }
}

/** The preview's answer, a moment later (as if asked of QQ Music). */
export function previewAnswer<Q extends QqMusicQuestion>(question: Q): Promise<QqMusicAnswer> {
  return new Promise((resolve) => {
    setTimeout(() => resolve(answer(question)), 300)
  })
}

/** The preview's songs, for a page's list. */
export function previewSongs(): QqMusicTrack[] {
  return SONGS
}

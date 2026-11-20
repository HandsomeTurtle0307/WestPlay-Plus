import { useLanguage } from '../../state/text'

/**
 * QQ Music's own app, in the cab's language: the words WestPlay adds around it — its tabs, its player, its
 * empty states. QQ Music's own content (songs, singers, playlists it recommends) comes from y.qq.com in
 * Chinese and is shown as it comes; these are WestPlay's words, so they follow the cab's language.
 *
 * English is the base every language falls back to (as the cabin's own `Strings` fall back to `en_us`), and
 * the languages below it give their own where they have them. Kept apart from `cabin/state/strings` because
 * they're this one app's: an app added or changed doesn't touch forty-three language files.
 */
export interface Words {
  /** The way back (out of a page, out of the app). */
  back: string
  home: string
  search: string
  library: string
  signIn: string
  searchHint: string
  searchLabel: string
  searchStart: string
  /** A search from the app's own field: `Search “晴天”`. */
  searchFor(query: string): string
  play: string
  pause: string
  next: string
  previous: string
  shuffle: string
  /** Said beside the queue's count: `3 / 12 · Shuffled`. */
  shuffled: string
  repeatOff: string
  repeatAll: string
  repeatOne: string
  collapse: string
  nowPlaying: string
  nothingPlaying: string
  pickSomething: string
  position: string
  resume: string
  /** How many songs a list holds: `12 songs`. */
  songs(count: number): string
  playAll: string
  /** A singer's page: `12 popular songs`. */
  hotSongs(count: number): string
  loadMore: string
  loading: string
  retry: string
  didNotLoad: string
  refresh: string
  /** A search's own rows. */
  songsRow: string
  /** A singer's page's row: their best-known songs. */
  popularSongs: string
  playlists: string
  albums: string
  artists: string
  /** What a page or a card is. */
  playlist: string
  album: string
  artist: string
  chart: string
  noRecommendations: string
  nothingFound(query: string): string
  emptyPlaylist: string
  nothingHere: string
  emptyLibrary: string
  signInNote: string
  signInWhere: string
  /** Why a song it was asked to play won't: its address came back without a file. */
  needsVip: string
  cannotPlay: string
}

const ENGLISH: Words = {
  back: 'Back',
  home: 'Home',
  search: 'Search',
  library: 'Your Library',
  signIn: 'Sign In',
  searchHint: 'Songs, singers, albums',
  searchLabel: 'Search',
  searchStart: 'Search for a song, an artist, or an album.',
  searchFor: (query) => `Search “${query}”`,
  play: 'Play',
  pause: 'Pause',
  next: 'Next',
  previous: 'Previous',
  shuffle: 'Shuffle',
  shuffled: 'Shuffled',
  repeatOff: 'Play in order',
  repeatAll: 'Repeat all',
  repeatOne: 'Repeat one',
  collapse: 'Collapse',
  nowPlaying: 'Now Playing',
  nothingPlaying: 'Nothing playing.',
  pickSomething: 'Pick one on Home, or search for one.',
  position: 'Playback position',
  resume: 'Keep Playing',
  songs: (count) => `${count} ${count === 1 ? 'song' : 'songs'}`,
  playAll: '▶ Play All',
  hotSongs: (count) => `${count} popular`,
  loadMore: 'Load More',
  loading: 'Loading…',
  retry: 'Retry',
  didNotLoad: 'It didn’t load.',
  refresh: 'Refresh',
  songsRow: 'Songs',
  popularSongs: 'Popular Songs',
  playlists: 'Playlists',
  albums: 'Albums',
  artists: 'Singers',
  playlist: 'Playlist',
  album: 'Album',
  artist: 'Singer',
  chart: 'Chart',
  noRecommendations: 'QQ Music sent no recommendations.',
  nothingFound: (query) => `Nothing found for “${query}”.`,
  emptyPlaylist: 'No songs in this playlist.',
  nothingHere: 'No songs here yet.',
  emptyLibrary: 'This account has no playlists yet.',
  signInNote: 'Sign in to QQ Music and your playlists show here.',
  signInWhere: 'Press Sign In, then scan the QR code in the window on the PC.',
  needsVip: 'This song needs a QQ Music membership.',
  cannotPlay: 'This song can’t be played.',
}

const SIMPLIFIED: Partial<Words> = {
  back: '返回',
  home: '首页',
  search: '搜索',
  library: '我的',
  signIn: '登录',
  searchHint: '搜歌、歌手、专辑',
  searchLabel: '搜索',
  searchStart: '搜一首歌、一个歌手，或者一张专辑。',
  searchFor: (query) => `搜索「${query}」`,
  play: '播放',
  pause: '暂停',
  next: '下一首',
  previous: '上一首',
  shuffle: '随机播放',
  shuffled: '随机',
  repeatOff: '顺序播放',
  repeatAll: '列表循环',
  repeatOne: '单曲循环',
  collapse: '收起',
  nowPlaying: '正在播放',
  nothingPlaying: '还没在放歌。',
  pickSomething: '去首页挑一首，或者搜一下。',
  position: '播放进度',
  resume: '继续播放',
  songs: (count) => `${count} 首`,
  playAll: '▶ 播放全部',
  hotSongs: (count) => `${count} 首热门`,
  loadMore: '加载更多',
  loading: '加载中…',
  retry: '重试',
  didNotLoad: '没加载出来。',
  refresh: '刷新',
  songsRow: '单曲',
  popularSongs: '热门单曲',
  playlists: '歌单',
  albums: '专辑',
  artists: '歌手',
  playlist: '歌单',
  album: '专辑',
  artist: '歌手',
  chart: '排行榜',
  noRecommendations: 'QQ 音乐没有送推荐内容。',
  nothingFound: (query) => `没找到「${query}」。`,
  emptyPlaylist: '这个歌单里没有歌。',
  nothingHere: '这里还没有歌。',
  emptyLibrary: '这个账号还没有歌单。',
  signInNote: '登录 QQ 音乐后，这里会显示你的歌单。',
  signInWhere: '点右上角的「登录」，在电脑上弹出的窗口里扫码。',
  needsVip: '这首歌需要 QQ 音乐会员。',
  cannotPlay: '这首歌放不了。',
}

const TRADITIONAL: Partial<Words> = {
  back: '返回',
  home: '首頁',
  search: '搜尋',
  library: '我的',
  signIn: '登入',
  searchHint: '搜尋歌曲、歌手、專輯',
  searchLabel: '搜尋',
  searchStart: '搜尋一首歌、一位歌手，或一張專輯。',
  searchFor: (query) => `搜尋「${query}」`,
  play: '播放',
  pause: '暫停',
  next: '下一首',
  previous: '上一首',
  shuffle: '隨機播放',
  shuffled: '隨機',
  repeatOff: '依序播放',
  repeatAll: '清單循環',
  repeatOne: '單曲循環',
  collapse: '收合',
  nowPlaying: '正在播放',
  nothingPlaying: '還沒在播放歌曲。',
  pickSomething: '到首頁挑一首，或搜尋一下。',
  position: '播放進度',
  resume: '繼續播放',
  songs: (count) => `${count} 首`,
  playAll: '▶ 播放全部',
  hotSongs: (count) => `${count} 首熱門`,
  loadMore: '載入更多',
  loading: '載入中…',
  retry: '重試',
  didNotLoad: '載入失敗。',
  refresh: '重新整理',
  songsRow: '單曲',
  popularSongs: '熱門單曲',
  playlists: '歌單',
  albums: '專輯',
  artists: '歌手',
  playlist: '歌單',
  album: '專輯',
  artist: '歌手',
  chart: '排行榜',
  noRecommendations: 'QQ 音樂沒有推薦內容。',
  nothingFound: (query) => `找不到「${query}」。`,
  emptyPlaylist: '這個歌單裡沒有歌曲。',
  nothingHere: '這裡還沒有歌曲。',
  emptyLibrary: '這個帳號還沒有歌單。',
  signInNote: '登入 QQ 音樂後，這裡會顯示你的歌單。',
  signInWhere: '點右上角的「登入」，在電腦上彈出的視窗裡掃碼。',
  needsVip: '這首歌需要 QQ 音樂會員。',
  cannotPlay: '這首歌無法播放。',
}

/** The cabin's language codes, as `cabin/state/strings` has them (`languageOf` gives `zh_cn`, `zh_tw`). */
const BY_LANGUAGE: Record<string, Partial<Words>> = {
  zh_cn: SIMPLIFIED,
  zh_tw: TRADITIONAL,
}

/** The app's words, in the cab's language (English where that language has none of its own). */
export function useQqMusicWords(): Words {
  const own = BY_LANGUAGE[useLanguage()]
  return own ? { ...ENGLISH, ...own } : ENGLISH
}

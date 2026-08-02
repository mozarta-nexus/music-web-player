export interface Song {
  id: string
  title: string
  artist: string
  album: string
  duration: number
  cover: string
  src: string
  /** 用于动态背景的主题色 */
  colors: [string, string, string]
}

export type PlayMode = 'order' | 'shuffle' | 'loop-one' | 'loop-all'

export interface AudioPlayerState {
  currentSong: Song | null
  currentIndex: number
  isPlaying: boolean
  currentTime: number
  duration: number
  volume: number
  muted: boolean
  playMode: PlayMode
  ready: boolean
}

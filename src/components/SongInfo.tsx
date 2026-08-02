import { useEffect, useState } from 'react'
import type { Song } from '../types'

interface SongInfoProps {
  song: Song | null
  isPlaying: boolean
  accent?: string
}

/**
 * 歌曲信息 - 大字体渐变文字，切换时淡入动画
 */
export default function SongInfo({ song, isPlaying, accent = '#a855f7' }: SongInfoProps) {
  const [displaySong, setDisplaySong] = useState(song)

  useEffect(() => {
    if (song && song.id !== displaySong?.id) {
      setDisplaySong(song)
    }
  }, [song, displaySong])

  if (!displaySong) return null

  return (
    <div className="text-center" key={displaySong.id}>
      <h1
        className="fade-in-up font-display text-2xl font-bold leading-tight tracking-tight text-gradient sm:text-3xl md:text-4xl"
        style={{ maxWidth: '100%' }}
      >
        {displaySong.title}
      </h1>

      <div className="fade-in-up mt-2 flex items-center justify-center gap-2 text-sm sm:text-base">
        <span className="font-medium text-white/70">{displaySong.artist}</span>
        <span className="text-white/30">·</span>
        <span className="text-white/50">{displaySong.album}</span>
      </div>

      {/* 播放状态指示 */}
      <div className="fade-in-up mt-3 flex items-center justify-center gap-2">
        <span
          className="inline-block h-1.5 w-1.5 rounded-full"
          style={{
            background: accent,
            boxShadow: `0 0 8px ${accent}`,
            opacity: isPlaying ? 1 : 0.3,
            transition: 'opacity 0.4s ease',
          }}
        />
        <span
          className="text-xs font-medium uppercase tracking-widest"
          style={{ color: isPlaying ? accent : 'rgba(255,255,255,0.4)' }}
        >
          {isPlaying ? 'Now Playing' : 'Paused'}
        </span>
      </div>
    </div>
  )
}

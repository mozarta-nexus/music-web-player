import { useEffect, useRef, useState } from 'react'
import { songs } from './data/songs'
import { useAudioPlayer } from './hooks/useAudioPlayer'
import { useAudioIntensity } from './hooks/useAudioIntensity'
import { useLoadSequence } from './hooks/useLoadSequence'
import VinylRecord from './components/VinylRecord'
import Tonearm from './components/Tonearm'
import DynamicBackground from './components/DynamicBackground'
import AudioVisualizer from './components/AudioVisualizer'
import PlayerControls from './components/PlayerControls'
import ProgressBar from './components/ProgressBar'
import VolumeControl from './components/VolumeControl'
import Playlist from './components/Playlist'
import SongInfo from './components/SongInfo'

export default function App() {
  const player = useAudioPlayer({ songs })
  const intensity = useAudioIntensity(player.analyser, player.isPlaying)
  const stage = useLoadSequence()

  const [playlistOpen, setPlaylistOpen] = useState(false)

  const accent = player.currentSong?.colors[0] ?? '#a855f7'
  const bgColors = (player.currentSong?.colors ?? ['#a855f7', '#1a0b2e', '#050507']) as [
    string,
    string,
    string,
  ]

  // 入场完成后尝试自动播放（仅一次，浏览器可能阻止）
  const autoplayedRef = useRef(false)
  useEffect(() => {
    if (!autoplayedRef.current && stage === 'done' && player.ready) {
      autoplayedRef.current = true
      player.play().catch(() => {})
    }
  }, [stage, player.ready, player.play])

  const entered = stage === 'vinyl' || stage === 'tonearm' || stage === 'done'
  const tonearmDown = stage === 'tonearm' || stage === 'done'

  return (
    <div className="relative h-full w-full">
      <DynamicBackground colors={bgColors} isPlaying={player.isPlaying} intensity={intensity} />

      {/* 主体布局 */}
      <div className="flex h-full w-full">
        {/* 主播放区 */}
        <main className="relative flex flex-1 flex-col items-center justify-between overflow-hidden px-4 py-6 sm:px-8 sm:py-8">
          {/* 顶部栏 */}
          <header
            className="fade-in-up flex w-full items-center justify-between"
            style={{ animationDelay: '0.3s' }}
          >
            <div className="flex items-center gap-2.5">
              <div
                className="flex h-9 w-9 items-center justify-center rounded-full"
                style={{
                  background: `linear-gradient(135deg, ${accent}, ${accent}66)`,
                  boxShadow: `0 0 16px ${accent}88`,
                }}
              >
                <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5 text-white">
                  <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.5" />
                  <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="1.5" />
                  <circle cx="12" cy="12" r="1" fill="currentColor" />
                </svg>
              </div>
              <div>
                <h1 className="font-display text-base font-bold tracking-tight text-white sm:text-lg">
                  VINYL
                </h1>
                <p className="-mt-1 text-[10px] uppercase tracking-[0.2em] text-white/40">
                  HiFi Player
                </p>
              </div>
            </div>

            {/* 移动端打开列表按钮 */}
            <button
              onClick={() => setPlaylistOpen(true)}
              className="btn-press glass flex h-10 items-center gap-2 rounded-full px-4 text-sm text-white/80 hover:text-white lg:hidden"
            >
              <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4">
                <path
                  d="M4 6h16M4 12h16M4 18h16"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              </svg>
              列表
            </button>
          </header>

          {/* 唱片 + 可视化区域 */}
          <div className="relative flex flex-1 w-full items-center justify-center py-4">
            <div
              className="relative aspect-square w-full max-w-[min(70vh,460px)] sm:max-w-[min(60vh,520px)]"
              style={{
                opacity: stage === 'hidden' ? 0 : 1,
                transition: 'opacity 1s ease',
              }}
            >
              {/* 频谱可视化（环绕） */}
              <AudioVisualizer
                analyser={player.analyser}
                isPlaying={player.isPlaying}
                accent={accent}
              />

              {/* 唱片 */}
              <VinylRecord
                cover={player.currentSong?.cover ?? ''}
                isPlaying={player.isPlaying}
                intensity={intensity}
                accent={accent}
                entered={entered}
              />

              {/* 唱针 */}
              <Tonearm isPlaying={tonearmDown && player.isPlaying} entered={entered} />
            </div>
          </div>

          {/* 信息 + 控制 + 进度 */}
          <section
            className="fade-in-up flex w-full max-w-xl flex-col gap-5"
            style={{ animationDelay: '0.6s' }}
          >
            <SongInfo
              song={player.currentSong}
              isPlaying={player.isPlaying}
              accent={accent}
            />

            <PlayerControls
              isPlaying={player.isPlaying}
              playMode={player.playMode}
              onToggle={player.toggle}
              onNext={player.next}
              onPrev={player.prev}
              onCycleMode={player.cyclePlayMode}
              accent={accent}
            />

            <ProgressBar
              currentTime={player.currentTime}
              duration={player.duration || player.currentSong?.duration || 0}
              onSeek={player.seek}
              accent={accent}
            />

            <div className="flex items-center justify-center">
              <VolumeControl
                volume={player.volume}
                muted={player.muted}
                onVolume={player.setVolume}
                onToggleMute={() => player.setMuted(!player.muted)}
                accent={accent}
              />
            </div>
          </section>
        </main>

        {/* 播放列表（桌面常驻 / 移动抽屉） */}
        <Playlist
          songs={songs}
          currentIndex={player.currentIndex}
          isPlaying={player.isPlaying}
          onSelect={(i) => {
            player.playIndex(i)
            setPlaylistOpen(false)
          }}
          open={playlistOpen}
          onClose={() => setPlaylistOpen(false)}
          accent={accent}
        />
      </div>

      {/* 加载遮罩 */}
      {stage !== 'done' && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black transition-opacity duration-1000"
          style={{ opacity: stage === 'hidden' ? 1 : 0, pointerEvents: 'none' }}
        >
          <div className="text-center">
            <div
              className="mx-auto h-12 w-12 rounded-full border-2 border-white/20"
              style={{ borderTopColor: accent, animation: 'spin 1s linear infinite' }}
            />
            <p className="mt-4 font-display text-sm uppercase tracking-[0.3em] text-white/50">
              Vinyl
            </p>
          </div>
        </div>
      )}
    </div>
  )
}

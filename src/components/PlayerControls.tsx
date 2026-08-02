import type { PlayMode } from '../types'

interface PlayerControlsProps {
  isPlaying: boolean
  playMode: PlayMode
  onToggle: () => void
  onNext: () => void
  onPrev: () => void
  onCycleMode: () => void
  accent?: string
}

function ShuffleIcon({ active }: { active: boolean }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5">
      <path
        d="M16 3h5v5M4 20l17-17M21 16v5h-5M15 15l6 6M4 4l5 5"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {active && (
        <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1" opacity="0.4" />
      )}
    </svg>
  )
}

function LoopIcon({ active, one }: { active: boolean; one: boolean }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5">
      <path
        d="M17 2l4 4-4 4M3 11V9a4 4 0 014-4h14M7 22l-4-4 4-4M21 13v2a4 4 0 01-4 4H3"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {one && (
        <text x="12" y="15" textAnchor="middle" fontSize="9" fill="currentColor" fontWeight="700">
          1
        </text>
      )}
      {active && !one && (
        <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1" opacity="0.4" />
      )}
    </svg>
  )
}

export default function PlayerControls({
  isPlaying,
  playMode,
  onToggle,
  onNext,
  onPrev,
  onCycleMode,
  accent = '#a855f7',
}: PlayerControlsProps) {
  const modeLabel =
    playMode === 'order'
      ? '顺序播放'
      : playMode === 'loop-all'
        ? '列表循环'
        : playMode === 'loop-one'
          ? '单曲循环'
          : '随机播放'

  return (
    <div className="flex items-center justify-center gap-3 sm:gap-5">
      {/* 模式切换 */}
      <button
        onClick={onCycleMode}
        aria-label={`播放模式：${modeLabel}`}
        title={modeLabel}
        className="btn-press glass flex h-10 w-10 items-center justify-center rounded-full text-white/60 transition-all hover:text-white sm:h-11 sm:w-11"
        style={{
          color:
            playMode === 'order' ? 'rgba(255,255,255,0.55)' : accent,
        }}
      >
        {playMode === 'shuffle' ? (
          <ShuffleIcon active />
        ) : (
          <LoopIcon
            active={playMode === 'loop-all'}
            one={playMode === 'loop-one'}
          />
        )}
      </button>

      {/* 上一首 */}
      <button
        onClick={onPrev}
        aria-label="上一首"
        title="上一首"
        className="btn-press glass flex h-12 w-12 items-center justify-center rounded-full text-white/80 transition-all hover:text-white hover:shadow-[0_0_20px_rgba(255,255,255,0.2)] sm:h-14 sm:w-14"
      >
        <svg viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5 sm:h-6 sm:w-6">
          <path d="M6 6h2v12H6zm3.5 6l8.5 6V6z" />
        </svg>
      </button>

      {/* 播放/暂停（主按钮） */}
      <button
        onClick={onToggle}
        aria-label={isPlaying ? '暂停' : '播放'}
        title={isPlaying ? '暂停' : '播放'}
        className="btn-press glass-strong relative flex h-16 w-16 items-center justify-center rounded-full text-white transition-all hover:scale-105 sm:h-20 sm:w-20"
        style={{
          background: `linear-gradient(135deg, ${accent} 0%, ${accent}88 100%)`,
          boxShadow: `0 0 30px ${accent}88, 0 8px 30px rgba(0,0,0,0.5)`,
        }}
      >
        {/* 播放时呼吸光环 */}
        {isPlaying && (
          <span
            className="absolute inset-0 rounded-full"
            style={{
              border: `2px solid ${accent}`,
              animation: 'breathe 2s ease-in-out infinite',
            }}
          />
        )}
        {isPlaying ? (
          <svg viewBox="0 0 24 24" fill="currentColor" className="h-7 w-7 sm:h-8 sm:w-8">
            <rect x="6" y="5" width="4" height="14" rx="1" />
            <rect x="14" y="5" width="4" height="14" rx="1" />
          </svg>
        ) : (
          <svg viewBox="0 0 24 24" fill="currentColor" className="ml-1 h-7 w-7 sm:h-8 sm:w-8">
            <path d="M8 5v14l11-7z" />
          </svg>
        )}
      </button>

      {/* 下一首 */}
      <button
        onClick={onNext}
        aria-label="下一首"
        title="下一首"
        className="btn-press glass flex h-12 w-12 items-center justify-center rounded-full text-white/80 transition-all hover:text-white hover:shadow-[0_0_20px_rgba(255,255,255,0.2)] sm:h-14 sm:w-14"
      >
        <svg viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5 sm:h-6 sm:w-6">
          <path d="M16 6h2v12h-2zM6 18l8.5-6L6 6z" />
        </svg>
      </button>

      {/* 占位保持对称（模式按钮在左） */}
      <div className="flex h-10 w-10 items-center justify-center text-[10px] text-white/40 sm:h-11 sm:w-11">
        <span className="hidden sm:inline">{modeLabel.slice(0, 2)}</span>
      </div>
    </div>
  )
}

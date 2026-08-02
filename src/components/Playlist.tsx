import { useEffect, useRef } from 'react'
import type { Song } from '../types'
import { formatTime } from '../utils/format'

interface PlaylistProps {
  songs: Song[]
  currentIndex: number
  isPlaying: boolean
  onSelect: (index: number) => void
  open: boolean
  onClose: () => void
  accent?: string
}

export default function Playlist({
  songs,
  currentIndex,
  isPlaying,
  onSelect,
  open,
  onClose,
  accent = '#a855f7',
}: PlaylistProps) {
  const listRef = useRef<HTMLDivElement | null>(null)
  const activeRef = useRef<HTMLButtonElement | null>(null)

  // 当前歌曲滚动到可见
  useEffect(() => {
    if (open && activeRef.current) {
      activeRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' })
    }
  }, [currentIndex, open])

  return (
    <>
      {/* 移动端遮罩 */}
      <div
        className="fixed inset-0 z-30 bg-black/60 backdrop-blur-sm transition-opacity lg:hidden"
        style={{ opacity: open ? 1 : 0, pointerEvents: open ? 'auto' : 'none' }}
        onClick={onClose}
      />

      <aside
        className={`glass-dark fixed right-0 top-0 z-40 flex h-full w-80 max-w-[85vw] flex-col border-l border-white/[0.06] transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] lg:static lg:z-0 lg:translate-x-0 ${open ? 'translate-x-0' : 'translate-x-full lg:translate-x-0'}`}
      >
        {/* 头部 */}
        <div className="flex items-center justify-between px-5 pb-3 pt-6">
          <div>
            <h2 className="font-display text-lg font-bold text-white">播放列表</h2>
            <p className="mt-0.5 text-xs text-white/40">{songs.length} 首歌曲</p>
          </div>
          <button
            onClick={onClose}
            aria-label="关闭播放列表"
            className="btn-press glass flex h-9 w-9 items-center justify-center rounded-full text-white/70 hover:text-white lg:hidden"
          >
            <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5">
              <path
                d="M6 6l12 12M18 6L6 18"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              />
            </svg>
          </button>
        </div>

        {/* 列表 */}
        <div ref={listRef} className="scrollbar-hide flex-1 overflow-y-auto px-3 pb-6">
          {songs.map((song, i) => {
            const active = i === currentIndex
            return (
              <button
                key={song.id}
                ref={active ? activeRef : undefined}
                onClick={() => onSelect(i)}
                className="group mb-1 flex w-full items-center gap-3 rounded-xl p-2.5 text-left transition-all"
                style={{
                  background: active ? `${accent}22` : 'transparent',
                  boxShadow: active ? `inset 0 0 0 1px ${accent}55` : 'none',
                }}
              >
                {/* 缩略图 */}
                <div className="relative h-12 w-12 flex-shrink-0 overflow-hidden rounded-lg">
                  <img
                    src={song.cover}
                    alt={song.title}
                    className="h-full w-full object-cover"
                    loading="lazy"
                    onError={(e) => {
                      const t = e.currentTarget
                      t.style.display = 'none'
                      t.parentElement!.style.background = `linear-gradient(135deg, ${song.colors[0]}, ${song.colors[1]})`
                    }}
                  />
                  {active && isPlaying && (
                    <div
                      className="absolute inset-0 flex items-center justify-center"
                      style={{ background: `${accent}aa` }}
                    >
                      <div className="flex items-end gap-0.5">
                        {[0, 1, 2].map((k) => (
                          <span
                            key={k}
                            className="w-1 rounded-sm bg-white"
                            style={{
                              height: '40%',
                              animation: `eq 0.8s ease-in-out ${k * 0.15}s infinite`,
                            }}
                          />
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* 信息 */}
                <div className="min-w-0 flex-1">
                  <p
                    className="truncate text-sm font-semibold"
                    style={{ color: active ? '#fff' : 'rgba(255,255,255,0.85)' }}
                  >
                    {song.title}
                  </p>
                  <p className="truncate text-xs text-white/45">{song.artist}</p>
                </div>

                {/* 时长 */}
                <span className="flex-shrink-0 text-xs tabular-nums text-white/40">
                  {formatTime(song.duration)}
                </span>
              </button>
            )
          })}
        </div>
      </aside>

      <style>{`
        @keyframes eq {
          0%, 100% { height: 30%; }
          50% { height: 90%; }
        }
      `}</style>
    </>
  )
}

import { useCallback, useRef, useState } from 'react'
import { formatTime, clamp } from '../utils/format'

interface ProgressBarProps {
  currentTime: number
  duration: number
  onSeek: (time: number) => void
  accent?: string
}

/**
 * 进度条 - 唱片机控制条风格
 * - 可拖动
 * - 拖动时显示时间气泡
 */
export default function ProgressBar({
  currentTime,
  duration,
  onSeek,
  accent = '#a855f7',
}: ProgressBarProps) {
  const trackRef = useRef<HTMLDivElement | null>(null)
  const [dragging, setDragging] = useState(false)
  const [dragTime, setDragTime] = useState(0)

  const progress = duration > 0 ? clamp(currentTime / duration, 0, 1) : 0

  const timeFromEvent = useCallback((clientX: number) => {
    const el = trackRef.current
    if (!el || duration <= 0) return 0
    const rect = el.getBoundingClientRect()
    const ratio = clamp((clientX - rect.left) / rect.width, 0, 1)
    return ratio * duration
  }, [duration])

  const onPointerDown = (e: React.PointerEvent) => {
    e.currentTarget.setPointerCapture(e.pointerId)
    setDragging(true)
    const t = timeFromEvent(e.clientX)
    setDragTime(t)
    onSeek(t)
  }

  const onPointerMove = (e: React.PointerEvent) => {
    if (!dragging) return
    const t = timeFromEvent(e.clientX)
    setDragTime(t)
    onSeek(t)
  }

  const onPointerUp = (e: React.PointerEvent) => {
    e.currentTarget.releasePointerCapture(e.pointerId)
    setDragging(false)
  }

  const displayTime = dragging ? dragTime : currentTime

  return (
    <div className="w-full select-none">
      <div className="mb-2 flex items-center justify-between text-xs font-medium tabular-nums text-white/50">
        <span className="text-white/80">{formatTime(displayTime)}</span>
        <span>{formatTime(duration)}</span>
      </div>

      <div
        ref={trackRef}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        className="group relative h-2 cursor-pointer rounded-full"
        style={{
          background: 'rgba(255,255,255,0.08)',
        }}
      >
        {/* 已播放部分 */}
        <div
          className="absolute inset-y-0 left-0 rounded-full"
          style={{
            width: `${progress * 100}%`,
            background: `linear-gradient(90deg, ${accent}88, ${accent})`,
            boxShadow: `0 0 12px ${accent}aa`,
          }}
        />

        {/* 拖动手柄 */}
        <div
          className="absolute top-1/2 h-4 w-4 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white/80 transition-transform group-hover:scale-110"
          style={{
            left: `${progress * 100}%`,
            background: accent,
            boxShadow: `0 0 16px ${accent}, 0 2px 6px rgba(0,0,0,0.5)`,
            transform: dragging
              ? 'translate(-50%, -50%) scale(1.3)'
              : 'translate(-50%, -50%) scale(1)',
          }}
        />

        {/* 拖动时的时间气泡 */}
        {dragging && (
          <div
            className="glass-dark absolute -top-9 -translate-x-1/2 whitespace-nowrap rounded-md px-2 py-1 text-xs font-semibold text-white"
            style={{ left: `${progress * 100}%` }}
          >
            {formatTime(dragTime)}
          </div>
        )}
      </div>
    </div>
  )
}

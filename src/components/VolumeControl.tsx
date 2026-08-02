import { useRef, useState } from 'react'
import { clamp } from '../utils/format'

interface VolumeControlProps {
  volume: number
  muted: boolean
  onVolume: (v: number) => void
  onToggleMute: () => void
  accent?: string
}

export default function VolumeControl({
  volume,
  muted,
  onVolume,
  onToggleMute,
  accent = '#a855f7',
}: VolumeControlProps) {
  const trackRef = useRef<HTMLDivElement | null>(null)
  const [dragging, setDragging] = useState(false)

  const effective = muted ? 0 : volume

  const valueFromEvent = (clientX: number) => {
    const el = trackRef.current
    if (!el) return 0
    const rect = el.getBoundingClientRect()
    return clamp((clientX - rect.left) / rect.width, 0, 1)
  }

  const onPointerDown = (e: React.PointerEvent) => {
    e.currentTarget.setPointerCapture(e.pointerId)
    setDragging(true)
    onVolume(valueFromEvent(e.clientX))
  }
  const onPointerMove = (e: React.PointerEvent) => {
    if (!dragging) return
    onVolume(valueFromEvent(e.clientX))
  }
  const onPointerUp = (e: React.PointerEvent) => {
    e.currentTarget.releasePointerCapture(e.pointerId)
    setDragging(false)
  }

  return (
    <div className="flex items-center gap-2">
      <button
        onClick={onToggleMute}
        className="btn-press text-white/60 transition-colors hover:text-white"
        title={muted ? '取消静音' : '静音'}
      >
        {muted || volume === 0 ? (
          <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5">
            <path
              d="M11 5L6 9H2v6h4l5 4V5zM23 9l-6 6M17 9l6 6"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        ) : volume < 0.5 ? (
          <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5">
            <path
              d="M11 5L6 9H2v6h4l5 4V5zM15.54 8.46a5 5 0 010 7.07"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        ) : (
          <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5">
            <path
              d="M11 5L6 9H2v6h4l5 4V5zM19.07 4.93a10 10 0 010 14.14M15.54 8.46a5 5 0 010 7.07"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        )}
      </button>

      <div
        ref={trackRef}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        className="group relative h-1.5 w-24 cursor-pointer rounded-full sm:w-28"
        style={{ background: 'rgba(255,255,255,0.08)' }}
      >
        <div
          className="absolute inset-y-0 left-0 rounded-full"
          style={{
            width: `${effective * 100}%`,
            background: accent,
            boxShadow: `0 0 8px ${accent}aa`,
          }}
        />
        <div
          className="absolute top-1/2 h-3 w-3 -translate-x-1/2 -translate-y-1/2 rounded-full opacity-0 transition-opacity group-hover:opacity-100"
          style={{
            left: `${effective * 100}%`,
            background: '#fff',
            boxShadow: `0 0 8px ${accent}`,
          }}
        />
      </div>
    </div>
  )
}

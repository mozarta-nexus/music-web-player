import { useEffect, useRef } from 'react'
import { prefersReducedMotion } from '../utils/motion'

interface VinylRecordProps {
  cover: string
  isPlaying: boolean
  /** 0-1，音乐强度，用于轻微动态效果 */
  intensity?: number
  /** 主题色 */
  accent?: string
  /** 入场动画是否已完成 */
  entered?: boolean
}

/**
 * 黑胶唱片核心视觉组件
 * - 同心圆沟槽（repeating-radial-gradient）
 * - 反光光泽（conic-gradient）
 * - 中心专辑封面随唱片旋转
 * - 播放时匀速旋转，暂停时缓慢减速停止（rAF 驱动）
 */
export default function VinylRecord({
  cover,
  isPlaying,
  intensity = 0,
  accent = '#a855f7',
  entered = true,
}: VinylRecordProps) {
  const recordRef = useRef<HTMLDivElement | null>(null)
  const speedRef = useRef(0)
  const rafRef = useRef<number>(0)
  const lastTimeRef = useRef<number>(0)
  const angleRef = useRef(0)

  useEffect(() => {
    if (prefersReducedMotion()) return

    const tick = (t: number) => {
      const last = lastTimeRef.current || t
      const dt = (t - last) / 1000
      lastTimeRef.current = t

      const targetSpeed = isPlaying ? 60 : 0 // 度/秒
      // 加速/减速过渡
      if (isPlaying) {
        speedRef.current += (targetSpeed - speedRef.current) * Math.min(dt * 2, 1)
      } else {
        speedRef.current *= Math.max(0, 1 - dt * 1.2) // 缓慢减速
      }

      angleRef.current = (angleRef.current + speedRef.current * dt) % 360
      if (recordRef.current) {
        recordRef.current.style.transform = `rotate(${angleRef.current}deg)`
      }
      rafRef.current = requestAnimationFrame(tick)
    }
    rafRef.current = requestAnimationFrame(tick)
    return () => {
      cancelAnimationFrame(rafRef.current)
      lastTimeRef.current = 0
    }
  }, [isPlaying])

  // 根据音乐强度的轻微缩放抖动
  const microScale = 1 + intensity * 0.012

  return (
    <div
      className="relative aspect-square w-full select-none"
      style={{
        transform: entered ? 'scale(1)' : 'scale(0.85)',
        opacity: entered ? 1 : 0,
        transition: 'transform 1.4s cubic-bezier(0.16,1,0.3,1), opacity 1.2s ease',
      }}
    >
      {/* 外圈光晕 */}
      <div
        className="absolute inset-0 rounded-full blur-2xl"
        style={{
          background: `radial-gradient(circle, ${accent}33 0%, transparent 70%)`,
          transform: `scale(${microScale})`,
          transition: 'transform 0.15s ease-out',
        }}
      />

      {/* 唱片本体 */}
      <div
        ref={recordRef}
        className="absolute inset-0 rounded-full"
        style={{
          transform: 'rotate(0deg)',
          willChange: 'transform',
          background: `
            radial-gradient(circle at 50% 50%,
              #1a1a1f 0%,
              #0d0d10 28%,
              #161618 30%,
              #0a0a0c 32%,
              #141416 100%
            ),
            repeating-radial-gradient(circle at 50% 50%,
              transparent 0px,
              transparent 2px,
              rgba(255,255,255,0.018) 2.5px,
              transparent 3px
            )
          `,
          boxShadow: `
            inset 0 0 40px rgba(0,0,0,0.9),
            inset 0 0 120px rgba(255,255,255,0.03),
            0 20px 60px rgba(0,0,0,0.8),
            0 0 80px ${accent}22
          `,
        }}
      >
        {/* 沟槽反光层 */}
        <div
          className="absolute inset-0 rounded-full vinyl-sheen"
          style={{ mixBlendMode: 'screen' }}
        />

        {/* 第二层细密沟槽 */}
        <div
          className="absolute inset-0 rounded-full"
          style={{
            background: `repeating-radial-gradient(circle at 50% 50%,
              transparent 0px,
              transparent 4px,
              rgba(0,0,0,0.25) 4.5px,
              transparent 5px
            )`,
          }}
        />

        {/* 中心标签（专辑封面） */}
        <div
          className="absolute left-1/2 top-1/2 overflow-hidden rounded-full"
          style={{
            width: '38%',
            height: '38%',
            transform: 'translate(-50%, -50%)',
            boxShadow: `
              0 0 0 2px rgba(0,0,0,0.6),
              0 0 0 4px ${accent}55,
              0 0 30px ${accent}66,
              inset 0 0 20px rgba(0,0,0,0.4)
            `,
          }}
        >
          <img
            src={cover}
            alt="album cover"
            className="h-full w-full object-cover"
            draggable={false}
            onError={(e) => {
              const target = e.currentTarget
              target.style.display = 'none'
              target.parentElement!.style.background = `radial-gradient(circle, ${accent}, #1a0b2e)`
            }}
          />
          {/* 封面光泽 */}
          <div
            className="absolute inset-0 rounded-full"
            style={{
              background:
                'conic-gradient(from 45deg, transparent 0deg, rgba(255,255,255,0.15) 90deg, transparent 180deg, rgba(0,0,0,0.2) 270deg, transparent 360deg)',
              mixBlendMode: 'overlay',
            }}
          />
        </div>

        {/* 中心孔 */}
        <div
          className="absolute left-1/2 top-1/2 rounded-full"
          style={{
            width: '4%',
            height: '4%',
            transform: 'translate(-50%, -50%)',
            background: 'radial-gradient(circle, #000 30%, #1a1a1f 100%)',
            boxShadow: 'inset 0 0 4px rgba(255,255,255,0.2)',
          }}
        />
      </div>

      {/* 顶部高光（固定不旋转） */}
      <div
        className="pointer-events-none absolute inset-0 rounded-full"
        style={{
          background:
            'linear-gradient(135deg, rgba(255,255,255,0.08) 0%, transparent 30%, transparent 70%, rgba(255,255,255,0.03) 100%)',
          mixBlendMode: 'screen',
        }}
      />
    </div>
  )
}

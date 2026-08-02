import { useEffect, useRef } from 'react'
import { prefersReducedMotion } from '../utils/motion'

interface DynamicBackgroundProps {
  colors: [string, string, string]
  isPlaying: boolean
  intensity: number
}

interface Star {
  x: number
  y: number
  r: number
  vx: number
  vy: number
  alpha: number
  twinkle: number
  twinkleSpeed: number
}

interface Ripple {
  x: number
  y: number
  radius: number
  maxRadius: number
  alpha: number
  speed: number
}

interface Comet {
  x: number
  y: number
  vx: number
  vy: number
  len: number
  alpha: number
  life: number
  maxLife: number
}

interface Aurora {
  offset: number
  speed: number
  amplitude: number
  y: number
  height: number
}

function hexToRgb(hex: string): [number, number, number] {
  const v = parseInt(hex.slice(1), 16)
  return [(v >> 16) & 255, (v >> 8) & 255, v & 255]
}

export default function DynamicBackground({ colors, isPlaying, intensity }: DynamicBackgroundProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const starsRef = useRef<Star[]>([])
  const ripplesRef = useRef<Ripple[]>([])
  const cometsRef = useRef<Comet[]>([])
  const auroraRef = useRef<Aurora[]>([])
  const rafRef = useRef<number>(0)
  const tickRef = useRef(0)
  const rippleTimerRef = useRef(0)
  const cometTimerRef = useRef(0)
  const intensityRef = useRef(intensity)

  useEffect(() => {
    intensityRef.current = intensity
  }, [intensity])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')!

    const dpr = Math.min(window.devicePixelRatio || 1, 2)

    const resize = () => {
      canvas.width = window.innerWidth * dpr
      canvas.height = window.innerHeight * dpr
      canvas.style.width = window.innerWidth + 'px'
      canvas.style.height = window.innerHeight + 'px'
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    }
    resize()
    window.addEventListener('resize', resize)

    const W = () => window.innerWidth
    const H = () => window.innerHeight

    // 初始化星尘
    const initStars = () => {
      starsRef.current = Array.from({ length: 180 }, () => ({
        x: Math.random() * W(),
        y: Math.random() * H(),
        r: Math.random() * 2 + 0.3,
        vx: (Math.random() - 0.5) * 0.4,
        vy: (Math.random() - 0.5) * 0.25 - 0.1,
        alpha: Math.random() * 0.6 + 0.15,
        twinkle: Math.random() * Math.PI * 2,
        twinkleSpeed: Math.random() * 0.04 + 0.01,
      }))
    }
    initStars()

    // 初始化极光带
    auroraRef.current = Array.from({ length: 4 }, (_, i) => ({
      offset: Math.random() * 1000,
      speed: 0.3 + Math.random() * 0.5,
      amplitude: 30 + Math.random() * 50,
      y: 0.15 + i * 0.12 + Math.random() * 0.05,
      height: 60 + Math.random() * 80,
    }))

    const c0 = hexToRgb(colors[0])
    const c1 = hexToRgb(colors[1])

    // 减少动态效果：只绘制一帧静态星尘
    if (prefersReducedMotion()) {
      const drawStatic = () => {
        const w = W()
        const h = H()
        ctx.clearRect(0, 0, w, h)
        starsRef.current.forEach((s) => {
          const rgb = c0
          ctx.beginPath()
          ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2)
          ctx.fillStyle = `rgba(${rgb[0]},${rgb[1]},${rgb[2]},${s.alpha})`
          ctx.fill()
        })
      }
      const onResize = () => {
        resize()
        drawStatic()
      }
      drawStatic()
      window.addEventListener('resize', onResize)
      return () => {
        window.removeEventListener('resize', onResize)
        window.removeEventListener('resize', resize)
      }
    }

    const draw = () => {
      const w = W()
      const h = H()
      const t = tickRef.current++
      const intensity = intensityRef.current
      ctx.clearRect(0, 0, w, h)

      const speedMul = isPlaying ? 1 + intensity * 1.5 : 0.3
      const glowMul = isPlaying ? 0.7 + intensity * 0.6 : 0.3

      // ===== 1. 极光带 =====
      if (isPlaying) {
        auroraRef.current.forEach((a, ai) => {
          const baseY = a.y * h
          ctx.beginPath()
          ctx.moveTo(0, baseY)
          for (let x = 0; x <= w; x += 8) {
            const wave1 = Math.sin((x * 0.003 + t * 0.008 * a.speed + a.offset) * 1.0) * a.amplitude
            const wave2 = Math.sin((x * 0.007 - t * 0.005 * a.speed + a.offset * 2) * 1.0) * a.amplitude * 0.5
            const wave3 = Math.sin((x * 0.001 + t * 0.003) * 1.0) * a.amplitude * 0.3
            ctx.lineTo(x, baseY + wave1 + wave2 + wave3)
          }
          ctx.lineTo(w, h)
          ctx.lineTo(0, h)
          ctx.closePath()

          const grad = ctx.createLinearGradient(0, baseY - a.height, 0, baseY + a.height)
          const rgb = ai % 2 === 0 ? c0 : c1
          const baseAlpha = glowMul * 0.12 * (1 + intensity * 0.5)
          grad.addColorStop(0, `rgba(${rgb[0]},${rgb[1]},${rgb[2]},0)`)
          grad.addColorStop(0.3, `rgba(${rgb[0]},${rgb[1]},${rgb[2]},${baseAlpha})`)
          grad.addColorStop(0.5, `rgba(${rgb[0]},${rgb[1]},${rgb[2]},${baseAlpha * 1.5})`)
          grad.addColorStop(0.7, `rgba(${rgb[0]},${rgb[1]},${rgb[2]},${baseAlpha})`)
          grad.addColorStop(1, `rgba(${rgb[0]},${rgb[1]},${rgb[2]},0)`)
          ctx.fillStyle = grad
          ctx.fill()
        })
      }

      // ===== 2. 星尘粒子 =====
      starsRef.current.forEach((s) => {
        s.x += s.vx * speedMul
        s.y += s.vy * speedMul
        s.twinkle += s.twinkleSpeed * speedMul

        if (s.x < -10) s.x = w + 10
        if (s.x > w + 10) s.x = -10
        if (s.y < -10) s.y = h + 10
        if (s.y > h + 10) s.y = -10

        const twinkleAlpha = s.alpha * (0.6 + 0.4 * Math.sin(s.twinkle))
        const rgb = s.twinkle > Math.PI ? c0 : c1

        // 播放时拖尾
        if (isPlaying && s.r > 1.2) {
          const tailLen = 3 + intensity * 8
          const grad = ctx.createLinearGradient(
            s.x - s.vx * tailLen,
            s.y - s.vy * tailLen,
            s.x,
            s.y,
          )
          grad.addColorStop(0, `rgba(${rgb[0]},${rgb[1]},${rgb[2]},0)`)
          grad.addColorStop(1, `rgba(${rgb[0]},${rgb[1]},${rgb[2]},${twinkleAlpha * 0.4})`)
          ctx.strokeStyle = grad
          ctx.lineWidth = s.r * 0.8
          ctx.beginPath()
          ctx.moveTo(s.x - s.vx * tailLen, s.y - s.vy * tailLen)
          ctx.lineTo(s.x, s.y)
          ctx.stroke()
        }

        ctx.beginPath()
        ctx.arc(s.x, s.y, s.r * (isPlaying ? 1 + intensity * 0.3 : 1), 0, Math.PI * 2)
        ctx.fillStyle = `rgba(${rgb[0]},${rgb[1]},${rgb[2]},${twinkleAlpha})`
        ctx.fill()

        // 大粒子发光
        if (s.r > 1.8 && isPlaying) {
          ctx.beginPath()
          ctx.arc(s.x, s.y, s.r * 4, 0, Math.PI * 2)
          ctx.fillStyle = `rgba(${rgb[0]},${rgb[1]},${rgb[2]},${twinkleAlpha * 0.08 * glowMul})`
          ctx.fill()
        }
      })

      // ===== 3. 脉冲波纹 =====
      // 音乐节拍触发新波纹
      if (isPlaying) {
        rippleTimerRef.current++
        const interval = Math.max(15, 60 - intensity * 50)
        if (rippleTimerRef.current > interval && intensity > 0.15) {
          rippleTimerRef.current = 0
          ripplesRef.current.push({
            x: w * 0.5 + (Math.random() - 0.5) * w * 0.3,
            y: h * 0.45 + (Math.random() - 0.5) * h * 0.2,
            radius: 0,
            maxRadius: 150 + Math.random() * 200,
            alpha: 0.25 + intensity * 0.2,
            speed: 2 + intensity * 3,
          })
        }
      }

      ripplesRef.current = ripplesRef.current.filter((r) => {
        r.radius += r.speed
        r.alpha *= 0.985
        if (r.alpha < 0.01 || r.radius > r.maxRadius) return false

        const rgb = c0
        ctx.beginPath()
        ctx.arc(r.x, r.y, r.radius, 0, Math.PI * 2)
        ctx.strokeStyle = `rgba(${rgb[0]},${rgb[1]},${rgb[2]},${r.alpha})`
        ctx.lineWidth = 1.5 + intensity * 2
        ctx.stroke()

        // 内发光
        ctx.beginPath()
        ctx.arc(r.x, r.y, r.radius, 0, Math.PI * 2)
        ctx.strokeStyle = `rgba(${rgb[0]},${rgb[1]},${rgb[2]},${r.alpha * 0.3})`
        ctx.lineWidth = 6 + intensity * 8
        ctx.stroke()
        return true
      })

      // ===== 4. 光线射线 =====
      if (isPlaying && intensity > 0.1) {
        const cx = w * 0.5
        const cy = h * 0.45
        const rayCount = 12
        const rotSpeed = t * 0.0003
        for (let i = 0; i < rayCount; i++) {
          const angle = (i / rayCount) * Math.PI * 2 + rotSpeed
          const len = 80 + intensity * 200 + Math.sin(t * 0.02 + i) * 40
          const x2 = cx + Math.cos(angle) * len
          const y2 = cy + Math.sin(angle) * len
          const rgb = i % 2 === 0 ? c0 : c1
          const grad = ctx.createLinearGradient(cx, cy, x2, y2)
          grad.addColorStop(0, `rgba(${rgb[0]},${rgb[1]},${rgb[2]},${intensity * 0.15})`)
          grad.addColorStop(1, `rgba(${rgb[0]},${rgb[1]},${rgb[2]},0)`)
          ctx.strokeStyle = grad
          ctx.lineWidth = 1.5 + intensity * 2
          ctx.beginPath()
          ctx.moveTo(cx, cy)
          ctx.lineTo(x2, y2)
          ctx.stroke()
        }
      }

      // ===== 5. 流星/彗星 =====
      cometTimerRef.current++
      if (isPlaying && cometTimerRef.current > 120 + Math.random() * 200) {
        cometTimerRef.current = 0
        const fromLeft = Math.random() > 0.5
        cometsRef.current.push({
          x: fromLeft ? -20 : w + 20,
          y: Math.random() * h * 0.5,
          vx: fromLeft ? (3 + Math.random() * 4) : -(3 + Math.random() * 4),
          vy: 1.5 + Math.random() * 2,
          len: 60 + Math.random() * 100,
          alpha: 0.6 + Math.random() * 0.3,
          life: 0,
          maxLife: 80 + Math.random() * 60,
        })
      }

      cometsRef.current = cometsRef.current.filter((c) => {
        c.x += c.vx * speedMul
        c.y += c.vy * speedMul
        c.life++
        c.alpha *= 0.99
        if (c.life > c.maxLife || c.alpha < 0.01) return false

        const tailX = c.x - (c.vx / Math.sqrt(c.vx * c.vx + c.vy * c.vy)) * c.len
        const tailY = c.y - (c.vy / Math.sqrt(c.vx * c.vx + c.vy * c.vy)) * c.len
        const rgb = c0
        const grad = ctx.createLinearGradient(tailX, tailY, c.x, c.y)
        grad.addColorStop(0, `rgba(${rgb[0]},${rgb[1]},${rgb[2]},0)`)
        grad.addColorStop(0.7, `rgba(${rgb[0]},${rgb[1]},${rgb[2]},${c.alpha * 0.3})`)
        grad.addColorStop(1, `rgba(255,255,255,${c.alpha * 0.8})`)
        ctx.strokeStyle = grad
        ctx.lineWidth = 2
        ctx.beginPath()
        ctx.moveTo(tailX, tailY)
        ctx.lineTo(c.x, c.y)
        ctx.stroke()

        // 彗星头发光
        ctx.beginPath()
        ctx.arc(c.x, c.y, 3, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(255,255,255,${c.alpha * 0.6})`
        ctx.fill()
        ctx.beginPath()
        ctx.arc(c.x, c.y, 8, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(${rgb[0]},${rgb[1]},${rgb[2]},${c.alpha * 0.15})`
        ctx.fill()
        return true
      })

      // ===== 6. 底部霓虹网格 =====
      if (isPlaying) {
        const gridY = h * 0.82
        const gridH = h * 0.25
        const vanishX = w * 0.5
        const vanishY = gridY
        const rgb = c0
        const gridAlpha = 0.04 + intensity * 0.08

        // 水平线（透视）
        for (let i = 0; i < 10; i++) {
          const ratio = i / 10
          const y = vanishY + ratio * ratio * gridH
          const spread = ratio * w * 0.8
          ctx.beginPath()
          ctx.moveTo(vanishX - spread, y)
          ctx.lineTo(vanishX + spread, y)
          ctx.strokeStyle = `rgba(${rgb[0]},${rgb[1]},${rgb[2]},${gridAlpha * (1 - ratio * 0.5)})`
          ctx.lineWidth = 0.8
          ctx.stroke()
        }

        // 垂直线（透视）
        const vLines = 20
        for (let i = -vLines / 2; i <= vLines / 2; i++) {
          const bottomX = vanishX + (i / (vLines / 2)) * w * 0.4
          ctx.beginPath()
          ctx.moveTo(vanishX, vanishY)
          ctx.lineTo(bottomX, vanishY + gridH)
          ctx.strokeStyle = `rgba(${rgb[0]},${rgb[1]},${rgb[2]},${gridAlpha * 0.7})`
          ctx.lineWidth = 0.6
          ctx.stroke()
        }

        // 地平线发光
        const horizonGrad = ctx.createLinearGradient(0, gridY - 30, 0, gridY + 30)
        horizonGrad.addColorStop(0, `rgba(${rgb[0]},${rgb[1]},${rgb[2]},0)`)
        horizonGrad.addColorStop(0.5, `rgba(${rgb[0]},${rgb[1]},${rgb[2]},${gridAlpha * 1.5})`)
        horizonGrad.addColorStop(1, `rgba(${rgb[0]},${rgb[1]},${rgb[2]},0)`)
        ctx.fillStyle = horizonGrad
        ctx.fillRect(0, gridY - 30, w, 60)
      }

      rafRef.current = requestAnimationFrame(draw)
    }
    rafRef.current = requestAnimationFrame(draw)

    return () => {
      cancelAnimationFrame(rafRef.current)
      window.removeEventListener('resize', resize)
    }
    // intensity 通过 ref 读取，避免每帧重建整个特效
  }, [colors, isPlaying])

  return (
    <div className="fixed inset-0 -z-10 overflow-hidden">
      {/* 流动渐变底色 */}
      <div
        className="gradient-flow absolute inset-0"
        style={
          {
            '--bg-color-1': colors[0],
            '--bg-color-2': colors[1],
            '--bg-color-3': colors[2],
          } as React.CSSProperties
        }
      />

      {/* 大光斑 1 */}
      <div
        className="absolute rounded-full blur-3xl"
        style={{
          width: '60vw',
          height: '60vw',
          left: '-10vw',
          top: '-20vw',
          background: `radial-gradient(circle, ${colors[0]}55 0%, transparent 70%)`,
          animation: 'float 12s ease-in-out infinite',
        }}
      />

      {/* 大光斑 2 */}
      <div
        className="absolute rounded-full blur-3xl"
        style={{
          width: '50vw',
          height: '50vw',
          right: '-15vw',
          bottom: '-15vw',
          background: `radial-gradient(circle, ${colors[1]}44 0%, transparent 70%)`,
          animation: 'float 16s ease-in-out infinite reverse',
        }}
      />

      {/* 呼吸光晕 */}
      <div
        className="absolute left-1/2 top-1/2 rounded-full blur-3xl"
        style={{
          width: '40vw',
          height: '40vw',
          transform: 'translate(-50%, -50%)',
          background: `radial-gradient(circle, ${colors[0]}33 0%, transparent 60%)`,
          opacity: isPlaying ? 1 : 0.3,
          transition: 'opacity 1s ease',
          animation: isPlaying ? 'breathe 4s ease-in-out infinite' : 'none',
        }}
      />

      {/* Canvas 特效层 */}
      <canvas ref={canvasRef} className="absolute inset-0" />

      {/* 扫描线（CRT 质感） */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage:
            'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.4) 2px, rgba(0,0,0,0.4) 4px)',
        }}
      />

      {/* 暗角 vignette */}
      <div
        className="absolute inset-0"
        style={{
          background:
            'radial-gradient(ellipse at center, transparent 30%, rgba(0,0,0,0.65) 100%)',
        }}
      />
    </div>
  )
}

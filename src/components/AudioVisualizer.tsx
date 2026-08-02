import { useEffect, useRef } from 'react'

interface AudioVisualizerProps {
  analyser: AnalyserNode | null
  isPlaying: boolean
  accent?: string
}

/**
 * �环绕唱片频谱可视化
 * - 从 AnalyserNode 取频率数据
 * - 围绕圆形绘制对称频谱柱
 */
export default function AudioVisualizer({
  analyser,
  isPlaying,
  accent = '#a855f7',
}: AudioVisualizerProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const rafRef = useRef<number>(0)
  const dataRef = useRef<Uint8Array<ArrayBuffer> | null>(null)

  useEffect(() => {
    if (analyser) {
      dataRef.current = new Uint8Array(analyser.frequencyBinCount) as Uint8Array<ArrayBuffer>
    }
  }, [analyser])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')!

    const resize = () => {
      const dpr = window.devicePixelRatio || 1
      const size = canvas.clientWidth
      canvas.width = size * dpr
      canvas.height = size * dpr
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    }
    resize()
    window.addEventListener('resize', resize)

    const draw = () => {
      const w = canvas.clientWidth
      const h = canvas.clientHeight
      const cx = w / 2
      const cy = h / 2
      ctx.clearRect(0, 0, w, h)

      const analyserNode = analyser
      const data = dataRef.current
      if (analyserNode && data) {
        analyserNode.getByteFrequencyData(data)
      }

      const bars = 72
      const baseRadius = Math.min(w, h) * 0.46
      const maxLen = Math.min(w, h) * 0.06

      for (let i = 0; i < bars; i++) {
        const dataIdx = Math.floor((i / bars) * (data ? data.length * 0.7 : 1))
        const v = data ? data[dataIdx] / 255 : 0
        const len = isPlaying ? 4 + v * maxLen : 3
        const angle = (i / bars) * Math.PI * 2 - Math.PI / 2

        const x1 = cx + Math.cos(angle) * baseRadius
        const y1 = cy + Math.sin(angle) * baseRadius
        const x2 = cx + Math.cos(angle) * (baseRadius + len)
        const y2 = cy + Math.sin(angle) * (baseRadius + len)

        const grad = ctx.createLinearGradient(x1, y1, x2, y2)
        grad.addColorStop(0, accent + 'cc')
        grad.addColorStop(1, accent + '11')
        ctx.strokeStyle = grad
        ctx.lineWidth = 2.5
        ctx.lineCap = 'round'
        ctx.beginPath()
        ctx.moveTo(x1, y1)
        ctx.lineTo(x2, y2)
        ctx.stroke()
      }

      rafRef.current = requestAnimationFrame(draw)
    }
    rafRef.current = requestAnimationFrame(draw)

    return () => {
      cancelAnimationFrame(rafRef.current)
      window.removeEventListener('resize', resize)
    }
  }, [analyser, isPlaying, accent])

  return (
    <canvas
      ref={canvasRef}
      className="pointer-events-none absolute inset-0 h-full w-full"
      style={{ filter: `drop-shadow(0 0 6px ${accent}66)` }}
    />
  )
}

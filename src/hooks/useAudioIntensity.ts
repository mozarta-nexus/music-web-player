import { useEffect, useRef, useState } from 'react'
import { prefersReducedMotion } from '../utils/motion'

/**
 * 从 AnalyserNode 实时读取音乐强度（0-1）
 * 用于驱动唱片轻微动态效果
 */
export function useAudioIntensity(analyser: AnalyserNode | null, isPlaying: boolean) {
  const [intensity, setIntensity] = useState(0)
  const dataRef = useRef<Uint8Array<ArrayBuffer> | null>(null)
  const rafRef = useRef<number>(0)
  const smoothRef = useRef(0)
  const lastEmitRef = useRef(0)
  const lastValueRef = useRef(0)

  useEffect(() => {
    if (!analyser) return
    dataRef.current = new Uint8Array(analyser.frequencyBinCount) as Uint8Array<ArrayBuffer>
  }, [analyser])

  useEffect(() => {
    if (prefersReducedMotion()) return

    const tick = () => {
      const data = dataRef.current
      const node = analyser
      if (node && data && isPlaying) {
        node.getByteFrequencyData(data)
        let sum = 0
        const n = Math.min(data.length, 64)
        for (let i = 0; i < n; i++) sum += data[i]
        const avg = sum / n / 255
        smoothRef.current += (avg - smoothRef.current) * 0.15
      } else {
        smoothRef.current *= 0.9
      }

      // 限频 + 阈值：避免每帧触发 React 重渲染
      const now = performance.now()
      if (
        now - lastEmitRef.current >= 80 &&
        Math.abs(smoothRef.current - lastValueRef.current) >= 0.004
      ) {
        lastEmitRef.current = now
        lastValueRef.current = smoothRef.current
        setIntensity(smoothRef.current)
      }
      rafRef.current = requestAnimationFrame(tick)
    }
    rafRef.current = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(rafRef.current)
  }, [analyser, isPlaying])

  return intensity
}

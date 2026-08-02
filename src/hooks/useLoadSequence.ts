import { useEffect, useState } from 'react'

export type LoadStage = 'hidden' | 'bg' | 'vinyl' | 'tonearm' | 'done'

/**
 * 入场动画时序控制
 * hidden → bg → vinyl → tonearm → done
 */
export function useLoadSequence() {
  const [stage, setStage] = useState<LoadStage>('hidden')

  useEffect(() => {
    const timers: number[] = []
    timers.push(window.setTimeout(() => setStage('bg'), 200))
    timers.push(window.setTimeout(() => setStage('vinyl'), 900))
    timers.push(window.setTimeout(() => setStage('tonearm'), 2100))
    timers.push(window.setTimeout(() => setStage('done'), 3300))
    return () => timers.forEach(clearTimeout)
  }, [])

  return stage
}

import { useCallback, useEffect, useRef, useState } from 'react'
import type { PlayMode, Song } from '../types'

interface UseAudioPlayerOptions {
  songs: Song[]
  autoplay?: boolean
}

export function useAudioPlayer({ songs, autoplay = false }: UseAudioPlayerOptions) {
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const audioCtxRef = useRef<AudioContext | null>(null)
  const analyserRef = useRef<AnalyserNode | null>(null)
  const sourceNodeRef = useRef<MediaElementAudioSourceNode | null>(null)
  const gainRef = useRef<GainNode | null>(null)
  const pendingPlayRef = useRef(false)
  const playRef = useRef<() => Promise<void>>(async () => {})

  const [currentIndex, setCurrentIndex] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [volume, setVolume] = useState(0.75)
  const [muted, setMuted] = useState(false)
  const [playMode, setPlayMode] = useState<PlayMode>('order')
  const [ready, setReady] = useState(false)
  const [analyser, setAnalyser] = useState<AnalyserNode | null>(null)

  const handleEndedRef = useRef<() => void>(() => {})

  const currentSong = songs[currentIndex] ?? null

  /* ---------- 初始化 Audio 元素与 Web Audio 图 ---------- */
  useEffect(() => {
    const audio = new Audio()
    audio.preload = 'auto'
    audio.crossOrigin = 'anonymous'
    audio.volume = volume
    audioRef.current = audio

    const onLoaded = () => {
      setDuration(audio.duration || 0)
      setReady(true)
    }
    const onTime = () => setCurrentTime(audio.currentTime)
    const onEnd = () => handleEndedRef.current()
    const onPlay = () => setIsPlaying(true)
    const onPause = () => setIsPlaying(false)
    const onError = () => {
      // 加载失败时清除待播放标记，避免状态卡死
      pendingPlayRef.current = false
      console.warn('音频加载失败:', audio.src)
    }
    // 切歌后由 canplay 统一触发播放，避免重复监听
    const onCanPlay = () => {
      if (pendingPlayRef.current) {
        pendingPlayRef.current = false
        playRef.current()
      }
    }

    audio.addEventListener('loadedmetadata', onLoaded)
    audio.addEventListener('timeupdate', onTime)
    audio.addEventListener('ended', onEnd)
    audio.addEventListener('play', onPlay)
    audio.addEventListener('pause', onPause)
    audio.addEventListener('error', onError)
    audio.addEventListener('canplay', onCanPlay)

    return () => {
      audio.removeEventListener('loadedmetadata', onLoaded)
      audio.removeEventListener('timeupdate', onTime)
      audio.removeEventListener('ended', onEnd)
      audio.removeEventListener('play', onPlay)
      audio.removeEventListener('pause', onPause)
      audio.removeEventListener('error', onError)
      audio.removeEventListener('canplay', onCanPlay)
      audio.pause()
      audio.src = ''
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  /* ---------- 建立 AnalyserNode（用户交互后才能启动 AudioContext） ---------- */
  const ensureAudioGraph = useCallback(() => {
    if (!audioRef.current || analyserRef.current) return
    try {
      const Ctx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext
      const ctx = new Ctx()
      const source = ctx.createMediaElementSource(audioRef.current)
      const analyserNode = ctx.createAnalyser()
      const gain = ctx.createGain()
      analyserNode.fftSize = 256
      analyserNode.smoothingTimeConstant = 0.8
      gain.gain.value = volume
      // 路由到 Web Audio 后音量只由 GainNode 控制，避免双重衰减
      audioRef.current.volume = 1

      source.connect(analyserNode)
      analyserNode.connect(gain)
      gain.connect(ctx.destination)

      audioCtxRef.current = ctx
      analyserRef.current = analyserNode
      sourceNodeRef.current = source
      gainRef.current = gain
      setAnalyser(analyserNode)
    } catch (e) {
      console.warn('Web Audio graph init failed', e)
    }
  }, [volume])

  /* ---------- 加载歌曲 ---------- */
  useEffect(() => {
    const audio = audioRef.current
    if (!audio || !currentSong) return
    setReady(false)
    setCurrentTime(0)
    audio.src = currentSong.src
    audio.load()
  }, [currentIndex, currentSong])

  /* ---------- 音量同步 ---------- */
  useEffect(() => {
    const target = muted ? 0 : volume
    if (gainRef.current && audioCtxRef.current) {
      gainRef.current.gain.setTargetAtTime(target, audioCtxRef.current.currentTime, 0.01)
      if (audioRef.current) audioRef.current.volume = 1
    } else if (audioRef.current) {
      audioRef.current.volume = target
    }
  }, [volume, muted])

  /* ---------- 播放控制 ---------- */
  const play = useCallback(async () => {
    ensureAudioGraph()
    if (audioCtxRef.current?.state === 'suspended') {
      await audioCtxRef.current.resume()
    }
    try {
      await audioRef.current?.play()
    } catch (e) {
      console.warn('play failed', e)
    }
  }, [ensureAudioGraph])

  // 供 canplay 监听器读取最新的 play
  useEffect(() => {
    playRef.current = play
  }, [play])

  const pause = useCallback(() => {
    audioRef.current?.pause()
  }, [])

  const toggle = useCallback(() => {
    if (isPlaying) pause()
    else play()
  }, [isPlaying, play, pause])

  const seek = useCallback((time: number) => {
    if (audioRef.current) {
      audioRef.current.currentTime = time
      setCurrentTime(time)
    }
  }, [])

  /* ---------- 切歌 ---------- */
  const playIndex = useCallback(
    (index: number) => {
      const next = ((index % songs.length) + songs.length) % songs.length
      setCurrentIndex(next)
      // 标记待播放，等当前歌曲 canplay 后统一触发
      pendingPlayRef.current = true
    },
    [songs.length],
  )

  const next = useCallback(() => {
    if (playMode === 'shuffle') {
      let r = currentIndex
      while (r === currentIndex && songs.length > 1) {
        r = Math.floor(Math.random() * songs.length)
      }
      playIndex(r)
    } else {
      playIndex(currentIndex + 1)
    }
  }, [playMode, currentIndex, songs.length, playIndex])

  const prev = useCallback(() => {
    if (currentTime > 3) {
      seek(0)
      return
    }
    playIndex(currentIndex - 1)
  }, [currentTime, currentIndex, playIndex, seek])

  const handleEnded = useCallback(() => {
    if (playMode === 'loop-one') {
      seek(0)
      play()
    } else if (playMode === 'loop-all' || currentIndex < songs.length - 1) {
      next()
    } else {
      setIsPlaying(false)
    }
  }, [playMode, currentIndex, songs.length, next, seek, play])

  useEffect(() => {
    handleEndedRef.current = handleEnded
  })

  /* ---------- 模式切换 ---------- */
  const cyclePlayMode = useCallback(() => {
    setPlayMode((m) =>
      m === 'order' ? 'loop-all' : m === 'loop-all' ? 'loop-one' : m === 'loop-one' ? 'shuffle' : 'order',
    )
  }, [])

  /* ---------- 自动播放 ---------- */
  useEffect(() => {
    if (autoplay && ready) {
      play()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ready])

  return {
    currentSong,
    currentIndex,
    isPlaying,
    currentTime,
    duration,
    volume,
    muted,
    playMode,
    ready,
    analyser,
    setVolume,
    setMuted,
    play,
    pause,
    toggle,
    seek,
    next,
    prev,
    playIndex,
    cyclePlayMode,
  }
}

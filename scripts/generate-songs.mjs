// 生成 SVG 封面 + songs.ts
import { readdirSync, readFileSync, writeFileSync, existsSync, unlinkSync, mkdirSync } from 'node:fs'
import { join } from 'node:path'

const BITRATES = [0, 32, 40, 48, 56, 64, 80, 96, 112, 128, 160, 192, 224, 256, 320, 0]
const SRATES = [44100, 48000, 32000, 0]

function estimateDuration(filepath) {
  try {
    const buf = readFileSync(filepath)
    let offset = 0
    if (buf[0] === 0x49 && buf[1] === 0x44 && buf[2] === 0x33) {
      const size = (buf[6] & 0x7f) * 0x200000 + (buf[7] & 0x7f) * 0x4000 + (buf[8] & 0x7f) * 0x80 + (buf[9] & 0x7f)
      offset = 10 + size
    }
    let bitrate = 128000
    let sampleRate = 44100
    let frameLen = 0
    let frames = 0
    let pos = offset
    const limit = Math.min(buf.length, 200000)
    while (pos < limit - 4) {
      if (buf[pos] === 0xff && (buf[pos + 1] & 0xe0) === 0xe0) {
        const ver = (buf[pos + 1] >> 3) & 0x03
        const layer = (buf[pos + 1] >> 1) & 0x03
        const brIdx = (buf[pos + 2] >> 4) & 0x0f
        const srIdx = (buf[pos + 2] >> 2) & 0x03
        const pad = (buf[pos + 2] >> 1) & 0x01
        if (brIdx === 0 || brIdx === 15) { pos++; continue }
        const br = BITRATES[brIdx] * 1000
        const sr = SRATES[srIdx]
        if (sr === 0) { pos++; continue }
        bitrate = br
        sampleRate = sr
        if (layer === 1) frameLen = Math.floor((12 * br) / sr + pad) * 4
        else frameLen = Math.floor((144 * br) / sr + pad)
        if (frameLen <= 0) { pos++; continue }
        frames++
        pos += frameLen
        if (frames >= 50) break
      } else {
        pos++
      }
    }
    if (frames > 0 && bitrate > 0) {
      const audioBytes = buf.length - offset
      return Math.round((audioBytes * 8) / bitrate)
    }
    return 0
  } catch {
    return 0
  }
}

const audioDir = join(process.cwd(), 'public', 'audio')
const coverDir = join(process.cwd(), 'public', 'covers')
const songsFile = join(process.cwd(), 'src', 'data', 'songs.ts')

const palettes = [
  ['#a855f7', '#1a0b2e'],
  ['#22d3ee', '#0c4a6e'],
  ['#ec4899', '#831843'],
  ['#3b82f6', '#1e3a8a'],
  ['#f59e0b', '#7c2d12'],
  ['#10b981', '#064e3b'],
  ['#8b5cf6', '#4c1d95'],
  ['#f43f5e', '#881337'],
  ['#06b6d4', '#155e75'],
  ['#eab308', '#713f12'],
  ['#d946ef', '#701a75'],
  ['#14b8a6', '#134e4a'],
]

function hash(str) {
  let h = 0
  for (let i = 0; i < str.length; i++) h = (h * 31 + str.charCodeAt(i)) >>> 0
  return h
}

// 读取并去重
let files = readdirSync(audioDir).filter((f) => f.endsWith('.mp3'))
const dupes = files.filter((f) => /\s\(1\)\.mp3$/.test(f))
dupes.forEach((f) => unlinkSync(join(audioDir, f)))
files = files.filter((f) => !/\s\(1\)\.mp3$/.test(f)).sort()

function parseName(filename) {
  const base = filename.replace(/\.mp3$/, '')
  const idx = base.indexOf('-')
  if (idx === -1) return { title: base, artist: '未知艺术家' }
  return { title: base.slice(0, idx).trim(), artist: base.slice(idx + 1).trim() }
}

function makeCover(id, title, c1, c2) {
  const letter = (title.trim()[0] || '♪').toUpperCase()
  const rings = [0.46, 0.42, 0.38, 0.34, 0.3, 0.26].map(
    (r, i) =>
      `<circle cx="300" cy="300" r="${r * 600}" fill="none" stroke="rgba(255,255,255,${0.06 + i * 0.01})" stroke-width="1.5"/>`,
  ).join('')
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 600">
  <defs>
    <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="${c1}"/>
      <stop offset="100%" stop-color="${c2}"/>
    </linearGradient>
    <radialGradient id="v" cx="50%" cy="50%" r="70%">
      <stop offset="60%" stop-color="transparent"/>
      <stop offset="100%" stop-color="rgba(0,0,0,0.5)"/>
    </radialGradient>
  </defs>
  <rect width="600" height="600" fill="url(#g)"/>
  ${rings}
  <circle cx="300" cy="300" r="150" fill="rgba(0,0,0,0.35)" stroke="rgba(255,255,255,0.15)" stroke-width="2"/>
  <text x="300" y="300" text-anchor="middle" dominant-baseline="central" font-family="Space Grotesk, sans-serif" font-size="150" font-weight="700" fill="rgba(255,255,255,0.92)">${escapeXml(letter)}</text>
  <rect width="600" height="600" fill="url(#v)"/>
</svg>`
}

function escapeXml(s) {
  return s.replace(/[<>&'"]/g, (c) => ({ '<': '&lt;', '>': '&gt;', '&': '&amp;', "'": '&apos;', '"': '&quot;' }[c]))
}

if (!existsSync(coverDir)) {
  import('node:fs').then(({ mkdirSync }) => mkdirSync(coverDir, { recursive: true }))
}

import('node:fs').then(({ mkdirSync }) => {
  if (!existsSync(coverDir)) mkdirSync(coverDir, { recursive: true })

  const songs = files.map((filename, i) => {
    const { title, artist } = parseName(filename)
    const id = String(i + 1)
    const h = hash(title + artist)
    const [c1, c2] = palettes[h % palettes.length]
    const svg = makeCover(id, title, c1, c2)
    writeFileSync(join(coverDir, `${id}.svg`), svg, 'utf8')
    const duration = estimateDuration(join(audioDir, filename))
    return {
      id,
      title,
      artist,
      album: '本地收藏',
      duration,
      cover: `covers/${id}.svg`,
      src: `audio/${encodeURI(filename)}`,
      colors: [c1, c2, '#050507'],
    }
  })

  const ts = `// 自动生成 - 请勿手动编辑
import type { Song } from '../types'

export const songs: Song[] = ${JSON.stringify(songs, null, 2)}
`
  writeFileSync(songsFile, ts, 'utf8')
  console.log(`已生成 ${songs.length} 首歌曲数据，${dupes.length} 个重复文件已删除`)
  console.log(`封面目录: public/covers/`)
  console.log(`数据文件: src/data/songs.ts`)
})

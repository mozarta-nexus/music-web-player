# music-web-player

沉浸式黑胶唱片风格 Web 音乐播放器，融合实时音频频谱可视化、动态粒子背景与赛博朋克视觉特效，打造极致 HiFi 视听体验。

## 在线体验

无需安装任何环境，直接打开：[https://mozarta-nexus.github.io/music-web-player/](https://mozarta-nexus.github.io/music-web-player/)

## 特性

- **黑胶唱片视觉模拟** — 纯 CSS 实现同心圆沟槽纹理、conic-gradient 反光光泽、中心封面旋转，播放时匀速旋转，暂停时缓慢减速停止
- **唱针机械动画** — 播放时唱针落下，暂停时抬起，带弹性缓动效果
- **实时音频频谱可视化** — Web Audio API AnalyserNode 获取频率数据，环绕唱片绘制 72 根对称频谱柱
- **动态粒子背景** — Canvas 多层视觉效果：极光带、星尘粒子（带拖尾）、脉冲波纹、光线射线、流星/彗星、底部霓虹透视网格
- **主题色动态切换** — 每首歌携带 3 个主题色，切换时背景、光晕、按钮等 UI 元素颜色随之变化
- **完整播放控制** — 播放/暂停、上一首/下一首、进度条拖动、音量控制、静音切换
- **四种播放模式** — 顺序播放、列表循环、单曲循环、随机播放
- **响应式播放列表** — 桌面端常驻右侧，移动端以抽屉形式滑出
- **入场动画序列** — 加载时依次展示背景 → 唱片 → 唱针 → 完成，带遮罩过渡

## 技术栈

| 类别 | 技术 |
|------|------|
| 框架 | React 18 |
| 语言 | TypeScript |
| 构建 | Vite 5 |
| 样式 | Tailwind CSS 3.4 + PostCSS |
| 音频 | Web Audio API |
| 规范 | ESLint 9 |

## 快速开始

### 环境要求

- Node.js >= 18
- npm >= 9

### 安装与运行

```bash
# 克隆仓库
git clone https://github.com/mozarta-nexus/music-web-player.git
cd music-web-player

# 安装依赖
npm install

# 启动开发服务器
npm run dev
```

浏览器将自动打开 `http://localhost:5173`。

### 构建生产版本

```bash
npm run build
```

产物输出到 `dist/` 目录。

### 预览生产版本

```bash
npm run preview
```

## 项目结构

```
├── public/
│   ├── audio/          # MP3 音频文件
│   └── covers/         # SVG 封面图
├── scripts/
│   └── generate-songs.mjs  # 歌曲数据自动生成脚本
└── src/
    ├── main.tsx            # React 入口
    ├── App.tsx             # 主应用组件
    ├── types/index.ts      # 类型定义
    ├── data/songs.ts       # 歌曲数据
    ├── utils/format.ts     # 工具函数
    ├── hooks/
    │   ├── useAudioPlayer.ts      # 核心音频播放器 Hook
    │   ├── useAudioIntensity.ts   # 实时音乐强度 Hook
    │   └── useLoadSequence.ts     # 入场动画时序 Hook
    └── components/
        ├── VinylRecord.tsx        # 黑胶唱片视觉组件
        ├── Tonearm.tsx            # 唱针组件
        ├── AudioVisualizer.tsx    # 频谱可视化
        ├── DynamicBackground.tsx  # 动态粒子背景
        ├── PlayerControls.tsx     # 播放控制按钮组
        ├── ProgressBar.tsx        # 进度条
        ├── VolumeControl.tsx      # 音量控制
        ├── SongInfo.tsx           # 歌曲信息
        └── Playlist.tsx           # 播放列表
```

## 添加自定义音乐

1. 将 MP3 文件放入 `public/audio/` 目录
2. 运行生成脚本：

```bash
node scripts/generate-songs.mjs
```

脚本会自动扫描 MP3 文件、解析时长、生成 SVG 封面和 `src/data/songs.ts` 数据文件。

## 开源协议

本项目采用 [MIT](LICENSE) 协议开源，Copyright © 2026 莫扎他。

## 贡献

欢迎贡献！请阅读 [CONTRIBUTING.md](CONTRIBUTING.md) 了解详情。

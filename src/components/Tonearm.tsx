interface TonearmProps {
  isPlaying: boolean
  entered?: boolean
  accent?: string
}

/**
 * 唱针组件
 * - 悬浮在唱片右上方
 * - 播放时落下（旋转到唱片上）
 * - 暂停时抬起
 * - 机械动画效果
 */
export default function Tonearm({ isPlaying, entered = true, accent = '#a855f7' }: TonearmProps) {
  return (
    <div
      className="pointer-events-none absolute right-[8%] top-[2%] z-20"
      style={{
        width: '42%',
        height: '42%',
        opacity: entered ? 1 : 0,
        transform: entered ? 'translateY(0)' : 'translateY(-20px)',
        transition: 'opacity 1s ease 0.6s, transform 1s ease 0.6s',
      }}
    >
      {/* 唱针整体绕底座旋转 */}
      <div
        className={isPlaying ? 'tonearm-down' : 'tonearm-up'}
        style={{ transformOrigin: '88% 88%' }}
      >
        {/* 底座 */}
        <div
          className="absolute rounded-full"
          style={{
            right: '6%',
            bottom: '6%',
            width: '18%',
            height: '18%',
            background:
              'radial-gradient(circle at 35% 35%, #4a4a52 0%, #2a2a30 40%, #1a1a1f 100%)',
            boxShadow:
              '0 4px 12px rgba(0,0,0,0.8), inset 0 1px 2px rgba(255,255,255,0.2), 0 0 20px rgba(168,85,247,0.2)',
          }}
        >
          {/* 底座中心装饰 */}
          <div
            className="absolute left-1/2 top-1/2 rounded-full"
            style={{
              width: '40%',
              height: '40%',
              transform: 'translate(-50%, -50%)',
              background: `radial-gradient(circle, ${accent} 0%, #6d28d9 100%)`,
              boxShadow: `0 0 12px ${accent}`,
            }}
          />
        </div>

        {/* 臂杆 */}
        <div
          className="absolute"
          style={{
            right: '14%',
            bottom: '14%',
            width: '78%',
            height: '5%',
            transformOrigin: '100% 50%',
            transform: 'rotate(-32deg)',
            background:
              'linear-gradient(180deg, #6a6a72 0%, #3a3a42 50%, #1a1a1f 100%)',
            borderRadius: '999px',
            boxShadow:
              '0 2px 6px rgba(0,0,0,0.6), inset 0 1px 1px rgba(255,255,255,0.25)',
          }}
        >
          {/* 臂杆高光 */}
          <div
            className="absolute inset-x-0 top-0 h-1/2 rounded-t-full"
            style={{
              background:
                'linear-gradient(180deg, rgba(255,255,255,0.3), transparent)',
            }}
          />
        </div>

        {/* 唱针头（前端） */}
        <div
          className="absolute"
          style={{
            right: '82%',
            bottom: '30%',
            width: '14%',
            height: '14%',
            transform: 'rotate(-32deg)',
            background:
              'radial-gradient(circle at 40% 30%, #5a5a62 0%, #2a2a30 60%, #0a0a0c 100%)',
            borderRadius: '30% 30% 50% 50%',
            boxShadow:
              '0 3px 8px rgba(0,0,0,0.8), inset 0 1px 2px rgba(255,255,255,0.2)',
          }}
        >
          {/* 针尖发光 */}
          <div
            className="absolute rounded-full"
            style={{
              left: '20%',
              bottom: '0%',
              width: '30%',
              height: '30%',
              background: `radial-gradient(circle, ${accent} 0%, transparent 70%)`,
              boxShadow: `0 0 ${isPlaying ? 10 : 8}px ${accent}`,
              transition: 'all 0.4s ease',
            }}
          />
        </div>
      </div>

      {/* 底座投影 */}
      <div
        className="absolute rounded-full blur-md"
        style={{
          right: '4%',
          bottom: '4%',
          width: '22%',
          height: '8%',
          background: 'rgba(0,0,0,0.6)',
        }}
      />
    </div>
  )
}

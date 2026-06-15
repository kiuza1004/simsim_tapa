import { useEffect, useRef, useState } from 'react'

const GRID = 9
const ROUND_SEC = 30

type Phase = 'idle' | 'playing' | 'done'

export default function WhackAMole() {
  const [phase, setPhase] = useState<Phase>('idle')
  const [score, setScore] = useState(0)
  const [time, setTime] = useState(ROUND_SEC)
  const [active, setActive] = useState<number | null>(null)
  const [hit, setHit] = useState<number | null>(null)
  const [best, setBest] = useState<number>(() => {
    const v = localStorage.getItem('whack-best')
    return v ? Number(v) : 0
  })

  const tickRef = useRef<number | null>(null)
  const moleRef = useRef<number | null>(null)
  const hitFxRef = useRef<number | null>(null)

  const clearTimers = () => {
    if (tickRef.current) clearInterval(tickRef.current)
    if (moleRef.current) clearTimeout(moleRef.current)
    if (hitFxRef.current) clearTimeout(hitFxRef.current)
  }

  useEffect(() => () => clearTimers(), [])

  const spawn = () => {
    setActive((prev) => {
      let next = Math.floor(Math.random() * GRID)
      if (prev !== null && next === prev) next = (next + 1) % GRID
      return next
    })
    const life = 600 + Math.random() * 500
    moleRef.current = window.setTimeout(spawn, life)
  }

  const start = () => {
    clearTimers()
    setScore(0)
    setTime(ROUND_SEC)
    setActive(null)
    setHit(null)
    setPhase('playing')
    tickRef.current = window.setInterval(() => {
      setTime((t) => {
        if (t <= 1) {
          clearTimers()
          setActive(null)
          setPhase('done')
          setBest((b) => {
            const finalScore = scoreRef.current
            if (finalScore > b) {
              localStorage.setItem('whack-best', String(finalScore))
              return finalScore
            }
            return b
          })
          return 0
        }
        return t - 1
      })
    }, 1000)
    moleRef.current = window.setTimeout(spawn, 400)
  }

  const scoreRef = useRef(0)
  useEffect(() => { scoreRef.current = score }, [score])

  const whack = (i: number) => {
    if (phase !== 'playing') return
    if (i !== active) {
      setScore((s) => Math.max(0, s - 1))
      return
    }
    setScore((s) => s + 1)
    setHit(i)
    setActive(null)
    if (hitFxRef.current) clearTimeout(hitFxRef.current)
    hitFxRef.current = window.setTimeout(() => setHit(null), 180)
  }

  return (
    <div className="flex flex-col items-center">
      <h1 className="text-3xl font-bold mb-2">🔨 두더지 잡기</h1>
      <p className="text-zinc-400 mb-2">올라온 두더지를 30초 안에 최대한 많이 잡으세요</p>
      <p className="text-xs text-zinc-500 mb-6">빈 칸을 누르면 -1점</p>

      <div className="flex gap-6 mb-6 text-sm">
        <span className="text-zinc-400">⏱ <span className="text-white font-bold">{time}s</span></span>
        <span className="text-zinc-400">🎯 <span className="text-white font-bold">{score}</span></span>
        <span className="text-zinc-400">🏆 <span className="text-rose-300 font-bold">{best}</span></span>
      </div>

      <div className="grid grid-cols-3 gap-3 sm:gap-4 mb-6">
        {Array.from({ length: GRID }).map((_, i) => {
          const isUp = active === i
          const isHit = hit === i
          return (
            <button
              key={i}
              onClick={() => whack(i)}
              disabled={phase !== 'playing'}
              className={`w-24 h-24 sm:w-28 sm:h-28 rounded-2xl border-2 text-5xl sm:text-6xl flex items-center justify-center transition-transform select-none ${
                isHit
                  ? 'bg-amber-500/30 border-amber-300 scale-95'
                  : isUp
                  ? 'bg-rose-500/20 border-rose-400'
                  : 'bg-zinc-900 border-zinc-700 hover:border-rose-400/60'
              } ${phase !== 'playing' ? 'opacity-70' : ''}`}
            >
              {isHit ? '💥' : isUp ? '🐹' : ''}
            </button>
          )
        })}
      </div>

      {phase === 'done' && (
        <p className="mb-4 text-rose-300 font-bold text-lg">
          🎉 종료! 최종 {score}점
        </p>
      )}

      <button
        onClick={start}
        className="px-6 py-2 rounded-full bg-rose-500 hover:bg-rose-400 font-bold text-white transition"
      >
        {phase === 'idle' ? '시작' : phase === 'playing' ? '재시작' : '다시 하기'}
      </button>
    </div>
  )
}

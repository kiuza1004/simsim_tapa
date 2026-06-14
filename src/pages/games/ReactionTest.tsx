import { useEffect, useRef, useState } from 'react'

type Phase = 'idle' | 'waiting' | 'go' | 'result' | 'early'

export default function ReactionTest() {
  const [phase, setPhase] = useState<Phase>('idle')
  const [ms, setMs] = useState(0)
  const [best, setBest] = useState<number | null>(() => {
    const v = localStorage.getItem('reaction-best')
    return v ? Number(v) : null
  })
  const startedAt = useRef(0)
  const timer = useRef<number | null>(null)

  useEffect(() => () => { if (timer.current) clearTimeout(timer.current) }, [])

  const begin = () => {
    setPhase('waiting')
    const delay = 1200 + Math.random() * 2800
    timer.current = window.setTimeout(() => {
      startedAt.current = performance.now()
      setPhase('go')
    }, delay)
  }

  const click = () => {
    if (phase === 'idle' || phase === 'result' || phase === 'early') {
      begin()
      return
    }
    if (phase === 'waiting') {
      if (timer.current) clearTimeout(timer.current)
      setPhase('early')
      return
    }
    if (phase === 'go') {
      const took = Math.round(performance.now() - startedAt.current)
      setMs(took)
      if (best === null || took < best) {
        setBest(took)
        localStorage.setItem('reaction-best', String(took))
      }
      setPhase('result')
    }
  }

  const bg =
    phase === 'go' ? 'bg-emerald-500' :
    phase === 'waiting' ? 'bg-rose-600' :
    phase === 'early' ? 'bg-orange-500' :
    'bg-zinc-800'

  const text =
    phase === 'idle' ? '클릭해서 시작' :
    phase === 'waiting' ? '초록불 기다리세요...' :
    phase === 'go' ? '지금 클릭!' :
    phase === 'early' ? '너무 빨라요! 다시 시도하려면 클릭' :
    `${ms} ms — 다시 하려면 클릭`

  return (
    <div className="flex flex-col items-center">
      <h1 className="text-3xl font-bold mb-2">⚡ 반응속도 테스트</h1>
      <p className="text-zinc-400 mb-2">
        빨강일 때 기다렸다가, <span className="text-emerald-300">초록불</span>이 되면 바로 클릭!
      </p>
      <p className="text-xs text-zinc-500 mb-6">
        평균 200~270ms · 200ms 미만이면 매우 빠른 편
      </p>

      <button
        onClick={click}
        className={`w-full max-w-xl h-72 sm:h-80 rounded-3xl ${bg} text-white text-2xl sm:text-3xl font-bold transition flex items-center justify-center px-6 text-center shadow-2xl`}
      >
        {text}
      </button>

      <div className="mt-6 flex gap-6 text-sm">
        <span className="text-zinc-400">
          최근: <span className="text-white font-bold">{ms ? `${ms}ms` : '-'}</span>
        </span>
        <span className="text-zinc-400">
          최고: <span className="text-emerald-300 font-bold">{best ? `${best}ms` : '-'}</span>
        </span>
      </div>
    </div>
  )
}

import { useEffect, useMemo, useState } from 'react'

const EMOJIS = ['🐶', '🐱', '🦊', '🐼', '🐸', '🦄', '🐙', '🦋']

type Card = {
  id: number
  emoji: string
  flipped: boolean
  matched: boolean
}

function shuffle<T>(arr: T[]): T[] {
  const a = arr.slice()
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

function makeDeck(): Card[] {
  return shuffle([...EMOJIS, ...EMOJIS]).map((emoji, id) => ({
    id,
    emoji,
    flipped: false,
    matched: false,
  }))
}

export default function MemoryMatch() {
  const [deck, setDeck] = useState<Card[]>(() => makeDeck())
  const [picked, setPicked] = useState<number[]>([])
  const [moves, setMoves] = useState(0)
  const [time, setTime] = useState(0)

  const cleared = useMemo(() => deck.every((c) => c.matched), [deck])

  useEffect(() => {
    if (cleared) return
    const id = setInterval(() => setTime((t) => t + 1), 1000)
    return () => clearInterval(id)
  }, [cleared])

  useEffect(() => {
    if (picked.length !== 2) return
    const [a, b] = picked
    setMoves((m) => m + 1)
    if (deck[a].emoji === deck[b].emoji) {
      setDeck((d) =>
        d.map((c, i) => (i === a || i === b ? { ...c, matched: true } : c))
      )
      setPicked([])
    } else {
      const t = setTimeout(() => {
        setDeck((d) =>
          d.map((c, i) => (i === a || i === b ? { ...c, flipped: false } : c))
        )
        setPicked([])
      }, 700)
      return () => clearTimeout(t)
    }
  }, [picked, deck])

  const flip = (i: number) => {
    if (picked.length >= 2) return
    if (deck[i].flipped || deck[i].matched) return
    setDeck((d) => d.map((c, idx) => (idx === i ? { ...c, flipped: true } : c)))
    setPicked((p) => [...p, i])
  }

  const reset = () => {
    setDeck(makeDeck())
    setPicked([])
    setMoves(0)
    setTime(0)
  }

  return (
    <div className="flex flex-col items-center">
      <h1 className="text-3xl font-bold mb-2">🧠 메모리 매칭</h1>
      <p className="text-zinc-400 mb-4">같은 그림 한 쌍을 모두 찾아보세요</p>
      <div className="flex gap-6 mb-6 text-sm">
        <span className="text-zinc-400">⏱ <span className="text-white font-bold">{time}s</span></span>
        <span className="text-zinc-400">🔄 <span className="text-white font-bold">{moves}회</span></span>
      </div>

      <div className="grid grid-cols-4 gap-2 sm:gap-3 mb-6">
        {deck.map((c, i) => {
          const show = c.flipped || c.matched
          return (
            <button
              key={c.id}
              onClick={() => flip(i)}
              disabled={show}
              className={`w-16 h-16 sm:w-20 sm:h-20 rounded-xl text-3xl sm:text-4xl font-bold transition border ${
                show
                  ? c.matched
                    ? 'bg-emerald-500/20 border-emerald-400 text-white'
                    : 'bg-amber-500/20 border-amber-400 text-white'
                  : 'bg-zinc-900 border-zinc-700 hover:border-amber-400'
              }`}
            >
              {show ? c.emoji : '?'}
            </button>
          )
        })}
      </div>

      {cleared && (
        <p className="mb-4 text-emerald-300 font-bold text-lg">
          🎉 클리어! {moves}회 / {time}초
        </p>
      )}

      <button
        onClick={reset}
        className="px-6 py-2 rounded-full bg-amber-500 hover:bg-amber-400 font-bold text-white transition"
      >
        새 게임
      </button>
    </div>
  )
}

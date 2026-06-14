import { Link } from 'react-router-dom'

type Card = {
  to: string
  emoji: string
  title: string
  subtitle: string
  bg: string
  border: string
}

const cards: Card[] = [
  {
    to: '/roulette',
    emoji: '🎲',
    title: '랜덤 액티비티 룰렛',
    subtitle: '뭐 할지 모를 때, 한 번 돌려보세요',
    bg: 'from-violet-500/20 to-fuchsia-500/10',
    border: 'border-violet-400/30 hover:border-violet-400',
  },
  {
    to: '/games',
    emoji: '🎮',
    title: '미니게임 모음',
    subtitle: '가볍게 즐기는 3가지 게임',
    bg: 'from-emerald-500/20 to-cyan-500/10',
    border: 'border-emerald-400/30 hover:border-emerald-400',
  },
]

export default function Home() {
  return (
    <div className="flex flex-col items-center text-center">
      <h1 className="text-4xl sm:text-5xl font-bold mt-8 mb-3">
        오늘도 <span className="text-violet-400">심심</span>해?
      </h1>
      <p className="text-zinc-400 mb-12 max-w-md">
        뭐 할지 골라줄게. 클릭만 해.
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 w-full max-w-3xl">
        {cards.map((c) => (
          <Link
            key={c.to}
            to={c.to}
            className={`group relative overflow-hidden rounded-2xl border bg-gradient-to-br ${c.bg} ${c.border} p-8 text-left transition hover:scale-[1.02] hover:shadow-xl`}
          >
            <div className="text-5xl mb-4">{c.emoji}</div>
            <h2 className="text-2xl font-bold mb-1 text-white">{c.title}</h2>
            <p className="text-zinc-300 text-sm">{c.subtitle}</p>
            <span className="absolute bottom-4 right-5 text-zinc-300 group-hover:translate-x-1 transition">
              →
            </span>
          </Link>
        ))}
      </div>
    </div>
  )
}

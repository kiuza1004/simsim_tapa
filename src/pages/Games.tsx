import { Link } from 'react-router-dom'

const games = [
  {
    to: '/games/tictactoe',
    emoji: '⭕',
    title: '틱택토',
    desc: 'AI와 대결하는 클래식 3목',
    color: 'border-sky-400/30 hover:border-sky-400',
  },
  {
    to: '/games/memory',
    emoji: '🧠',
    title: '메모리 매칭',
    desc: '같은 카드 한 쌍 찾기',
    color: 'border-amber-400/30 hover:border-amber-400',
  },
  {
    to: '/games/reaction',
    emoji: '⚡',
    title: '반응속도 테스트',
    desc: '초록불 켜지면 빨리 클릭',
    color: 'border-emerald-400/30 hover:border-emerald-400',
  },
  {
    to: '/games/whack',
    emoji: '🔨',
    title: '두더지 잡기',
    desc: '30초 안에 두더지 최대한 잡기',
    color: 'border-rose-400/30 hover:border-rose-400',
  },
]

export default function Games() {
  return (
    <div className="flex flex-col items-center">
      <h1 className="text-3xl font-bold mb-2">🎮 미니게임 모음</h1>
      <p className="text-zinc-400 mb-8">짧고 가벼운 게임으로 시간 보내기</p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full">
        {games.map((g) => (
          <Link
            key={g.to}
            to={g.to}
            className={`rounded-2xl border ${g.color} bg-zinc-900/60 p-6 transition hover:scale-[1.02]`}
          >
            <div className="text-4xl mb-3">{g.emoji}</div>
            <h2 className="text-xl font-bold text-white mb-1">{g.title}</h2>
            <p className="text-sm text-zinc-400">{g.desc}</p>
          </Link>
        ))}
      </div>
    </div>
  )
}

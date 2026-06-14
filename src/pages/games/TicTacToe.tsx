import { useEffect, useState } from 'react'

type Cell = 'X' | 'O' | null
type Board = Cell[]

const LINES = [
  [0, 1, 2], [3, 4, 5], [6, 7, 8],
  [0, 3, 6], [1, 4, 7], [2, 5, 8],
  [0, 4, 8], [2, 4, 6],
]

function winner(b: Board): Cell | 'draw' | null {
  for (const [a, c, d] of LINES) {
    if (b[a] && b[a] === b[c] && b[a] === b[d]) return b[a]
  }
  if (b.every(Boolean)) return 'draw'
  return null
}

function minimax(b: Board, turn: 'X' | 'O'): { score: number; move: number } {
  const w = winner(b)
  if (w === 'O') return { score: 1, move: -1 }
  if (w === 'X') return { score: -1, move: -1 }
  if (w === 'draw') return { score: 0, move: -1 }

  let best = turn === 'O' ? -Infinity : Infinity
  let bestMove = -1
  for (let i = 0; i < 9; i++) {
    if (b[i]) continue
    const next = b.slice()
    next[i] = turn
    const { score } = minimax(next, turn === 'O' ? 'X' : 'O')
    if (turn === 'O' ? score > best : score < best) {
      best = score
      bestMove = i
    }
  }
  return { score: best, move: bestMove }
}

export default function TicTacToe() {
  const [board, setBoard] = useState<Board>(Array(9).fill(null))
  const [turn, setTurn] = useState<'X' | 'O'>('X')
  const result = winner(board)

  useEffect(() => {
    if (turn === 'O' && !result) {
      const t = setTimeout(() => {
        const { move } = minimax(board, 'O')
        if (move >= 0) {
          const next = board.slice()
          next[move] = 'O'
          setBoard(next)
          setTurn('X')
        }
      }, 350)
      return () => clearTimeout(t)
    }
  }, [turn, board, result])

  const click = (i: number) => {
    if (board[i] || turn !== 'X' || result) return
    const next = board.slice()
    next[i] = 'X'
    setBoard(next)
    setTurn('O')
  }

  const reset = () => {
    setBoard(Array(9).fill(null))
    setTurn('X')
  }

  const status = result === 'X' ? '🎉 승리!' : result === 'O' ? '😵 패배' : result === 'draw' ? '🤝 무승부' : turn === 'X' ? '내 차례 (X)' : 'AI 생각 중... (O)'

  return (
    <div className="flex flex-col items-center">
      <h1 className="text-3xl font-bold mb-2">⭕ 틱택토</h1>
      <p className="text-zinc-400 mb-6">미니맥스 AI는 절대 안 짐 (잘해야 무승부)</p>
      <p className="text-lg font-medium mb-4 text-sky-300">{status}</p>
      <div className="grid grid-cols-3 gap-2 mb-6">
        {board.map((c, i) => (
          <button
            key={i}
            onClick={() => click(i)}
            disabled={!!c || !!result || turn !== 'X'}
            className={`w-20 h-20 sm:w-24 sm:h-24 rounded-xl bg-zinc-900 border border-zinc-700 text-4xl font-bold transition ${
              !c && !result && turn === 'X' ? 'hover:bg-zinc-800 hover:border-sky-400' : ''
            } ${c === 'X' ? 'text-sky-400' : c === 'O' ? 'text-rose-400' : ''}`}
          >
            {c}
          </button>
        ))}
      </div>
      <button
        onClick={reset}
        className="px-6 py-2 rounded-full bg-sky-500 hover:bg-sky-400 font-bold text-white transition"
      >
        다시 시작
      </button>
    </div>
  )
}

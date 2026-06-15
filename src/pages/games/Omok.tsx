import { useState } from 'react'

const SIZE = 15
type Stone = 'B' | 'W' | null
type Board = Stone[][]

const emptyBoard = (): Board =>
  Array.from({ length: SIZE }, () => Array(SIZE).fill(null) as Stone[])

const DIRS: [number, number][] = [
  [0, 1],
  [1, 0],
  [1, 1],
  [1, -1],
]

function checkWin(b: Board, r: number, c: number, s: Stone): boolean {
  if (!s) return false
  for (const [dr, dc] of DIRS) {
    let count = 1
    for (let k = 1; k < 5; k++) {
      const nr = r + dr * k
      const nc = c + dc * k
      if (nr < 0 || nr >= SIZE || nc < 0 || nc >= SIZE || b[nr][nc] !== s) break
      count++
    }
    for (let k = 1; k < 5; k++) {
      const nr = r - dr * k
      const nc = c - dc * k
      if (nr < 0 || nr >= SIZE || nc < 0 || nc >= SIZE || b[nr][nc] !== s) break
      count++
    }
    if (count >= 5) return true
  }
  return false
}

export default function Omok() {
  const [board, setBoard] = useState<Board>(emptyBoard)
  const [turn, setTurn] = useState<'B' | 'W'>('B')
  const [winner, setWinner] = useState<Stone>(null)
  const [last, setLast] = useState<[number, number] | null>(null)
  const [moves, setMoves] = useState(0)

  const place = (r: number, c: number) => {
    if (winner) return
    if (board[r][c]) return
    const next = board.map((row) => row.slice())
    next[r][c] = turn
    setBoard(next)
    setLast([r, c])
    setMoves((m) => m + 1)
    if (checkWin(next, r, c, turn)) {
      setWinner(turn)
    } else {
      setTurn(turn === 'B' ? 'W' : 'B')
    }
  }

  const reset = () => {
    setBoard(emptyBoard())
    setTurn('B')
    setWinner(null)
    setLast(null)
    setMoves(0)
  }

  return (
    <div className="flex flex-col items-center">
      <h1 className="text-3xl font-bold mb-2">⚫ 오목</h1>
      <p className="text-zinc-400 mb-2">
        가로/세로/대각선으로 5개를 먼저 잇는 쪽이 승
      </p>
      <p className="text-xs text-zinc-500 mb-4">2인 로컬 플레이 · 흑 선공</p>

      <div className="flex gap-6 mb-4 text-sm">
        {winner ? (
          <span className="text-emerald-300 font-bold">
            {winner === 'B' ? '⚫ 흑' : '⚪ 백'} 승리!
          </span>
        ) : (
          <span className="text-zinc-300">
            차례:{' '}
            <span className="font-bold text-white">
              {turn === 'B' ? '⚫ 흑' : '⚪ 백'}
            </span>
          </span>
        )}
        <span className="text-zinc-500">{moves}수</span>
      </div>

      <div className="bg-amber-100/95 p-3 rounded-lg border-2 border-amber-900/40 mb-6 shadow-xl">
        <div
          className="grid"
          style={{ gridTemplateColumns: `repeat(${SIZE}, minmax(0, 1fr))` }}
        >
          {board.map((row, r) =>
            row.map((cell, c) => {
              const isLast = last?.[0] === r && last?.[1] === c
              return (
                <button
                  key={`${r}-${c}`}
                  onClick={() => place(r, c)}
                  disabled={!!winner || !!cell}
                  className="relative w-5 h-5 sm:w-7 sm:h-7 flex items-center justify-center"
                  aria-label={`${r + 1}행 ${c + 1}열`}
                >
                  <span
                    className="absolute h-px bg-amber-900/70"
                    style={{
                      left: c === 0 ? '50%' : 0,
                      right: c === SIZE - 1 ? '50%' : 0,
                      top: '50%',
                    }}
                  />
                  <span
                    className="absolute w-px bg-amber-900/70"
                    style={{
                      top: r === 0 ? '50%' : 0,
                      bottom: r === SIZE - 1 ? '50%' : 0,
                      left: '50%',
                    }}
                  />
                  {cell && (
                    <span
                      className={`relative z-10 w-4 h-4 sm:w-6 sm:h-6 rounded-full shadow ${
                        cell === 'B'
                          ? 'bg-zinc-900'
                          : 'bg-zinc-50 border border-zinc-400'
                      } ${isLast ? 'ring-2 ring-rose-500' : ''}`}
                    />
                  )}
                </button>
              )
            })
          )}
        </div>
      </div>

      <button
        onClick={reset}
        className="px-6 py-2 rounded-full bg-amber-600 hover:bg-amber-500 font-bold text-white transition"
      >
        새 게임
      </button>
    </div>
  )
}

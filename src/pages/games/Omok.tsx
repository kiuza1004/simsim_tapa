import { useEffect, useState } from 'react'

const SIZE = 15
type Stone = 'B' | 'W' | null
type Board = Stone[][]
type Mode = 'pvp' | 'pvai-black' | 'pvai-white'
type Difficulty = 'easy' | 'medium' | 'hard'

const DIRS: [number, number][] = [
  [0, 1],
  [1, 0],
  [1, 1],
  [1, -1],
]

const emptyBoard = (): Board =>
  Array.from({ length: SIZE }, () => Array(SIZE).fill(null) as Stone[])

const inBounds = (r: number, c: number) =>
  r >= 0 && r < SIZE && c >= 0 && c < SIZE

const cloneBoard = (b: Board): Board => b.map((row) => row.slice())

function maxLine(b: Board, r: number, c: number, s: Stone): number {
  if (!s) return 0
  let max = 1
  for (const [dr, dc] of DIRS) {
    let count = 1
    for (let k = 1; k < 6; k++) {
      const nr = r + dr * k
      const nc = c + dc * k
      if (!inBounds(nr, nc) || b[nr][nc] !== s) break
      count++
    }
    for (let k = 1; k < 6; k++) {
      const nr = r - dr * k
      const nc = c - dc * k
      if (!inBounds(nr, nc) || b[nr][nc] !== s) break
      count++
    }
    if (count > max) max = count
  }
  return max
}

function patternScore(count: number, opens: number): number {
  if (count >= 5) return 100000
  if (count === 4) return opens === 2 ? 10000 : opens === 1 ? 1000 : 0
  if (count === 3) return opens === 2 ? 1000 : opens === 1 ? 100 : 0
  if (count === 2) return opens === 2 ? 100 : opens === 1 ? 10 : 0
  if (count === 1) return opens === 2 ? 10 : opens === 1 ? 1 : 0
  return 0
}

function scoreMove(b: Board, r: number, c: number, s: 'B' | 'W'): number {
  let total = 0
  for (const [dr, dc] of DIRS) {
    let countF = 0
    let i = r + dr
    let j = c + dc
    while (inBounds(i, j) && b[i][j] === s) {
      countF++
      i += dr
      j += dc
    }
    const openF = inBounds(i, j) && b[i][j] === null

    let countBk = 0
    let i2 = r - dr
    let j2 = c - dc
    while (inBounds(i2, j2) && b[i2][j2] === s) {
      countBk++
      i2 -= dr
      j2 -= dc
    }
    const openBk = inBounds(i2, j2) && b[i2][j2] === null

    total += patternScore(
      countF + countBk + 1,
      (openF ? 1 : 0) + (openBk ? 1 : 0)
    )
  }
  return total
}

function getCandidates(b: Board): [number, number][] {
  const seen = new Set<number>()
  let hasAny = false
  for (let r = 0; r < SIZE; r++) {
    for (let c = 0; c < SIZE; c++) {
      if (!b[r][c]) continue
      hasAny = true
      for (let dr = -2; dr <= 2; dr++) {
        for (let dc = -2; dc <= 2; dc++) {
          const nr = r + dr
          const nc = c + dc
          if (inBounds(nr, nc) && !b[nr][nc]) seen.add(nr * SIZE + nc)
        }
      }
    }
  }
  if (!hasAny) {
    const center = Math.floor(SIZE / 2)
    return [[center, center]]
  }
  return Array.from(seen).map(
    (v) => [Math.floor(v / SIZE), v % SIZE] as [number, number]
  )
}

function findAIMove(
  b: Board,
  ai: 'B' | 'W',
  overlineForbidden: boolean
): [number, number] | null {
  const opp: 'B' | 'W' = ai === 'B' ? 'W' : 'B'
  const candidates = getCandidates(b)

  let bestScore = -Infinity
  let bestMove: [number, number] | null = null

  for (const [r, c] of candidates) {
    if (ai === 'B' && overlineForbidden) {
      const test = cloneBoard(b)
      test[r][c] = 'B'
      if (maxLine(test, r, c, 'B') >= 6) continue
    }
    const score =
      scoreMove(b, r, c, ai) + scoreMove(b, r, c, opp) * 0.9
    if (score > bestScore) {
      bestScore = score
      bestMove = [r, c]
    }
  }

  return bestMove
}

function evaluatePosition(b: Board, ai: 'B' | 'W'): number {
  const opp: 'B' | 'W' = ai === 'B' ? 'W' : 'B'
  let aiSum = 0
  let oppSum = 0

  for (let r = 0; r < SIZE; r++) {
    for (let c = 0; c < SIZE; c++) {
      const s = b[r][c]
      if (!s) continue
      for (const [dr, dc] of DIRS) {
        const pr = r - dr
        const pc = c - dc
        if (inBounds(pr, pc) && b[pr][pc] === s) continue

        let len = 0
        let i = r
        let j = c
        while (inBounds(i, j) && b[i][j] === s) {
          len++
          i += dr
          j += dc
        }

        const opens =
          (inBounds(pr, pc) && b[pr][pc] === null ? 1 : 0) +
          (inBounds(i, j) && b[i][j] === null ? 1 : 0)
        const score = patternScore(len, opens)
        if (s === ai) aiSum += score
        else if (s === opp) oppSum += score
      }
    }
  }

  return aiSum - oppSum
}

function topCandidates(
  b: Board,
  toMove: 'B' | 'W',
  limit: number
): [number, number][] {
  const opp: 'B' | 'W' = toMove === 'B' ? 'W' : 'B'
  return getCandidates(b)
    .map(([r, c]) => ({
      m: [r, c] as [number, number],
      s: scoreMove(b, r, c, toMove) + scoreMove(b, r, c, opp) * 0.9,
    }))
    .sort((a, z) => z.s - a.s)
    .slice(0, limit)
    .map((x) => x.m)
}

const WIN_SCORE = 1_000_000

function alphaBeta(
  b: Board,
  depth: number,
  alpha: number,
  beta: number,
  ai: 'B' | 'W',
  toMove: 'B' | 'W',
  overlineForbidden: boolean
): number {
  if (depth === 0) return evaluatePosition(b, ai)

  const maximizing = toMove === ai
  const opp: 'B' | 'W' = toMove === 'B' ? 'W' : 'B'
  const candidates = topCandidates(b, toMove, 10)

  let value = maximizing ? -Infinity : Infinity

  for (const [r, c] of candidates) {
    b[r][c] = toMove

    if (toMove === 'B' && overlineForbidden && maxLine(b, r, c, 'B') >= 6) {
      b[r][c] = null
      continue
    }

    if (maxLine(b, r, c, toMove) >= 5) {
      b[r][c] = null
      return maximizing ? WIN_SCORE + depth : -WIN_SCORE - depth
    }

    const next = alphaBeta(b, depth - 1, alpha, beta, ai, opp, overlineForbidden)
    b[r][c] = null

    if (maximizing) {
      if (next > value) value = next
      if (value > alpha) alpha = value
    } else {
      if (next < value) value = next
      if (value < beta) beta = value
    }
    if (alpha >= beta) break
  }

  return value === -Infinity || value === Infinity
    ? evaluatePosition(b, ai)
    : value
}

function findBestMoveAB(
  b: Board,
  ai: 'B' | 'W',
  depth: number,
  overlineForbidden: boolean
): [number, number] | null {
  const working = cloneBoard(b)
  const opp: 'B' | 'W' = ai === 'B' ? 'W' : 'B'
  const candidates = topCandidates(working, ai, 15)
  if (candidates.length === 0) return null

  let bestValue = -Infinity
  let bestMove: [number, number] | null = null
  let alpha = -Infinity
  const beta = Infinity

  for (const [r, c] of candidates) {
    working[r][c] = ai

    if (ai === 'B' && overlineForbidden && maxLine(working, r, c, 'B') >= 6) {
      working[r][c] = null
      continue
    }

    let value: number
    if (maxLine(working, r, c, ai) >= 5) {
      value = WIN_SCORE + depth
    } else {
      value = alphaBeta(
        working,
        depth - 1,
        alpha,
        beta,
        ai,
        opp,
        overlineForbidden
      )
    }

    working[r][c] = null

    if (value > bestValue) {
      bestValue = value
      bestMove = [r, c]
    }
    if (value > alpha) alpha = value
  }

  return bestMove
}

type Snapshot = {
  board: Board
  turn: 'B' | 'W'
  winner: Stone
  last: [number, number] | null
  moves: number
}

export default function Omok() {
  const [board, setBoard] = useState<Board>(emptyBoard)
  const [turn, setTurn] = useState<'B' | 'W'>('B')
  const [winner, setWinner] = useState<Stone>(null)
  const [last, setLast] = useState<[number, number] | null>(null)
  const [moves, setMoves] = useState(0)
  const [history, setHistory] = useState<Snapshot[]>([])
  const [mode, setMode] = useState<Mode>('pvp')
  const [overline, setOverline] = useState(true)
  const [difficulty, setDifficulty] = useState<Difficulty>('medium')
  const [notice, setNotice] = useState<string | null>(null)

  const aiColor: 'B' | 'W' | null =
    mode === 'pvai-black' ? 'W' : mode === 'pvai-white' ? 'B' : null

  const reset = () => {
    setBoard(emptyBoard())
    setTurn('B')
    setWinner(null)
    setLast(null)
    setMoves(0)
    setHistory([])
    setNotice(null)
  }

  const changeMode = (m: Mode) => {
    setMode(m)
    reset()
  }

  const flashNotice = (msg: string) => {
    setNotice(msg)
    window.setTimeout(() => setNotice(null), 2000)
  }

  const place = (r: number, c: number) => {
    if (winner) return
    if (board[r][c]) return

    if (overline && turn === 'B') {
      const test = cloneBoard(board)
      test[r][c] = 'B'
      if (maxLine(test, r, c, 'B') >= 6) {
        flashNotice('장목 금지: 흑은 6목 이상을 만들 수 없습니다')
        return
      }
    }

    const snap: Snapshot = { board, turn, winner, last, moves }
    const next = cloneBoard(board)
    next[r][c] = turn

    setBoard(next)
    setLast([r, c])
    setMoves((m) => m + 1)
    setHistory((h) => [...h, snap])

    if (maxLine(next, r, c, turn) >= 5) {
      setWinner(turn)
    } else {
      setTurn(turn === 'B' ? 'W' : 'B')
    }
  }

  const userPlace = (r: number, c: number) => {
    if (aiColor && turn === aiColor) return
    place(r, c)
  }

  const undo = () => {
    if (history.length === 0) return
    const popCount = aiColor && history.length >= 2 ? 2 : 1
    const restoreIdx = history.length - popCount
    const snap = history[restoreIdx]
    setHistory((h) => h.slice(0, restoreIdx))
    setBoard(snap.board)
    setTurn(snap.turn)
    setWinner(snap.winner)
    setLast(snap.last)
    setMoves(snap.moves)
    setNotice(null)
  }

  useEffect(() => {
    if (winner) return
    if (!aiColor) return
    if (turn !== aiColor) return

    const id = window.setTimeout(() => {
      const move =
        difficulty === 'easy'
          ? findAIMove(board, aiColor, overline)
          : findBestMoveAB(
              board,
              aiColor,
              difficulty === 'medium' ? 2 : 4,
              overline
            )
      if (move) place(move[0], move[1])
    }, 250)
    return () => clearTimeout(id)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [turn, aiColor, winner, board, overline, difficulty])

  const modeButton = (m: Mode, label: string) => (
    <button
      onClick={() => changeMode(m)}
      className={`px-3 py-1.5 rounded-full text-xs font-bold transition ${
        mode === m
          ? 'bg-amber-500 text-white'
          : 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700'
      }`}
    >
      {label}
    </button>
  )

  const aiTurn = aiColor !== null && turn === aiColor

  return (
    <div className="flex flex-col items-center">
      <h1 className="text-3xl font-bold mb-2">⚫ 오목</h1>
      <p className="text-zinc-400 mb-4">5목을 먼저 잇는 쪽이 승</p>

      <div className="flex flex-wrap justify-center gap-2 mb-3">
        {modeButton('pvp', '2인 대전')}
        {modeButton('pvai-black', 'vs AI · 내가 흑')}
        {modeButton('pvai-white', 'vs AI · 내가 백')}
      </div>

      {aiColor && (
        <div className="flex items-center gap-2 mb-3 text-xs">
          <span className="text-zinc-400">AI 난이도</span>
          {(['easy', 'medium', 'hard'] as const).map((d) => (
            <button
              key={d}
              onClick={() => setDifficulty(d)}
              className={`px-2.5 py-1 rounded-full font-bold transition ${
                difficulty === d
                  ? 'bg-violet-500 text-white'
                  : 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700'
              }`}
            >
              {d === 'easy' ? '쉬움' : d === 'medium' ? '보통 (α-β d2)' : '어려움 (α-β d4)'}
            </button>
          ))}
        </div>
      )}

      <label className="text-xs text-zinc-400 flex items-center gap-2 mb-4 cursor-pointer select-none">
        <input
          type="checkbox"
          checked={overline}
          onChange={(e) => setOverline(e.target.checked)}
          className="accent-amber-500"
        />
        장목 금지 (흑이 6목 이상 금지)
      </label>

      <div className="flex gap-6 mb-2 text-sm">
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
            {aiTurn && (
              <span className="text-amber-400 ml-2">(AI 생각 중...)</span>
            )}
          </span>
        )}
        <span className="text-zinc-500">{moves}수</span>
      </div>

      <div className="h-5 mb-2 text-xs text-rose-400 font-bold">{notice}</div>

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
                  onClick={() => userPlace(r, c)}
                  disabled={!!winner || !!cell || aiTurn}
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

      <div className="flex gap-3">
        <button
          onClick={undo}
          disabled={history.length === 0 || aiTurn}
          className="px-6 py-2 rounded-full bg-zinc-700 hover:bg-zinc-600 disabled:opacity-40 disabled:cursor-not-allowed font-bold text-white transition"
        >
          ↶ 무르기
        </button>
        <button
          onClick={reset}
          className="px-6 py-2 rounded-full bg-amber-600 hover:bg-amber-500 font-bold text-white transition"
        >
          새 게임
        </button>
      </div>
    </div>
  )
}

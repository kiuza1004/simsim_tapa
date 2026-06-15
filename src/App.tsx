import { Routes, Route, Link, useLocation } from 'react-router-dom'
import Home from './pages/Home'
import Roulette from './pages/Roulette'
import Games from './pages/Games'
import TicTacToe from './pages/games/TicTacToe'
import MemoryMatch from './pages/games/MemoryMatch'
import ReactionTest from './pages/games/ReactionTest'
import WhackAMole from './pages/games/WhackAMole'

function Header() {
  const { pathname } = useLocation()
  const isHome = pathname === '/'
  return (
    <header className="w-full max-w-4xl mx-auto px-6 pt-6 pb-2 flex items-center justify-between">
      <Link to="/" className="text-xl font-bold tracking-tight">
        <span className="text-violet-400">심심</span>타파
      </Link>
      {!isHome && (
        <Link
          to="/"
          className="text-sm text-zinc-400 hover:text-white transition"
        >
          ← 메인으로
        </Link>
      )}
    </header>
  )
}

function App() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="w-full max-w-4xl mx-auto px-6 py-8 flex-1">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/roulette" element={<Roulette />} />
          <Route path="/games" element={<Games />} />
          <Route path="/games/tictactoe" element={<TicTacToe />} />
          <Route path="/games/memory" element={<MemoryMatch />} />
          <Route path="/games/reaction" element={<ReactionTest />} />
          <Route path="/games/whack" element={<WhackAMole />} />
        </Routes>
      </main>
      <footer className="text-center text-xs text-zinc-500 py-6">
        © 심심타파 — 지루함 추방 프로젝트
      </footer>
    </div>
  )
}

export default App

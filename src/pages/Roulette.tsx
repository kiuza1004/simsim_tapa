import { useMemo, useState } from 'react'

type Category = '전체' | '집에서' | '밖에서' | '먹기' | '혼자' | '같이'

const activities: Record<Exclude<Category, '전체'>, string[]> = {
  집에서: [
    '안 본 영화 한 편 정주행',
    '방 책상 위만 정리하기',
    '유튜브 ASMR 틀어놓고 낮잠',
    '냉장고 재료로 새 레시피 도전',
    '플레이리스트 처음부터 끝까지 듣기',
    '오랜만에 사진첩 정리',
    '벽 보면서 멍 때리기 15분',
    '안 입는 옷 5벌 골라 기부함에',
    '집에서 홈트레이닝 20분',
    '책장에서 안 읽은 책 1챕터 읽기',
  ],
  밖에서: [
    '집 근처 새 카페 탐방',
    '한 정거장 일찍 내려 걸어 오기',
    '편의점에서 신상품만 골라 시식',
    '동네 산책로 끝까지 걷기',
    '사진 10장 찍어 인스타 스토리',
    '서점에서 30분 책 구경',
    '버스 타고 종점까지 가보기',
    '공원 벤치에서 책 읽기',
    '안 가본 골목 탐험',
    '근처 박물관·전시 검색해서 가기',
  ],
  먹기: [
    '배달앱 별점 4.8 이상 랜덤 주문',
    '편의점 신상 3개 골라 비교 시식',
    '안 먹어본 컵라면 도전',
    '배달 안 시키고 한끼 직접 요리',
    '디저트 카페에서 케이크 한 조각',
    '냉장고 털어 비빔밥 만들기',
    '아이스크림 5종 미니 시식회',
    '핫도그·와플 같은 길거리 음식',
    '오마카세 사진만 검색해 보기',
    '엄마/친구한테 추천 메뉴 묻기',
  ],
  혼자: [
    '일기 한 페이지 쓰기',
    'MBTI 다른 버전 테스트해 보기',
    '명상 앱 10분 따라하기',
    '오래된 음악 앨범 처음부터 듣기',
    '코딩 튜토리얼 1개 따라하기',
    '내 인생 영화 다시 보기',
    '버킷리스트 10개 적기',
    '거울 보고 표정 연습',
    '내 방 사진 찍어 인테리어 분석',
    '취미 강의 1개 검색·메모',
  ],
  같이: [
    '친구한테 안부 전화 5분',
    '오랜 친구한테 손편지 사진 전송',
    '가족 단톡에 셀카 한 장',
    '화상통화로 같이 영화 보기',
    '온라인 보드게임 한 판',
    '같이 먹을 메뉴 정해 만나자고 조르기',
    '같이 운동하자고 약속 잡기',
    '게임 친구한테 던전 같이 돌자',
    '추억 사진 골라서 친구에게 공유',
    '랜덤 영상 1개 보내고 감상평 받기',
  ],
}

const categories: Category[] = ['전체', '집에서', '밖에서', '먹기', '혼자', '같이']

function pick<T>(arr: T[], exclude?: T): T {
  if (arr.length <= 1) return arr[0]
  let v = arr[Math.floor(Math.random() * arr.length)]
  while (v === exclude) v = arr[Math.floor(Math.random() * arr.length)]
  return v
}

export default function Roulette() {
  const [cat, setCat] = useState<Category>('전체')
  const [result, setResult] = useState<string | null>(null)
  const [spinning, setSpinning] = useState(false)
  const [flicker, setFlicker] = useState('')

  const pool = useMemo(() => {
    if (cat === '전체') return Object.values(activities).flat()
    return activities[cat]
  }, [cat])

  const spin = () => {
    if (spinning) return
    setSpinning(true)
    setResult(null)
    let ticks = 0
    const total = 18
    const interval = setInterval(() => {
      setFlicker(pick(pool, flicker))
      ticks++
      if (ticks >= total) {
        clearInterval(interval)
        const final = pick(pool, result ?? undefined)
        setResult(final)
        setFlicker('')
        setSpinning(false)
      }
    }, 70)
  }

  return (
    <div className="flex flex-col items-center">
      <h1 className="text-3xl font-bold mb-2">🎲 랜덤 액티비티 룰렛</h1>
      <p className="text-zinc-400 mb-6">
        카테고리 고르고, 룰렛 돌리고, 그냥 하면 됨
      </p>

      <div className="flex flex-wrap justify-center gap-2 mb-8">
        {categories.map((c) => (
          <button
            key={c}
            onClick={() => {
              setCat(c)
              setResult(null)
            }}
            className={`px-4 py-2 rounded-full text-sm font-medium transition border ${
              cat === c
                ? 'bg-violet-500 border-violet-400 text-white'
                : 'bg-zinc-900 border-zinc-700 text-zinc-300 hover:border-zinc-500'
            }`}
          >
            {c}
          </button>
        ))}
      </div>

      <div className="w-full max-w-xl rounded-3xl border border-violet-400/30 bg-gradient-to-br from-violet-500/10 to-fuchsia-500/5 p-8 min-h-[180px] flex items-center justify-center text-center mb-6">
        {spinning ? (
          <p className="text-2xl font-bold text-violet-300 animate-pulse">
            {flicker || '...'}
          </p>
        ) : result ? (
          <div>
            <p className="text-xs uppercase tracking-widest text-zinc-400 mb-2">
              오늘의 추천
            </p>
            <p className="text-2xl sm:text-3xl font-bold text-white leading-tight">
              {result}
            </p>
          </div>
        ) : (
          <p className="text-zinc-500">버튼을 눌러 추천받기</p>
        )}
      </div>

      <button
        onClick={spin}
        disabled={spinning}
        className="px-8 py-3 rounded-full bg-violet-500 hover:bg-violet-400 disabled:opacity-50 disabled:cursor-not-allowed font-bold text-white shadow-lg shadow-violet-500/30 transition"
      >
        {spinning ? '돌리는 중...' : result ? '다시 뽑기' : '돌리기'}
      </button>

      <p className="mt-6 text-xs text-zinc-500">
        총 {pool.length}개 활동 중 랜덤 선택
      </p>
    </div>
  )
}

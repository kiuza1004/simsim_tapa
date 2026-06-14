# 심심타파 (simsim_tapa)

심심할 때 뭐할지 골라주는 웹앱.

## 기능

### 1. 랜덤 액티비티 룰렛 (`/roulette`)
- 6개 카테고리(전체/집에서/밖에서/먹기/혼자/같이)
- 50+ 활동 풀에서 랜덤 추천
- 룰렛 스핀 애니메이션

### 2. 미니게임 모음 (`/games`)
- **틱택토** — 미니맥스 AI와 대결
- **메모리 매칭** — 16장 카드 짝 맞추기
- **반응속도 테스트** — 최고 기록 저장 (localStorage)

## 기술 스택

- Vite + React 19 + TypeScript
- Tailwind CSS 3
- React Router DOM (HashRouter — 정적 호스팅 친화적)

## 개발

```bash
npm install
npm run dev      # 개발 서버
npm run build    # 프로덕션 빌드 → dist/
npm run preview  # 빌드 결과 미리보기
```

## 배포

`dist/` 폴더를 정적 호스팅 어디에든 올리면 됩니다 (GitHub Pages, Vercel, Netlify).
HashRouter를 사용하므로 서버 사이드 리라이트 설정이 필요 없습니다.

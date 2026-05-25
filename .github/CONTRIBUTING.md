# 협업 가이드

## 브랜치 구조

```
main        ← A(팀장)만 머지. GitHub Pages 배포 소스.
dev         ← 통합 테스트 브랜치. 기능 완성 후 PR 올리는 곳.
map/scene00 ← B: SCENE 00 맵 작업
map/scene01 ← B: SCENE 01 맵 작업
...
```

## 역할별 작업 경로

| 역할 | 주로 건드리는 경로 |
|---|---|
| A (이벤트/로직) | `data/Map00X.json`, `data/CommonEvents.json`, `data/System.json` |
| B (맵/그래픽/오디오) | `data/Map00X.json`, `img/**`, `audio/**`, `data/Tilesets.json` |
| C (웹 개발) | `index.html`, `css/`, `js/` (게임 외부 래퍼) |
| D (UI 이미지) | `img/pictures/`, `img/system/`, `img/titles1/` |

## B → A 납품 절차

1. 작업 브랜치에서 작업 (`map/scene0X`)
2. `git add data/Map00X.json img/... audio/...`  
   — **data/System.json, data/CommonEvents.json 은 절대 포함하지 않기** (A 작업 영역)
3. `git commit -m "map: SCENE 0X 맵 완성"`
4. GitHub에 push 후 Slack/카톡으로 A에게 보고
5. A가 `dev` 브랜치로 머지

## D → A 납품 절차

1. 이미지 파일을 해당 경로에 추가
   - UI 팝업 이미지 → `img/pictures/`
   - 타이틀 화면 → `img/titles1/`
   - 시스템 UI → `img/system/`
2. commit 후 push, A에게 파일명 목록과 함께 보고

## 충돌이 자주 나는 파일

`data/MapInfos.json` — 맵을 추가·삭제할 때 RPG Maker가 자동 갱신함.  
B가 새 맵을 만들면 이 파일이 바뀌므로, A와 타이밍을 맞춰 머지할 것.

## 커밋 메시지 규칙

```
map: SCENE 01 학교 복도 맵 배치 완료
event: SCENE 02 수아 분기 선택지 입력
audio: SCENE 01 야간 BGM 삽입
img: 게시판 포스터 이미지 추가
fix: HP 변수 초기화 버그 수정
```

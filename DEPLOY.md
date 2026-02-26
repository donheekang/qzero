# Qzero 배포 가이드

## 1단계: 로컬에서 확인

```bash
cd qzero
npm install
cp .env.local.example .env.local
# .env.local에 ANTHROPIC_API_KEY 입력
npm run dev
# http://localhost:3000 에서 확인
```

## 2단계: GitHub 저장소 생성

```bash
cd qzero
git init
git add .
git commit -m "feat: Qzero MVP - 고객센터 문제 해결 AI 플랫폼"
```

GitHub에서 새 저장소 생성 후:
```bash
git remote add origin https://github.com/YOUR_USERNAME/qzero.git
git branch -M main
git push -u origin main
```

## 3단계: Vercel 배포

1. [vercel.com](https://vercel.com) 접속 → GitHub 로그인
2. "New Project" → qzero 저장소 선택
3. Framework: **Next.js** (자동 감지됨)
4. Root Directory: `./` (기본값)
5. Environment Variables 설정:

| Key | Value | 설명 |
|-----|-------|------|
| `ANTHROPIC_API_KEY` | `sk-ant-api03-...` | Claude API 키 |
| `NEXT_PUBLIC_SUPABASE_URL` | (나중에) | Supabase URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | (나중에) | Supabase Key |

6. "Deploy" 클릭 → 약 1~2분 후 배포 완료
7. `https://qzero-xxxxx.vercel.app` 주소로 접속 확인

## 4단계: qzero.kr 도메인 연결

### Vercel 측 설정
1. Vercel 대시보드 → qzero 프로젝트 → Settings → Domains
2. `qzero.kr` 입력 → Add
3. Vercel이 안내하는 DNS 레코드 확인 (보통 아래 2개):
   - `A` 레코드: `76.76.21.21`
   - `CNAME` 레코드: `cname.vercel-dns.com`

### 가비아 DNS 설정
1. [가비아](https://www.gabia.com) 로그인
2. My가비아 → 도메인 관리 → qzero.kr → DNS 관리
3. DNS 레코드 추가:

| 타입 | 호스트 | 값 | TTL |
|------|--------|-----|-----|
| **A** | `@` | `76.76.21.21` | 600 |
| **CNAME** | `www` | `cname.vercel-dns.com` | 600 |

4. 저장 후 5~30분 대기 (DNS 전파)
5. Vercel 대시보드에서 도메인 상태 "Valid Configuration" 확인
6. HTTPS 인증서는 Vercel이 자동 발급 (Let's Encrypt)

## 5단계: 배포 확인

- https://qzero.kr 접속
- https://www.qzero.kr 접속 (www 리다이렉트)
- 모바일에서 접속 확인
- 검색 기능 테스트: "SKT 해지" 검색

## 문제 해결

### 빌드 실패 시
```bash
npm run build  # 로컬에서 먼저 빌드 테스트
```

### DNS 전파 확인
```bash
dig qzero.kr        # A 레코드 확인
dig www.qzero.kr    # CNAME 확인
```

### 환경변수 미설정
- Vercel 대시보드 → Settings → Environment Variables에서 확인
- 변경 후 Redeploy 필요 (Deployments 탭 → 최신 배포 → Redeploy)

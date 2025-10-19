// api/auth.js
// ✅ 런타임 강제 지정 라인 제거 (기존: export const config = { runtime: 'nodejs' }; )

export default async function handler(req, res) {
  // 최소 동작: 서버리스 함수가 200을 즉시 반환 (배포 확인용)
  // 필요한 경우 여기에 Decap OAuth 프록시 로직을 붙이면 됩니다.
  res.status(200).json({ ok: true, path: "/api/auth" });
}

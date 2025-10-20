// api/auth.js
// GitHub OAuth 시작 — redirect_uri 미사용(앱에 등록된 콜백만 사용)

const CLIENT_ID = process.env.GITHUB_CLIENT_ID || '';
export default function handler(req, res) {
  if (!CLIENT_ID) {
    res.status(500).send('<pre>Missing GITHUB_CLIENT_ID</pre>');
    return;
  }
  const url = new URL('https://github.com/login/oauth/authorize');
  url.searchParams.set('client_id', CLIENT_ID);
  // redirect_uri 넣지 않음 (등록 콜백만 사용)
  url.searchParams.set('scope', 'repo,user:email');
  url.searchParams.set('allow_signup', 'false');

  // 디버그: /api/auth?debug=1 에서 현재 사용 값 보여주기
  if ((req.query || {}).debug === '1') {
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    res.end(JSON.stringify({
      note: 'DEBUG for /api/auth (no redirect_uri)',
      client_id_preview: CLIENT_ID.slice(0, 6) + '…'
    }, null, 2));
    return;
  }

  res.setHeader('Cache-Control', 'no-store');
  res.redirect(url.toString());
}

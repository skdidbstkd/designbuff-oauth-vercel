// api/auth.js
// ✅ 디버그 내장: /api/auth?debug=1 로 현재 설정을 JSON으로 출력
// ✅ 정상 흐름: /api/auth 로 접근 시 GitHub OAuth로 리다이렉트

const CLIENT_ID = process.env.GITHUB_CLIENT_ID || process.env.OAUTH_CLIENT_ID || '';
const BASE_URL  = process.env.PUBLIC_BASE_URL || '';

export default function handler(req, res) {
  const q = req.query || {};

  // --- 디버그 모드 ---
  if (q.debug === '1') {
    const REDIRECT_URI = BASE_URL ? `${BASE_URL}/api/callback` : null;
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    res.status(200).send(JSON.stringify({
      note: 'DEBUG for /api/auth',
      has_env: {
        GITHUB_CLIENT_ID: !!process.env.GITHUB_CLIENT_ID,
        OAUTH_CLIENT_ID:  !!process.env.OAUTH_CLIENT_ID,
        GITHUB_CLIENT_SECRET: !!process.env.GITHUB_CLIENT_SECRET,
        OAUTH_CLIENT_SECRET:  !!process.env.OAUTH_CLIENT_SECRET,
        PUBLIC_BASE_URL: !!process.env.PUBLIC_BASE_URL
      },
      values_preview: {
        CLIENT_ID_preview: CLIENT_ID ? CLIENT_ID.slice(0,6) + '…' : null,
        BASE_URL
      },
      built: {
        authorize_url: CLIENT_ID ? `https://github.com/login/oauth/authorize?client_id=${encodeURIComponent(CLIENT_ID)}&redirect_uri=${encodeURIComponent(REDIRECT_URI || '')}&scope=repo%2Cuser%3Aemail&allow_signup=false` : null,
        redirect_uri: REDIRECT_URI
      }
    }, null, 2));
    return;
  }
  // --------------------

  if (!CLIENT_ID || !BASE_URL) {
    res.status(500).send(`<!doctype html><pre>Missing ENV:
GITHUB_CLIENT_ID(or OAUTH_CLIENT_ID)=${CLIENT_ID ? 'OK' : 'MISSING'}
PUBLIC_BASE_URL=${BASE_URL ? 'OK' : 'MISSING'}
</pre>`);
    return;
  }

  const REDIRECT_URI = `${BASE_URL}/api/callback`;
  const url = new URL('https://github.com/login/oauth/authorize');
  url.searchParams.set('client_id', CLIENT_ID);
  url.searchParams.set('redirect_uri', REDIRECT_URI);   // ← 콜백과 동일하게 보냄
  url.searchParams.set('scope', 'repo,user:email');
  url.searchParams.set('allow_signup', 'false');

  res.setHeader('Cache-Control', 'no-store');
  res.redirect(url.toString());
}

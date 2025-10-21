// api/auth.js
// 고정값 + state 추가 + 디버그 모드 포함
const CLIENT_ID    = 'Ov23lieKCsdnNIBAplLZ';
const REDIRECT_URI = 'https://designbuff-oauth-vercel.vercel.app/api/callback';

function json(res, obj, code = 200) {
  res.status(code);
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.end(JSON.stringify(obj, null, 2));
}

export default function handler(req, res) {
  const q = req.query || {};

  // 디버그: /api/auth?debug=1
  if (q.debug === '1') {
    return json(res, {
      note: 'DEBUG for /api/auth (HARDCODED + state)',
      client_id_preview: CLIENT_ID.slice(0, 6) + '…',
      redirect_uri: REDIRECT_URI
    });
  }

  if (!CLIENT_ID) return json(res, { error: 'missing_client_id' }, 500);

  // CSRF 방지용 state(간단 랜덤)
  const state = Math.random().toString(36).slice(2) + Date.now().toString(36);

  const url = new URL('https://github.com/login/oauth/authorize');
  url.searchParams.set('client_id', CLIENT_ID);
  url.searchParams.set('redirect_uri', REDIRECT_URI); // 콜백과 동일
  url.searchParams.set('scope', 'repo,user:email');
  url.searchParams.set('allow_signup', 'false');
  url.searchParams.set('state', state);

  res.setHeader('Cache-Control', 'no-store');
  res.redirect(url.toString());
}

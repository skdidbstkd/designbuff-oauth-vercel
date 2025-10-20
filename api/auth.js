// api/auth.js
// 고정값(하드코딩): CLIENT_ID / REDIRECT_URI 이미 박아둠
const CLIENT_ID = 'Ov23lid0IgXxoORNT2v8';
const REDIRECT_URI = 'https://designbuff-oauth-vercel.vercel.app/api/callback';

export default function handler(req, res) {
  // 디버그: /api/auth?debug=1
  if ((req.query || {}).debug === '1') {
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    res.status(200).send(JSON.stringify({
      note: 'DEBUG for /api/auth (HARDCODED)',
      client_id_preview: CLIENT_ID.slice(0, 6) + '…',
      redirect_uri: REDIRECT_URI
    }, null, 2));
    return;
  }

  if (!CLIENT_ID) {
    res.status(500).send('<pre>Missing CLIENT_ID</pre>');
    return;
  }

  const url = new URL('https://github.com/login/oauth/authorize');
  url.searchParams.set('client_id', CLIENT_ID);
  url.searchParams.set('redirect_uri', REDIRECT_URI); // 콜백과 동일
  url.searchParams.set('scope', 'repo,user:email');
  url.searchParams.set('allow_signup', 'false');

  res.setHeader('Cache-Control', 'no-store');
  res.redirect(url.toString());
}

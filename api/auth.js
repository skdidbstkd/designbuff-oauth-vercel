// api/auth.js
// GitHub OAuth 시작: redirect_uri 미사용(앱에 등록된 콜백만 사용)

const CLIENT_ID =
  process.env.GITHUB_CLIENT_ID || process.env.OAUTH_CLIENT_ID || '';
const BASE_URL = process.env.PUBLIC_BASE_URL || '';

export default function handler(req, res) {
  if (!CLIENT_ID) {
    res.status(500).send('<pre>Missing ENV: GITHUB_CLIENT_ID / OAUTH_CLIENT_ID</pre>');
    return;
  }

  const url = new URL('https://github.com/login/oauth/authorize');
  url.searchParams.set('client_id', CLIENT_ID);
  // redirect_uri는 절대 넣지 않음 (등록된 콜백만 사용)
  url.searchParams.set('scope', 'repo,user:email');
  url.searchParams.set('allow_signup', 'false');

  res.setHeader('Cache-Control', 'no-store');
  res.redirect(url.toString());
}

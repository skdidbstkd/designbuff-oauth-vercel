// api/auth.js
// OAuth 시작 — redirect_uri 포함 (토큰 교환과 동일한 redirect_uri 사용)

const CLIENT_ID = process.env.GITHUB_CLIENT_ID || process.env.OAUTH_CLIENT_ID || '';
const BASE_URL = process.env.PUBLIC_BASE_URL || '';

export default function handler(req, res) {
  if (!CLIENT_ID || !BASE_URL) {
    res.status(500).send(`<!doctype html><body><pre>Missing ENV:
GITHUB_CLIENT_ID=${CLIENT_ID ? 'OK' : 'MISSING'}
PUBLIC_BASE_URL=${BASE_URL ? 'OK' : 'MISSING'}
</pre></body>`);
    return;
  }

  const REDIRECT_URI = `${BASE_URL}/api/callback`;
  const url = new URL('https://github.com/login/oauth/authorize');
  url.searchParams.set('client_id', CLIENT_ID);
  url.searchParams.set('redirect_uri', REDIRECT_URI);
  url.searchParams.set('scope', 'repo,user:email');
  url.searchParams.set('allow_signup', 'false');

  res.setHeader('Cache-Control', 'no-store');
  res.redirect(url.toString());
}

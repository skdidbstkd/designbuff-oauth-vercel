// api/auth.js
// 로그인 시작: GitHub OAuth로 이동

const CLIENT_ID =
  process.env.OAUTH_CLIENT_ID || process.env.GITHUB_CLIENT_ID || '';
const BASE_URL = process.env.PUBLIC_BASE_URL || '';

export default function handler(req, res) {
  if (!CLIENT_ID || !BASE_URL) {
    res
      .status(500)
      .send(
        `<!doctype html><pre>Missing ENV:
CLIENT_ID=${CLIENT_ID ? 'OK' : 'MISSING'}
BASE_URL=${BASE_URL ? 'OK' : 'MISSING'}
</pre>`
      );
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

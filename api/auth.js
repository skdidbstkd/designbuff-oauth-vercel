// api/auth.js
// GitHub 로그인 페이지로 리다이렉트 (Decap CMS의 "Login with GitHub" 버튼이 이 엔드포인트를 팝업으로 엶)

const CLIENT_ID = process.env.OAUTH_CLIENT_ID;
const BASE_URL = process.env.PUBLIC_BASE_URL; // 예: https://designbuff-oauth-vercel.vercel.app
const REDIRECT_URI = `${BASE_URL}/api/callback`;

export default function handler(req, res) {
  const url = new URL('https://github.com/login/oauth/authorize');
  url.searchParams.set('client_id', CLIENT_ID);
  url.searchParams.set('redirect_uri', REDIRECT_URI);
  url.searchParams.set('scope', 'repo,user:email');
  url.searchParams.set('allow_signup', 'false');

  res.setHeader('Cache-Control', 'no-store');
  res.redirect(url.toString());
}

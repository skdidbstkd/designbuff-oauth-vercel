// api/auth.js
// ❗임시 확정안: 환경변수 무시하고 직접 값을 사용 (나중에 원복 가능)
const OVERRIDE_CLIENT_ID = 'PASTE_CLIENT_ID_HERE'; // ← 여기에 GitHub OAuth App의 Client ID 그대로 붙여넣기

export default function handler(req, res) {
  const CLIENT_ID = OVERRIDE_CLIENT_ID.trim();
  if (!CLIENT_ID) {
    res.status(500).send('<pre>Missing OVERRIDE_CLIENT_ID</pre>');
    return;
  }

  const url = new URL('https://github.com/login/oauth/authorize');
  url.searchParams.set('client_id', CLIENT_ID);
  // redirect_uri는 쓰지 않음(앱에 등록된 콜백 사용)
  url.searchParams.set('scope', 'repo,user:email');
  url.searchParams.set('allow_signup', 'false');

  res.setHeader('Cache-Control', 'no-store');
  res.redirect(url.toString());
}

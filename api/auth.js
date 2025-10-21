// api/auth.js — v2 Client ID 하드코딩 + state
const CLIENT_ID    = 'Ov23lieKCsdnNIBAplLZ'; // ← K 다음 '대문자 C'
const REDIRECT_URI = 'https://designbuff-oauth-vercel.vercel.app/api/callback';

function sendJSON(res, obj, code=200){
  res.status(code);
  res.setHeader('Content-Type','application/json; charset=utf-8');
  res.end(JSON.stringify(obj,null,2));
}

export default function handler(req, res){
  const q = req.query || {};
  if (q.debug === '1') {
    return sendJSON(res, {
      note: 'DEBUG /api/auth (HARDCODED v2)',
      client_id_preview: CLIENT_ID.slice(0,6) + '…',
      client_id_full: CLIENT_ID,
      redirect_uri: REDIRECT_URI
    });
  }

  // CSRF용 state
  const state = Math.random().toString(36).slice(2) + Date.now().toString(36);

  const url = new URL('https://github.com/login/oauth/authorize');
  url.searchParams.set('client_id', CLIENT_ID);
  url.searchParams.set('redirect_uri', REDIRECT_URI);
  url.searchParams.set('scope', 'repo,user:email');
  url.searchParams.set('allow_signup', 'false');
  url.searchParams.set('state', state);

  res.setHeader('Cache-Control', 'no-store');
  res.redirect(url.toString());
}

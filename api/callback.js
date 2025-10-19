// api/callback.js
// ❗임시 확정안: 환경변수 무시하고 직접 값을 사용 (나중에 원복 가능)
const OVERRIDE_CLIENT_ID = 'Ov23lid0IgXxoORNT2v8';     // ← 위와 동일한 Client ID
const OVERRIDE_CLIENT_SECRET = '5a260ebcdcbdeccdca728a56f5af37f7b92f014d'; // ← 방금 새로 발급받은 Client Secret

function html(obj) {
  return `<!doctype html><html><body><pre style="white-space:pre-wrap;font:14px/1.45 system-ui;">
${JSON.stringify(obj, null, 2)}
</pre><script>setTimeout(()=>{try{window.close()}catch(e){}},1500)</script></body></html>`;
}

export default async function handler(req, res) {
  const code = (req.query && req.query.code) ? String(req.query.code) : '';
  const CLIENT_ID = OVERRIDE_CLIENT_ID.trim();
  const CLIENT_SECRET = OVERRIDE_CLIENT_SECRET.trim();

  if (!code)           return res.status(400).send(html({ error: 'missing_code' }));
  if (!CLIENT_ID)      return res.status(500).send(html({ error: 'missing_override_client_id' }));
  if (!CLIENT_SECRET)  return res.status(500).send(html({ error: 'missing_override_client_secret' }));

  try {
    const tokenRes = await fetch('https://github.com/login/oauth/access_token', {
      method: 'POST',
      headers: { Accept: 'application/json' },
      body: new URLSearchParams({
        client_id: CLIENT_ID,
        client_secret: CLIENT_SECRET,
        code
        // redirect_uri는 지정하지 않음 (앱 등록 콜백 사용)
      })
    });

    const data = await tokenRes.json();

    if (!tokenRes.ok) {
      return res.status(500).send(html({
        error: 'token_exchange_failed',
        status: tokenRes.status,
        data,
        used_client_id: CLIENT_ID.slice(0, 6) + '…',
        note: 'override mode (no redirect_uri)'
      }));
    }

    const token = data && data.access_token ? String(data.access_token) : '';
    if (!token) {
      return res.status(500).send(html({
        error: 'no_token_from_github',
        data,
        used_client_id: CLIENT_ID.slice(0, 6) + '…',
        note: 'override mode (no redirect_uri)'
      }));
    }

    // Decap로 토큰 전달
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.send(`<!doctype html><html><body><script>
      (function () {
        try { window.opener.postMessage({ token: ${JSON.stringify(token)} }, "*"); } catch (e) {}
        window.close();
      })();
    </script></body></html>`);
  } catch (e) {
    res.status(500).send(html({ error: 'callback_crashed', message: String(e) }));
  }
}

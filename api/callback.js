// api/callback.js
// code -> token 교환: redirect_uri 미사용 (앱 등록 콜백 자동 매칭)

const CLIENT_ID =
  process.env.GITHUB_CLIENT_ID || process.env.OAUTH_CLIENT_ID || '';
const CLIENT_SECRET =
  process.env.GITHUB_CLIENT_SECRET || process.env.OAUTH_CLIENT_SECRET || '';
const BASE_URL = process.env.PUBLIC_BASE_URL || '';

function html(obj) {
  return `<!doctype html><html><body><pre style="white-space:pre-wrap;font:14px/1.45 system-ui;">${
    JSON.stringify(obj, null, 2)
  }</pre><script>setTimeout(()=>{try{window.close()}catch(e){}},1500)</script></body></html>`;
}

export default async function handler(req, res) {
  const code = (req.query && req.query.code) ? String(req.query.code) : '';

  if (!code)        return res.status(400).send(html({ error: 'missing_code' }));
  if (!CLIENT_ID)   return res.status(500).send(html({ error: 'missing_client_id' }));
  if (!CLIENT_SECRET) return res.status(500).send(html({ error: 'missing_client_secret' }));

  try {
    const tokenRes = await fetch('https://github.com/login/oauth/access_token', {
      method: 'POST',
      headers: { Accept: 'application/json' },
      body: new URLSearchParams({
        client_id: CLIENT_ID,
        client_secret: CLIENT_SECRET,
        code
        // redirect_uri 절대 넣지 않음
      })
    });

    const data = await tokenRes.json();

    if (!tokenRes.ok) {
      return res.status(500).send(html({
        error: 'token_exchange_failed',
        status: tokenRes.status,
        data,
        used_client_id: CLIENT_ID.slice(0, 6) + '…',
        note: 'no redirect_uri flow'
      }));
    }

    const token = data && data.access_token ? String(data.access_token) : '';
    if (!token) {
      return res.status(500).send(html({
        error: 'no_token_from_github',
        data,
        used_client_id: CLIENT_ID.slice(0, 6) + '…',
        note: 'no redirect_uri flow'
      }));
    }

    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.send(`<!doctype html><html><body><script>
      (function () {
        try { window.opener.postMessage({ token: ${JSON.stringify(token)} }, "${BASE_URL || '*'}"); } catch (e) {}
        window.close();
      })();
    </script></body></html>`);
  } catch (e) {
    res.status(500).send(html({ error: 'callback_crashed', message: String(e) }));
  }
}

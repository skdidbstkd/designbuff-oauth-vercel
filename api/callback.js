// api/callback.js
// code -> access_token 교환 (redirect_uri 반드시 동일하게 보냄)
// 결과가 실패하면 창을 닫지 않고 JSON을 표시하므로 캡처 가능

const CLIENT_ID = process.env.GITHUB_CLIENT_ID || process.env.OAUTH_CLIENT_ID || '';
const CLIENT_SECRET = process.env.GITHUB_CLIENT_SECRET || process.env.OAUTH_CLIENT_SECRET || '';
const BASE_URL = process.env.PUBLIC_BASE_URL || '';

function show(obj) {
  return `<!doctype html><html><body>
<pre style="white-space:pre-wrap;font:14px/1.45 system-ui;">${JSON.stringify(obj, null, 2)}</pre>
<p style="color:#666;font-size:13px">이 창은 자동으로 닫히지 않습니다. 화면 캡처해서 보여주세요.</p>
</body></html>`;
}

export default async function handler(req, res) {
  const code = req.query && req.query.code ? String(req.query.code) : '';
  if (!code) return res.status(400).send(show({ error: 'missing_code' }));
  if (!CLIENT_ID) return res.status(500).send(show({ error: 'missing_client_id' }));
  if (!CLIENT_SECRET) return res.status(500).send(show({ error: 'missing_client_secret' }));
  if (!BASE_URL) return res.status(500).send(show({ error: 'missing_base_url' }));

  const REDIRECT_URI = `${BASE_URL}/api/callback`;

  try {
    const tokenRes = await fetch('https://github.com/login/oauth/access_token', {
      method: 'POST',
      headers: { Accept: 'application/json' },
      body: new URLSearchParams({
        client_id: CLIENT_ID,
        client_secret: CLIENT_SECRET,
        code,
        redirect_uri: REDIRECT_URI
      })
    });

    const data = await tokenRes.json();

    if (!tokenRes.ok || data.error) {
      return res.status(500).send(show({
        error: 'token_exchange_failed',
        status: tokenRes.status,
        data,
        used_client_id_preview: CLIENT_ID.slice(0,6) + '…'
      }));
    }

    const token = data.access_token || '';
    if (!token) {
      return res.status(500).send(show({ error: 'no_token', data }));
    }

    // 성공: Decap(부모창)으로 token 전달하고 창 닫기
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.send(`<!doctype html><html><body><script>
      (function () {
        try { window.opener.postMessage({ token: ${JSON.stringify(token)} }, "${BASE_URL}"); } catch (e) {}
        window.close();
      })();
    </script></body></html>`);
  } catch (e) {
    res.status(500).send(show({ error: 'callback_crashed', message: String(e) }));
  }
}

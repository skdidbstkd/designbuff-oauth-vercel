// api/callback.js
// GitHub code -> access_token 교환 후 부모창으로 전달

const CLIENT_ID =
  process.env.OAUTH_CLIENT_ID || process.env.GITHUB_CLIENT_ID || '';
const CLIENT_SECRET =
  process.env.OAUTH_CLIENT_SECRET || process.env.GITHUB_CLIENT_SECRET || '';
const BASE_URL = process.env.PUBLIC_BASE_URL || '';

function htmlMessage(obj) {
  return `<!doctype html><html><body><pre style="white-space:pre-wrap;font:14px/1.4 system-ui;">
${JSON.stringify(obj, null, 2)}
</pre>
<script>setTimeout(function(){ try{ window.close(); }catch(e){} }, 1500);</script>
</body></html>`;
}

export default async function handler(req, res) {
  try {
    const code = (req.query && req.query.code) ? String(req.query.code) : '';
    if (!code) {
      res.status(400).send(htmlMessage({ error: 'missing_code' }));
      return;
    }
    if (!CLIENT_ID || !CLIENT_SECRET || !BASE_URL) {
      res.status(500).send(
        htmlMessage({
          error: 'missing_env',
          CLIENT_ID: !!CLIENT_ID,
          CLIENT_SECRET: !!CLIENT_SECRET,
          BASE_URL: !!BASE_URL
        })
      );
      return;
    }

    const REDIRECT_URI = `${BASE_URL}/api/callback`;

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

    if (!tokenRes.ok) {
      res
        .status(500)
        .send(
          htmlMessage({
            error: 'token_exchange_failed',
            status: tokenRes.status,
            data
          })
        );
      return;
    }

    const token = data && data.access_token ? String(data.access_token) : '';
    if (!token) {
      res
        .status(500)
        .send(htmlMessage({ error: 'no_token_from_github', data }));
      return;
    }

    // 성공: 부모창(Decap)으로 토큰 전달
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.send(`<!doctype html><html><body><script>
      (function () {
        try { window.opener.postMessage({ token: ${JSON.stringify(
          token
        )} }, "${BASE_URL}"); } catch (e) {}
        window.close();
      })();
    </script></body></html>`);
  } catch (e) {
    res
      .status(500)
      .send(htmlMessage({ error: 'callback_crashed', message: String(e) }));
  }
}

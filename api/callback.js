// api/callback.js
// GitHub가 code를 넘겨주면 access_token으로 교환하고,
// 팝업 창 안에서 부모 창(Decap CMS)으로 token을 postMessage로 전달한 뒤 팝업을 닫음.

const CLIENT_ID = process.env.OAUTH_CLIENT_ID;
const CLIENT_SECRET = process.env.OAUTH_CLIENT_SECRET;
const BASE_URL = process.env.PUBLIC_BASE_URL;
const REDIRECT_URI = `${BASE_URL}/api/callback`;

export default async function handler(req, res) {
  const { code } = req.query || {};
  if (!code) {
    res.status(400).send('Missing "code"');
    return;
  }

  try {
    const tokenRes = await fetch('https://github.com/login/oauth/access_token', {
      method: 'POST',
      headers: { Accept: 'application/json' },
      body: new URLSearchParams({
        client_id: CLIENT_ID,
        client_secret: CLIENT_SECRET,
        code: String(code),
        redirect_uri: REDIRECT_URI,
      }),
    });

    const data = await tokenRes.json();
    const token = data && data.access_token ? String(data.access_token) : '';

    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    // Decap CMS가 기대하는 형식: 팝업에서 parent로 { token } 또는 { error }를 postMessage
    res.send(`<!doctype html><html><body><script>
      (function () {
        function send(msg) {
          try { window.opener.postMessage(msg, "${BASE_URL}"); } catch (e) {}
          window.close();
        }
        var token = ${JSON.stringify(token)};
        if (token) {
          send({ token: token });
        } else {
          send({ error: 'no_token' });
        }
      })();
    </script></body></html>`);
  } catch (e) {
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.status(500).send(\`<!doctype html><html><body><script>
      (function () {
        try { window.opener.postMessage({ error: 'exchange_failed' }, "${BASE_URL}"); } catch (e) {}
        window.close();
      })();
    </script></body></html>\`);
  }
}

// api/callback.js
// auth.js에서 redirect_uri 안 보내니까, 여기서도 안 보낸다 (GitHub 앱에 등록된 콜백만 사용)
// 실패 시 요청/응답 전부 찍어서 보여줌

const CLIENT_ID = 'Ov23lieKCsdnNIBAplLZ'; // 너 OAuth 앱의 ID
const CLIENT_SECRET = (process.env.GITHUB_CLIENT_SECRET || '').trim();

function page(obj, code = 200) {
  const body = `<!doctype html><html><body>
<pre style="white-space:pre-wrap;font:14px/1.45 system-ui;">${JSON.stringify(obj, null, 2)}</pre>
<p style="color:#666;font-size:13px">이 창은 자동으로 닫히지 않습니다. 이 화면을 캡처해서 보여주세요.</p>
</body></html>`;
  return { code, body };
}

export default async function handler(req, res) {
  const q = req.query || {};
  const code = typeof q.code === 'string' ? q.code : '';
  const state = typeof q.state === 'string' ? q.state : '';

  if (!code) {
    const { body } = page({ error: 'missing_code', q }, 400);
    return res.status(400).send(body);
  }
  if (!CLIENT_SECRET) {
    const { body } = page(
      {
        error: 'missing_client_secret_env',
        need: 'GITHUB_CLIENT_SECRET',
      },
      500,
    );
    return res.status(500).send(body);
  }

  // GitHub가 앱에 등록해둔 callback만 쓰게 한다: redirect_uri 안 보냄
  const tokenUrl = 'https://github.com/login/oauth/access_token';
  const bodyParams = new URLSearchParams({
    client_id: CLIENT_ID,
    client_secret: CLIENT_SECRET,
    code,
    state,
  });
  const headers = {
    Accept: 'application/json',
    'Content-Type': 'application/x-www-form-urlencoded',
  };

  try {
    const tokenRes = await fetch(tokenUrl, {
      method: 'POST',
      headers,
      body: bodyParams,
    });

    let data;
    let rawText = null;
    try {
      data = await tokenRes.json();
    } catch (e) {
      rawText = await tokenRes.text();
      data = { _rawText: rawText };
    }

    // 실패 시 그대로 보여줌
    if (!tokenRes.ok || data.error) {
      const { body } = page(
        {
          error: 'token_exchange_failed',
          status: tokenRes.status,
          data,
          diag: {
            client_id_full: CLIENT_ID,
            // redirect_uri 일부러 안 보냄
            secret_len: CLIENT_SECRET.length,
          },
          sent: {
            url: tokenUrl,
            body: String(bodyParams),
            headers,
          },
        },
        500,
      );
      return res.status(500).send(body);
    }

    const accessToken =
      typeof data.access_token === 'string' ? data.access_token : '';
    if (!accessToken) {
      const { body } = page({ error: 'no_token', data }, 500);
      return res.status(500).send(body);
    }

    // 성공: CMS로 토큰 보내고 닫기
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.send(`<!doctype html><html><body><script>
      (function () {
        try {
          window.opener.postMessage({ token: ${JSON.stringify(accessToken)} }, "*");
        } catch (e) {}
        window.close();
      })();
    </script></body></html>`);
  } catch (e) {
    const { body } = page(
      {
        error: 'callback_crashed',
        message: String(e),
        sent_try: {
          url: tokenUrl,
          body: String(bodyParams),
          headers,
        },
      },
      500,
    );
    return res.status(500).send(body);
  }
}

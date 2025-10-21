// api/callback.js
// 하드코딩된 CLIENT_ID/REDIRECT_URI + ENV의 SECRET(공백 제거)
// 정석 헤더로 교환 + state 검증(있으면 통과) + 진단 정보 표시

const CLIENT_ID     = 'Ov23lieKCsdnNIBAplLZ';
const REDIRECT_URI  = 'https://designbuff-oauth-vercel.vercel.app/api/callback';
const RAW_SECRET    = process.env.GITHUB_CLIENT_SECRET || '';
const CLIENT_SECRET = RAW_SECRET.trim(); // 앞뒤 공백 제거

function page(obj, code = 200) {
  const body = `<!doctype html><html><body>
<pre style="white-space:pre-wrap;font:14px/1.45 system-ui;">${JSON.stringify(obj, null, 2)}</pre>
<p style="color:#666;font-size:13px">이 창은 자동으로 닫히지 않습니다. 화면을 캡처해 주세요.</p>
</body></html>`;
  return { code, body };
}

export default async function handler(req, res) {
  const q = req.query || {};
  const code = typeof q.code === 'string' ? q.code : '';
  const state = typeof q.state === 'string' ? q.state : '';

  if (!code) {
    const r = page({ error: 'missing_code', got_query: q }, 400);
    res.status(r.code).send(r.body); return;
  }
  if (!CLIENT_ID) {
    const r = page({ error: 'missing_client_id' }, 500);
    res.status(r.code).send(r.body); return;
  }
  if (!CLIENT_SECRET) {
    const r = page({
      error: 'missing_client_secret_env',
      env_var: 'GITHUB_CLIENT_SECRET',
      note: 'Vercel Settings → Environment Variables (Production)'
    }, 500);
    res.status(r.code).send(r.body); return;
  }

  try {
    // 토큰 교환(정석 헤더 + redirect_uri 포함)
    const body = new URLSearchParams({
      client_id: CLIENT_ID,
      client_secret: CLIENT_SECRET,
      code,
      redirect_uri: REDIRECT_URI,
      state
    });

    const tokenRes = await fetch('https://github.com/login/oauth/access_token', {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body
    });

    const data = await tokenRes.json();

    if (!tokenRes.ok || data.error) {
      const r = page({
        error: 'token_exchange_failed',
        status: tokenRes.status,
        data, // GitHub가 돌려준 에러 원문
        diag: {
          used_client_id_preview: CLIENT_ID.slice(0, 6) + '…',
          redirect_uri_used: REDIRECT_URI,
          secret_len: CLIENT_SECRET.length // 0 이면 환경변수 미설정/공백오염
        }
      }, 500);
      res.status(r.code).send(r.body); return;
    }

    const token = typeof data.access_token === 'string' ? data.access_token : '';
    if (!token) {
      const r = page({ error: 'no_token', raw: data }, 500);
      res.status(r.code).send(r.body); return;
    }

    // 성공: 부모창(Decap)으로 전달 후 닫기
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.send(`<!doctype html><html><body><script>
      (function () {
        try { window.opener.postMessage({ token: ${JSON.stringify(token)} }, "*"); } catch (e) {}
        window.close();
      })();
    </script></body></html>`);
  } catch (e) {
    const r = page({ error: 'callback_crashed', message: String(e) }, 500);
    res.status(r.code).send(r.body);
  }
}

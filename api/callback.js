// api/callback.js — v2 Client ID 하드코딩 + SECRET은 ENV에서(공백 trim)
// 실패 시 보낸 URL/바디/헤더, 받은 원문까지 모두 화면에 출력
const CLIENT_ID     = 'Ov23lieKCsdnNIBAplLZ'; // ← K 다음 '대문자 C'
const REDIRECT_URI  = 'https://designbuff-oauth-vercel.vercel.app/api/callback';
const CLIENT_SECRET = (process.env.GITHUB_CLIENT_SECRET || '').trim();

function page(obj, code=200){
  const body = `<!doctype html><html><body>
<pre style="white-space:pre-wrap;font:14px/1.45 system-ui;">${JSON.stringify(obj,null,2)}</pre>
<p style="color:#666;font-size:13px">이 창은 자동으로 닫히지 않습니다. 화면을 캡처해 주세요.</p>
</body></html>`;
  return {code, body};
}

export default async function handler(req, res){
  const q = req.query || {};
  const code  = typeof q.code  === 'string' ? q.code  : '';
  const state = typeof q.state === 'string' ? q.state : '';

  if (!code)         return res.status(400).send(page({ error:'missing_code', q },400).body);
  if (!CLIENT_SECRET)return res.status(500).send(page({ error:'missing_client_secret_env', env:'GITHUB_CLIENT_SECRET' },500).body);

  const fetchUrl = 'https://github.com/login/oauth/access_token';
  const reqBody  = new URLSearchParams({
    client_id: CLIENT_ID,
    client_secret: CLIENT_SECRET,
    code,
    redirect_uri: REDIRECT_URI,
    state
  });
  const reqHeaders = {
    'Accept':'application/json',
    'Content-Type':'application/x-www-form-urlencoded'
  };

  try{
    const tokenRes = await fetch(fetchUrl, { method: 'POST', headers: reqHeaders, body: reqBody });

    let data, rawText = null;
    try { data = await tokenRes.json(); }
    catch { rawText = await tokenRes.text(); data = { _rawText: rawText }; }

    if (!tokenRes.ok || data.error){
      const {body} = page({
        error:'token_exchange_failed',
        status: tokenRes.status,
        data,
        diag:{
          client_id_full: CLIENT_ID,
          redirect_uri_used: REDIRECT_URI,
          secret_len: CLIENT_SECRET.length
        },
        sent:{ url: fetchUrl, body: String(reqBody), headers: reqHeaders }
      },500);
      return res.status(500).send(body);
    }

    const token = typeof data.access_token === 'string' ? data.access_token : '';
    if (!token) return res.status(500).send(page({ error:'no_token', data },500).body);

    res.setHeader('Content-Type','text/html; charset=utf-8');
    res.send(`<!doctype html><html><body><script>
      (function(){
        try{ window.opener.postMessage({ token: ${JSON.stringify(token)} }, "*"); }catch(e){}
        window.close();
      })();
    </script></body></html>`);
  }catch(e){
    const {body} = page({
      error:'callback_crashed',
      message:String(e),
      diag:{ client_id_full: CLIENT_ID, redirect_uri_used: REDIRECT_URI, secret_len: CLIENT_SECRET.length },
      sent_try:{ url: fetchUrl, body: String(reqBody), headers: reqHeaders }
    },500);
    res.status(500).send(body);
  }
}

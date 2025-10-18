// ✅ Vercel 런타임 지정 (허용값: 'nodejs')
export const config = { runtime: 'nodejs' };

// /api/callback : code → access_token 교환 후 CMS로 토큰 전달
export default async function handler(req, res) {
  try {
    const clientId = process.env.GITHUB_CLIENT_ID;
    const clientSecret = process.env.GITHUB_CLIENT_SECRET;
    if (!clientId || !clientSecret)
      return res.status(500).send("Missing client env vars");

    const code = req.query.code;
    const state = decodeURIComponent(req.query.state || ""); // origin
    if (!code || !state) return res.status(400).send("Missing code/state");

    const tokenResp = await fetch("https://github.com/login/oauth/access_token", {
      method: "POST",
      headers: { "Accept": "application/json", "Content-Type": "application/json" },
      body: JSON.stringify({
        client_id: clientId,
        client_secret: clientSecret,
        code,
        redirect_uri: `https://${req.headers.host}/api/callback`
      })
    });

    const data = await tokenResp.json();
    const token = data.access_token;
    if (!token) {
      console.error("Token exchange failed:", data);
      return res.status(500).send("Token exchange failed");
    }

    const html = `
<!doctype html><html><body>
<script>
  (function(){
    var origin = ${JSON.stringify(state)};
    var token  = ${JSON.stringify(token)};
    window.opener && window.opener.postMessage(
      'authorization:github:success:' + token,
      origin
    );
    window.close();
  })();
</script>
인증 처리 중…
</body></html>`;
    res.setHeader("Content-Type", "text/html; charset=utf-8");
    res.end(html);
  } catch (e) {
    console.error(e);
    res.status(500).send("callback error");
  }
}

// 런타임 고정
export const config = { runtime: 'nodejs18.x' };

// /api/auth : Decap이 ?provider=github&site_id=skdidbstkd.github.io 형태로 호출
export default async function handler(req, res) {
  try {
    const clientId = process.env.GITHUB_CLIENT_ID;
    const allowed = (process.env.ALLOWED_ORIGINS || "")
      .split(",").map(s => s.trim()).filter(Boolean);

    if (!clientId) return res.status(500).send("Missing GITHUB_CLIENT_ID");

    // 1) site_id 파라미터(예: skdidbstkd.github.io) → https:// 붙여 origin 추정
    let origin = req.query.site_id ? `https://${req.query.site_id}` : "";

    // 2) 없으면 Referer/Origin 헤더에서 추정
    if (!origin) {
      const ref = req.headers.referer || req.headers.origin || "";
      try { origin = new URL(ref).origin; } catch {}
    }

    // 최종 검증
    if (!origin) return res.status(400).send("Origin not detected");
    const ok = allowed.some(a => origin.startsWith(a));
    if (!ok) return res.status(400).send("Origin not allowed");

    const base = `https://${req.headers.host}`;
    const redirectUri = `${base}/api/callback`;

    const url = new URL("https://github.com/login/oauth/authorize");
    url.searchParams.set("client_id", clientId);
    url.searchParams.set("redirect_uri", redirectUri);
    url.searchParams.set("scope", "repo,user");
    // postMessage 대상으로 쓸 origin을 state에 보관
    url.searchParams.set("state", encodeURIComponent(origin));

    res.writeHead(302, { Location: url.toString() });
    res.end();
  } catch (e) {
    console.error(e);
    res.status(500).send("auth error");
  }
}

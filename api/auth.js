// Vercel에 Node 런타임 강제
export const config = { runtime: 'nodejs18.x' };

// /api/auth  (로그인 시작: GitHub authorize로 리다이렉트)
export default async function handler(req, res) {
  try {
    const clientId = process.env.GITHUB_CLIENT_ID;
    const allowed = (process.env.ALLOWED_ORIGINS || "")
      .split(",").map(s => s.trim()).filter(Boolean);
    const origin = req.query.origin || ""; // CMS가 전달

    if (!clientId) return res.status(500).send("Missing GITHUB_CLIENT_ID");
    if (!allowed.find(a => origin.startsWith(a)))
      return res.status(400).send("Origin not allowed");

    const base = `https://${req.headers.host}`;
    const redirectUri = `${base}/api/callback`;

    const url = new URL("https://github.com/login/oauth/authorize");
    url.searchParams.set("client_id", clientId);
    url.searchParams.set("redirect_uri", redirectUri);
    url.searchParams.set("scope", "repo,user");
    url.searchParams.set("state", encodeURIComponent(origin));

    res.writeHead(302, { Location: url.toString() });
    res.end();
  } catch (e) {
    console.error(e);
    res.status(500).send("auth error");
  }
}

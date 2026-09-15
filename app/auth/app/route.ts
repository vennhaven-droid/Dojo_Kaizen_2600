import { NextResponse } from "next/server";

const APP_CALLBACK = "dojokaizen://auth/callback";

export async function GET(request: Request) {
  const incoming = new URL(request.url);
  const target = new URL(APP_CALLBACK);
  incoming.searchParams.forEach((value, key) => {
    target.searchParams.set(key, value);
  });
  const deepLink = target.toString();
  const html = `<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <meta http-equiv="refresh" content="0;url=${deepLink}" />
    <title>Opening Dojo Kaizen</title>
  </head>
  <body style="background:#0B0B0B;color:#F4F4F4;font-family:sans-serif;padding:32px;text-align:center">
    <p>Returning to the Dojo Kaizen app…</p>
    <p><a href="${deepLink}" style="color:#F2C94C">Open the app</a></p>
    <script>location.replace(${JSON.stringify(deepLink)});</script>
  </body>
</html>`;

  return new NextResponse(html, {
    status: 302,
    headers: {
      Location: deepLink,
      "Content-Type": "text/html; charset=utf-8",
      "Cache-Control": "no-store",
    },
  });
}

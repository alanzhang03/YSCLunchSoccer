const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001";

export async function GET(request, { params }) {
  return proxyRequest(request, params.path);
}

export async function POST(request, { params }) {
  return proxyRequest(request, params.path);
}

async function proxyRequest(request, pathSegments) {
  const path = Array.isArray(pathSegments)
    ? pathSegments.join("/")
    : pathSegments;
  const url = new URL(request.url);
  const backendUrl = `${BACKEND_URL}/api/auth/${path}${url.search}`;

  try {
    const body = request.method === "POST" ? await request.text() : undefined;
    const headers = {
      "Content-Type": "application/json",
      "X-Proxy-Request": "true",
      "X-Forwarded-Host": url.host,
    };

    const cookies = request.headers.get("cookie");
    if (cookies) {
      headers["Cookie"] = cookies;
    }

    const response = await fetch(backendUrl, {
      method: request.method,
      headers,
      body,
    });

    const data = await response.text();
    let jsonData;
    try {
      jsonData = JSON.parse(data);
    } catch {
      jsonData = data;
    }

    const responseHeaders = new Headers();

    const setCookieHeader = response.headers.get("set-cookie");
    if (setCookieHeader) {
      const cookies = Array.isArray(setCookieHeader)
        ? setCookieHeader
        : [setCookieHeader];
      const rewrittenCookies = cookies.map((cookie) => {
        return cookie
          .replace(/Domain=[^;]+/gi, "")
          .replace(/SameSite=None/gi, "SameSite=Lax")
          .replace(/;\s*;/g, ";")
          .replace(/;\s*$/, "");
      });
      rewrittenCookies.forEach((cookie) => {
        responseHeaders.append("Set-Cookie", cookie);
      });
    }

    return new Response(JSON.stringify(jsonData), {
      status: response.status,
      statusText: response.statusText,
      headers: responseHeaders,
    });
  } catch (error) {
    console.error("Proxy error:", error);
    return new Response(JSON.stringify({ error: "Proxy request failed" }), {
      status: 500,
    });
  }
}

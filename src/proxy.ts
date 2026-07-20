import { NextResponse, type NextRequest } from "next/server";

/**
 * Server-side gate for /admin.
 *
 * Next 16 renamed the `middleware` file convention to `proxy` (the function must
 * be named `proxy` or be the default export), and it runs on the Node.js runtime
 * by default — setting a `runtime` config here throws.
 *
 * Why this exists: the admin UI was previously guarded only by <AdminGate>, a
 * client component. That is a rendering decision, not authorization — anyone
 * could open /admin and get the admin shell. The backend already enforces real
 * authorization on admin data (GET /analytics requires ROLE_ADMIN), so this is
 * the missing edge: stop unauthenticated requests before a page renders.
 *
 * Layering (per the Next auth guide): the API remains the authoritative check;
 * this gate is the route-level filter. It is deliberately NOT a presence check —
 * customers and admins share one `lynxiglam_session` cookie, so "a session cookie
 * exists" proves nothing about being an admin. We therefore ask the backend.
 *
 * The guide warns against per-request network calls in proxy because it also runs
 * on prefetches. That warning is about hot public routes; /admin is low-traffic
 * and sensitive, so one round-trip per admin navigation is the right trade — it
 * buys a real gate instead of a forgeable hint.
 */

const SESSION_COOKIE = "lynxiglam_session";
const LOGIN_PATH = "/admin/login";

/** Mock mode has no backend to ask, and the admin area is open by design there. */
function usingMock(): boolean {
  return (process.env.NEXT_PUBLIC_DATA_SOURCE ?? "mock") !== "api";
}

function apiBaseUrl(): string {
  return process.env.NEXT_PUBLIC_API_URL ?? "";
}

function redirectToLogin(request: NextRequest): NextResponse {
  const url = request.nextUrl.clone();
  url.pathname = LOGIN_PATH;
  url.search = "";
  // Preserve where they were headed so login can send them back.
  const target = request.nextUrl.pathname + request.nextUrl.search;
  if (target && target !== LOGIN_PATH) url.searchParams.set("next", target);
  return NextResponse.redirect(url);
}

export async function proxy(request: NextRequest): Promise<NextResponse> {
  const { pathname } = request.nextUrl;

  // The login page itself must stay reachable, or this redirects to itself forever.
  if (pathname === LOGIN_PATH) return NextResponse.next();

  if (usingMock()) return NextResponse.next();

  const session = request.cookies.get(SESSION_COOKIE)?.value;
  if (!session) return redirectToLogin(request);

  const base = apiBaseUrl();
  if (!base) {
    // api mode without a configured API URL is a misconfiguration. Fail closed:
    // an auth gate that opens when it cannot check is not a gate.
    console.error("proxy: NEXT_PUBLIC_API_URL is not set; refusing /admin access");
    return redirectToLogin(request);
  }

  try {
    const response = await fetch(`${base}/admin/session`, {
      headers: { cookie: `${SESSION_COOKIE}=${session}` },
      // Never let a cached 200 keep a signed-out session alive.
      cache: "no-store",
      signal: AbortSignal.timeout(5000),
    });
    if (!response.ok) return redirectToLogin(request);
    const body = (await response.json()) as { authenticated?: boolean };
    if (body.authenticated !== true) return redirectToLogin(request);
  } catch {
    // Backend down, DNS failure, timeout — fail closed.
    return redirectToLogin(request);
  }

  return NextResponse.next();
}

export const config = {
  // `/admin/:path*` alone does not match the bare `/admin`, so list both.
  matcher: ["/admin", "/admin/:path*"],
};

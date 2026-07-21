import type { NextConfig } from "next";

// A production build with the mock data source ships a COMPLETELY OPEN /admin.
// NEXT_PUBLIC_* is inlined at build time in the Node.js environment too, so
// `usingMock()` in src/proxy.ts folds to a constant and the whole gate — cookie
// check, backend call, fail-closed redirect — is dead-code-eliminated. The
// compiled proxy becomes `return NextResponse.next()`. AdminGate degrades the
// same way (getAdminSession() returns {authenticated:true} under mock).
//
// deploy/build.sh already refuses such a build, but that guard lives in one
// script: `npm run build` by hand, or any future artifact-based deploy, would
// produce the open build silently. Fail here instead, where every build path
// goes through.
//
// CI and local production-mode smoke builds set LYNXIGLAM_ALLOW_MOCK_BUILD=1 —
// an explicit, greppable opt-out rather than a silent default.
if (
  process.env.NODE_ENV === "production" &&
  (process.env.NEXT_PUBLIC_DATA_SOURCE ?? "mock") !== "api" &&
  process.env.LYNXIGLAM_ALLOW_MOCK_BUILD !== "1"
) {
  throw new Error(
    "Refusing to build: NEXT_PUBLIC_DATA_SOURCE is not 'api'. A mock production " +
      "build serves /admin/* to everyone because the proxy gate is compiled away. " +
      "Set NEXT_PUBLIC_DATA_SOURCE=api, or LYNXIGLAM_ALLOW_MOCK_BUILD=1 if this is " +
      "deliberately a throwaway build.",
  );
}

const nextConfig: NextConfig = {
  output: "standalone",

  images: {
    // Nothing imports next/image (verified: zero hits for "next/image" in src/),
    // but leaving the optimizer enabled still exposes /_next/image. nginx has
    // locations for /_next/static/, /images/ and /videos/ but none for
    // /_next/image, so it falls through to `location /` and reaches Node —
    // routing straight around the asset offload that exists to keep 137MB of
    // images out of the web cgroup.
    //
    // Unauthenticated GET /_next/image?url=%2Fimages%2FSea_Spell.png&w=3840
    // makes Node decode a 6.7MB PNG inside MemoryMax=512M / MemorySwapMax=0.
    // Animated GIFs are worse: the optimizer skips sharp and buffers the whole
    // file, and public/images holds ~80MB of GIFs (largest 18.7MB). nginx
    // allows 20 concurrent connections per IP, so ~360MB of off-heap buffers
    // crosses MemoryHigh=448M into reclaim thrash and then the cgroup OOM
    // killer. Restart=always then loops it.
    //
    // unoptimized:true also drops sharp from the standalone trace.
    unoptimized: true,
  },
};

export default nextConfig;

"use client";

/**
 * Last-resort boundary: catches failures in the root layout itself, where
 * error.tsx cannot help. Must render its own <html>/<body>.
 */
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="zh-CN">
      <body
        style={{
          display: "flex",
          minHeight: "100vh",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: "system-ui, sans-serif",
          background: "#fbf6f3",
          color: "#2d2d2c",
          textAlign: "center",
          padding: "0 16px",
        }}
      >
        <h1 style={{ fontSize: 28, fontWeight: 500 }}>站点暂时无法访问</h1>
        <p style={{ marginTop: 12, color: "#6b6b6a" }}>请稍后重试。</p>
        {error.digest && (
          <p style={{ marginTop: 8, fontSize: 12, color: "#9a9a99" }}>错误编号：{error.digest}</p>
        )}
        <button
          type="button"
          onClick={reset}
          style={{
            marginTop: 32,
            background: "#b6637b",
            color: "#fff",
            border: 0,
            padding: "12px 24px",
            fontSize: 13,
            letterSpacing: "0.12em",
            textTransform: "uppercase",
            cursor: "pointer",
          }}
        >
          重试
        </button>
      </body>
    </html>
  );
}

/**
 * JSX para ImageResponse (next/og). Solo estilos soportados por el motor OG.
 */
export function OgPreview1200() {
  return (
    <div
      style={{
        height: "100%",
        width: "100%",
        display: "flex",
        flexDirection: "column",
        alignItems: "flex-start",
        justifyContent: "space-between",
        background: "linear-gradient(145deg, #020617 0%, #0f172a 45%, #1e1b4b 100%)",
        padding: 64,
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
        <span style={{ fontSize: 56 }}>🛰️</span>
        <span
          style={{
            fontSize: 72,
            fontWeight: 800,
            color: "#f1f5f9",
            letterSpacing: "-0.04em",
          }}
        >
          NERV
        </span>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
        <div
          style={{
            fontSize: 38,
            fontWeight: 700,
            color: "#e2e8f0",
            lineHeight: 1.25,
            maxWidth: 900,
          }}
        >
          GTM Intelligence OS — Fintech Latam
        </div>
        <div style={{ fontSize: 26, color: "#94a3b8", maxWidth: 820, lineHeight: 1.45 }}>
          Dossier forense, ICP y plan de ataque en segundos. 1,899 empresas en base.
        </div>
      </div>
      <div
        style={{
          fontSize: 20,
          color: "#64748b",
          letterSpacing: "0.12em",
          textTransform: "uppercase",
          fontWeight: 600,
        }}
      >
        Operación Nexo
      </div>
    </div>
  );
}

export function AppleIcon180() {
  return (
    <div
      style={{
        height: "100%",
        width: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "linear-gradient(145deg, #020617 0%, #1e1b4b 100%)",
      }}
    >
      <span style={{ fontSize: 100 }}>🛰️</span>
    </div>
  );
}

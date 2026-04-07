import Link from "next/link";

/**
 * Landing page pública de NERV.
 * Server Component — sin "use client", sin JS adicional.
 */
export default function LandingPage() {
  return (
    <main style={{
      minHeight: "100vh",
      background: "#000000",
      fontFamily: "var(--font-dm-sans, DM Sans, sans-serif)",
      color: "#f1f5f9",
      overflowX: "hidden",
    }}>
      {/* ── Glow background ── */}
      <div style={{ position: "fixed", inset: 0, pointerEvents: "none", overflow: "hidden" }}>
        <div style={{
          position: "absolute", top: "-10%", left: "30%",
          width: "700px", height: "700px",
          background: "radial-gradient(circle, rgba(59,130,246,0.10) 0%, transparent 65%)",
          borderRadius: "50%",
        }} />
        <div style={{
          position: "absolute", bottom: "0%", right: "15%",
          width: "500px", height: "500px",
          background: "radial-gradient(circle, rgba(124,58,237,0.08) 0%, transparent 65%)",
          borderRadius: "50%",
        }} />
      </div>

      {/* ── Nav ── */}
      <nav style={{
        position: "relative", zIndex: 10,
        display: "flex", justifyContent: "space-between", alignItems: "center",
        padding: "24px 48px",
        borderBottom: "1px solid rgba(255,255,255,0.05)",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <span style={{ fontSize: 22 }}>🛰️</span>
          <span style={{ fontSize: 18, fontWeight: 800, letterSpacing: "-0.02em" }}>NERV</span>
        </div>
        <Link href="/login" style={{
          padding: "10px 24px",
          background: "linear-gradient(135deg, #1d4ed8, #7c3aed)",
          color: "white", borderRadius: 10, fontSize: 14, fontWeight: 700,
          textDecoration: "none", letterSpacing: "0.01em",
        }}>
          Acceder al Sistema →
        </Link>
      </nav>

      {/* ── Hero ── */}
      <section style={{
        position: "relative", zIndex: 10,
        textAlign: "center",
        padding: "120px 24px 100px",
        maxWidth: 800, margin: "0 auto",
      }}>
        <div style={{
          display: "inline-block",
          background: "rgba(59,130,246,0.12)",
          border: "1px solid rgba(59,130,246,0.25)",
          borderRadius: 100, padding: "6px 16px",
          fontSize: 12, fontWeight: 600, letterSpacing: "0.08em",
          textTransform: "uppercase", color: "#60a5fa",
          marginBottom: 32,
        }}>
          GTM Intelligence OS — Fintech Latam
        </div>

        <h1 style={{
          fontSize: "clamp(38px, 6vw, 66px)",
          fontWeight: 900, lineHeight: 1.08,
          letterSpacing: "-0.03em",
          margin: "0 0 24px",
          background: "linear-gradient(135deg, #f1f5f9 0%, #94a3b8 100%)",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
        }}>
          El sistema nervioso del ecosistema Fintech Latam
        </h1>

        <p style={{
          fontSize: 18, color: "#64748b", lineHeight: 1.7,
          maxWidth: 580, margin: "0 auto 48px",
          fontWeight: 400,
        }}>
          NERV analiza 1,899 empresas en tiempo real con tres agentes IA para entregarte
          el dossier forense y el plan de ataque perfecto — en segundos.
        </p>

        <div style={{ display: "flex", gap: 16, justifyContent: "center", flexWrap: "wrap" }}>
          <Link href="/login" style={{
            padding: "16px 40px",
            background: "linear-gradient(135deg, #1d4ed8, #7c3aed)",
            color: "white", borderRadius: 12,
            fontSize: 16, fontWeight: 700, textDecoration: "none",
            boxShadow: "0 0 40px rgba(59,130,246,0.25)",
            letterSpacing: "0.01em",
          }}>
            Solicitar acceso →
          </Link>
          <a href="#features" style={{
            padding: "16px 40px",
            background: "rgba(255,255,255,0.04)",
            border: "1px solid rgba(255,255,255,0.08)",
            color: "#94a3b8", borderRadius: 12,
            fontSize: 16, fontWeight: 600, textDecoration: "none",
          }}>
            Ver cómo funciona
          </a>
        </div>

        {/* Stats */}
        <div style={{
          display: "flex", justifyContent: "center", gap: 48,
          marginTop: 72, flexWrap: "wrap",
        }}>
          {[
            { num: "1,899", label: "Empresas en la base" },
            { num: "3", label: "Agentes IA en paralelo" },
            { num: "< 30s", label: "Dossier forense completo" },
          ].map((s) => (
            <div key={s.num} style={{ textAlign: "center" }}>
              <div style={{ fontSize: 32, fontWeight: 900, letterSpacing: "-0.03em", color: "#f1f5f9" }}>
                {s.num}
              </div>
              <div style={{ fontSize: 13, color: "#475569", marginTop: 4 }}>{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Features ── */}
      <section id="features" style={{
        position: "relative", zIndex: 10,
        padding: "80px 24px",
        maxWidth: 1100, margin: "0 auto",
      }}>
        <h2 style={{
          textAlign: "center", fontSize: 34, fontWeight: 800,
          letterSpacing: "-0.02em", marginBottom: 60, color: "#f1f5f9",
        }}>
          Tres agentes. Un dossier.
        </h2>

        <div style={{
          display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
          gap: 24,
        }}>
          {[
            {
              icon: "🔍",
              title: "Cosechador — Facts & Signals",
              desc: "Extrae señales forenses reales de Supabase: stack tecnológico, dolores de integración, señales de crecimiento y datos regulatorios del mercado.",
            },
            {
              icon: "⚔️",
              title: "Retador — Red Team Interno",
              desc: "Destruye tu propuesta antes de que lo haga el CTO del cliente. Identifica las 3 objeciones críticas que pueden hundirte en la reunión.",
            },
            {
              icon: "🧠",
              title: "Sintetizador — RaiSE v3.1",
              desc: "Fusiona hechos + crítica en un Dossier Forense con Schwerpunkt, flanqueo, apertura exacta y ICP Score calibrado.",
            },
            {
              icon: "📚",
              title: "RAG Knowledge Base",
              desc: "Cada análisis cita evidencia documental verificada: regulaciones (SPEI, CONDUSEF, BACEN), reportes de fraude, tendencias del ecosistema.",
            },
            {
              icon: "🎯",
              title: "Inteligencia de Tier",
              desc: "Tier 1 Estratégico (MEDDICII + Schwerpunkt), Tier 2 Técnico (SPIN), Tier 3 Volumen (Predictable Revenue). La estrategia correcta para cada tipo de deal.",
            },
            {
              icon: "🌎",
              title: "Cobertura Latam Real",
              desc: "México, Colombia, Brasil, Chile, Argentina, Perú. Verticales: Payments, Lending, Digital Banking, Open Finance, Insurtech, Crypto y más.",
            },
          ].map((f) => (
            <div key={f.title} style={{
              background: "rgba(15,23,42,0.8)",
              border: "1px solid rgba(255,255,255,0.07)",
              borderRadius: 14, padding: "28px 32px",
            }}>
              <div style={{ fontSize: 32, marginBottom: 16 }}>{f.icon}</div>
              <h3 style={{
                fontSize: 16, fontWeight: 700, color: "#f1f5f9",
                margin: "0 0 10px", letterSpacing: "-0.01em",
              }}>
                {f.title}
              </h3>
              <p style={{
                fontSize: 14, color: "#64748b", lineHeight: 1.6, margin: 0,
              }}>
                {f.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Tech Stack ── */}
      <section style={{
        position: "relative", zIndex: 10,
        textAlign: "center", padding: "60px 24px",
        borderTop: "1px solid rgba(255,255,255,0.05)",
      }}>
        <p style={{ fontSize: 12, color: "#334155", letterSpacing: "0.1em", textTransform: "uppercase", fontWeight: 600, marginBottom: 24 }}>
          Powered by
        </p>
        <div style={{ display: "flex", justifyContent: "center", gap: 32, flexWrap: "wrap", alignItems: "center" }}>
          {["Gemini 2.5 Flash", "Supabase pgvector", "Next.js 15", "Vercel Edge"].map((t) => (
            <span key={t} style={{
              fontSize: 13, color: "#475569", fontWeight: 600,
              background: "rgba(255,255,255,0.03)",
              border: "1px solid rgba(255,255,255,0.06)",
              borderRadius: 8, padding: "8px 18px",
            }}>
              {t}
            </span>
          ))}
        </div>
      </section>

      {/* ── CTA Final ── */}
      <section style={{
        position: "relative", zIndex: 10,
        textAlign: "center", padding: "100px 24px",
      }}>
        <h2 style={{
          fontSize: "clamp(28px, 4vw, 44px)", fontWeight: 900,
          letterSpacing: "-0.02em", marginBottom: 16, color: "#f1f5f9",
        }}>
          Listo para entrar al sistema
        </h2>
        <p style={{ fontSize: 16, color: "#64748b", marginBottom: 40 }}>
          Acceso por invitación. Sin tarjeta de crédito.
        </p>
        <Link href="/login" style={{
          padding: "18px 52px",
          background: "linear-gradient(135deg, #1d4ed8, #7c3aed)",
          color: "white", borderRadius: 12,
          fontSize: 17, fontWeight: 700, textDecoration: "none",
          boxShadow: "0 0 60px rgba(59,130,246,0.2)",
        }}>
          Solicitar acceso →
        </Link>
      </section>

      {/* ── Footer ── */}
      <footer style={{
        position: "relative", zIndex: 10,
        borderTop: "1px solid rgba(255,255,255,0.05)",
        padding: "32px 48px",
        display: "flex", justifyContent: "space-between", alignItems: "center",
        flexWrap: "wrap", gap: 12,
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ fontSize: 18 }}>🛰️</span>
          <span style={{ fontSize: 14, fontWeight: 700, color: "#475569" }}>NERV</span>
          <span style={{ fontSize: 12, color: "#334155" }}>— GTM Intelligence OS v3.6</span>
        </div>
        <span style={{ fontSize: 12, color: "#334155" }}>
          Fintech Latam · 1,899 empresas · McKinsey Grade Engine
        </span>
      </footer>
    </main>
  );
}

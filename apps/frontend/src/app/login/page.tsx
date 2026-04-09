"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Si viene con error de callback, mostrarlo
    const params = new URLSearchParams(window.location.search);
    if (params.get("error") === "auth_failed") {
      setError("El enlace expiró o ya fue usado. Solicita uno nuevo.");
    }
  }, []);

  const handleLogin = async () => {
    if (!email.trim() || !email.includes("@")) {
      setError("Ingresa un email válido.");
      return;
    }
    setLoading(true);
    setError(null);

    // Siempre el origen de la página actual: si NEXT_PUBLIC_SITE_URL quedó como
    // localhost en el build, no debe pisar producción (magic link a localhost).
    const siteBase = window.location.origin.replace(/\/$/, "");
    const { error: authError } = await supabase.auth.signInWithOtp({
      email: email.trim().toLowerCase(),
      options: {
        emailRedirectTo: `${siteBase}/auth/callback`,
      },
    });

    setLoading(false);
    if (authError) {
      setError(authError.message);
    } else {
      setSent(true);
    }
  };

  return (
    <div style={{
      minHeight: "100vh",
      background: "#000000",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      fontFamily: "var(--font-dm-sans, DM Sans, sans-serif)",
      padding: "20px",
    }}>
      {/* Background glow */}
      <div style={{
        position: "fixed", inset: 0, overflow: "hidden", pointerEvents: "none",
      }}>
        <div style={{
          position: "absolute", top: "-20%", left: "50%", transform: "translateX(-50%)",
          width: "600px", height: "600px",
          background: "radial-gradient(circle, rgba(59,130,246,0.12) 0%, transparent 70%)",
          borderRadius: "50%",
        }} />
      </div>

      <div style={{
        position: "relative", zIndex: 10, width: "100%", maxWidth: 420,
        background: "rgba(15,23,42,0.95)",
        border: "1px solid rgba(255,255,255,0.08)",
        borderRadius: 16,
        padding: "48px 40px",
        boxShadow: "0 25px 50px rgba(0,0,0,0.5)",
      }}>
        {/* Logo */}
        <div style={{ textAlign: "center", marginBottom: 40 }}>
          <div style={{
            display: "inline-flex", alignItems: "center", justifyContent: "center",
            width: 56, height: 56,
            background: "linear-gradient(135deg, #1d4ed8, #7c3aed)",
            borderRadius: 14,
            marginBottom: 20,
            fontSize: 26,
          }}>🛰️</div>
          <h1 style={{
            fontSize: 26, fontWeight: 800, color: "#f1f5f9",
            margin: 0, letterSpacing: "-0.02em",
          }}>NERV</h1>
          <p style={{
            fontSize: 13, color: "#64748b", margin: "8px 0 0",
            letterSpacing: "0.08em", textTransform: "uppercase", fontWeight: 600,
          }}>
            GTM Intelligence OS
          </p>
        </div>

        {!sent ? (
          <>
            <div style={{ marginBottom: 24 }}>
              <label style={{
                display: "block", fontSize: 12, fontWeight: 600,
                color: "#94a3b8", marginBottom: 8, letterSpacing: "0.05em",
                textTransform: "uppercase",
              }}>
                Email de acceso
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleLogin()}
                placeholder="tu@empresa.com"
                style={{
                  width: "100%", padding: "14px 16px",
                  background: "rgba(255,255,255,0.04)",
                  border: "1px solid rgba(255,255,255,0.1)",
                  borderRadius: 10, color: "#f1f5f9", fontSize: 15,
                  outline: "none", boxSizing: "border-box",
                  transition: "border-color 0.2s",
                }}
                onFocus={(e) => (e.target.style.borderColor = "#3b82f6")}
                onBlur={(e) => (e.target.style.borderColor = "rgba(255,255,255,0.1)")}
              />
            </div>

            {error && (
              <div style={{
                background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)",
                borderRadius: 8, padding: "10px 14px", marginBottom: 16,
                fontSize: 13, color: "#fca5a5",
              }}>
                {error}
              </div>
            )}

            <button
              onClick={handleLogin}
              disabled={loading}
              style={{
                width: "100%", padding: "14px",
                background: loading ? "#334155" : "linear-gradient(135deg, #1d4ed8, #7c3aed)",
                color: "white", border: "none", borderRadius: 10,
                fontSize: 15, fontWeight: 700, cursor: loading ? "not-allowed" : "pointer",
                transition: "opacity 0.2s", opacity: loading ? 0.7 : 1,
                letterSpacing: "0.01em",
              }}
            >
              {loading ? "Enviando enlace..." : "Acceder con enlace mágico"}
            </button>

            <p style={{
              marginTop: 20, fontSize: 12, color: "#475569",
              textAlign: "center", lineHeight: 1.5,
            }}>
              Sin contraseñas. Recibirás un enlace de acceso directo en tu bandeja de entrada.
            </p>
          </>
        ) : (
          <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: 52, marginBottom: 20 }}>📬</div>
            <h2 style={{
              fontSize: 20, fontWeight: 700, color: "#f1f5f9",
              margin: "0 0 12px",
            }}>
              Revisa tu email
            </h2>
            <p style={{
              fontSize: 14, color: "#64748b", lineHeight: 1.6, margin: 0,
            }}>
              Enviamos un enlace de acceso a<br />
              <strong style={{ color: "#94a3b8" }}>{email}</strong>
            </p>
            <p style={{ fontSize: 12, color: "#475569", marginTop: 20 }}>
              ¿No lo ves? Revisa spam o{" "}
              <button
                onClick={() => setSent(false)}
                style={{
                  background: "none", border: "none", color: "#3b82f6",
                  cursor: "pointer", fontSize: 12, textDecoration: "underline",
                }}
              >
                intenta de nuevo
              </button>
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

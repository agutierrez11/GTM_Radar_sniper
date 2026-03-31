"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import ReportView from "@/components/ReportView";

export default function SharedReportPage() {
  const params = useParams();
  const [reportData, setReportData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadReport() {
      try {
        const resp = await fetch(`/api/share?id=${params.id}`);
        if (!resp.ok) throw new Error("Reporte no encontrado");
        const json = await resp.json();
        setReportData(json.data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    if (params.id) loadReport();
  }, [params.id]);

  if (loading) return <div style={{ padding: 40, textAlign: 'center' }}>🛰️ Cargando reporte estratégico de NERV...</div>;
  if (error) return <div style={{ padding: 40, textAlign: 'center', color: 'red' }}>❌ Error: {error}</div>;

  return (
    <main style={{ background: "#fff", minHeight: "100vh" }}>
      <ReportView result={reportData} styles={sharedStyles} />
      
      {/* Branding fix for shared page */}
      <div style={{ textAlign: "center", padding: "2rem", borderTop: "1px solid #eee", background: "#f8fafc" }}>
        <p style={{ fontSize: "0.875rem", color: "#64748b" }}>
          Generado por <b>NERV</b> — El sistema nervioso de Fintech Latam.
        </p>
        <a href="/" style={{ color: "#0f172a", fontWeight: "bold", textDecoration: "none", fontSize: "0.875rem" }}>
          Analiza tu propia empresa →
        </a>
      </div>
    </main>
  );
}

// Re-using styles from NervForm (simplified for the shared page)
const sharedStyles: Record<string, React.CSSProperties> = {
  resultWrap: { maxWidth: 800, margin: "0 auto", padding: "2rem 1.5rem", fontFamily: "sans-serif" },
  resultHeader: { marginBottom: "1.5rem" },
  resultTitle: { fontSize: 32, fontWeight: 700, margin: "0 0 8px", color: "#0f172a" },
  resultMeta: { display: "flex", gap: 8 },
  tierBadge: { fontSize: 12, padding: "4px 10px", borderRadius: 99, background: "#0f172a", color: "#fff" },
  scoreBadge: { fontSize: 12, padding: "4px 10px", borderRadius: 99, background: "#f0fdf4", color: "#166534", border: "1px solid #bbf7d0" },
  resultGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 20 },
  card: { background: "#fff", border: "1px solid #f1f5f9", borderRadius: 12, padding: "20px" },
  cardTitle: { fontSize: 14, fontWeight: 600, color: "#0f172a", margin: "0 0 12px" },
  diagTable: { width: "100%", fontSize: 14 },
  diagLabel: { color: "#94a3b8", paddingRight: 12 },
  diagValue: { color: "#334155" },
  atacqueItem: { marginBottom: 12 },
  ataqueLabel: { fontSize: 11, fontWeight: 600, color: "#94a3b8", textTransform: "uppercase" },
  ataqueText: { fontSize: 14, color: "#334155" },
  auditItem: { marginBottom: 10 },
  auditLabel: { fontSize: 11, fontWeight: 600, color: "#94a3b8", textTransform: "uppercase" },
  auditText: { fontSize: 13, color: "#64748b" },
  confidenceBadge: { marginTop: 12, fontSize: 11, padding: "4px 8px", background: "#fefce8", borderRadius: 6 },
  tagsWrap: { display: "flex", flexWrap: "wrap", gap: 6 },
  tag: { fontSize: 12, padding: "4px 10px", borderRadius: 99, background: "#f1f5f9", border: "1px solid #e2e8f0" },
};

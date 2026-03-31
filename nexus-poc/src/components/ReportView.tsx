"use client";

import { MarketPulse } from "./MarketPulse";
import CommentsSection from "./CommentsSection";

interface ReportViewProps {
  result: any;
  styles: any;
}

export default function ReportView({ result, styles }: ReportViewProps) {
  if (!result) return null;

  return (
    <div style={styles.resultWrap}>
      <div style={styles.resultHeader}>
        <div>
          {result.target_account && (
            <div style={{ backgroundColor: '#e0f2fe', color: '#0369a1', padding: '8px 16px', borderRadius: '8px', marginBottom: 16, border: '1px solid #bae6fd', display: 'inline-flex', alignItems: 'center', gap: 8, fontSize: '0.875rem', fontWeight: 'bold' }}>
              🎯 MODO SURGICAL STRIKE (ABM): Atacando a {result.target_account}
            </div>
          )}
          <h1 style={styles.resultTitle}>{result.empresa}</h1>
          <div style={styles.resultMeta}>
            <span style={styles.tierBadge}>{result.tier}</span>
            <span style={styles.scoreBadge}>
              ICP {result.icp_score}/100
            </span>
          </div>
        </div>
      </div>

      <div style={styles.resultGrid} className="nerv-result-grid">
        {/* Diagnóstico */}
        <div style={styles.card} className="nerv-card">
          <h3 style={styles.cardTitle}>🔬 Diagnóstico NERV</h3>
          <table style={styles.diagTable}>
            <tbody>
              <tr>
                <td style={styles.diagLabel}>📋 Diagnóstico</td>
                <td style={styles.diagValue}>{result.diagnostico?.resfriado || "[PENDIENTE]"}</td>
              </tr>
              <tr>
                <td style={styles.diagLabel}>⚠️ Riesgo</td>
                <td style={styles.diagValue}>{result.diagnostico?.gripe || "[PENDIENTE]"}</td>
              </tr>
              <tr>
                <td style={styles.diagLabel}>💡 Oportunidad</td>
                <td style={styles.diagValue}>{result.diagnostico?.panuelo || "[PENDIENTE]"}</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Estrategia de Entrada */}
        <div style={styles.card} className="nerv-card">
          <h3 style={styles.cardTitle}>🚀 Estrategia de Entrada</h3>
          <div style={styles.atacqueItem}>
            <span style={styles.ataqueLabel}>Foco</span>
            <p style={styles.ataqueText}>{result.plan_ataque?.schwerpunkt || "[PENDIENTE]"}</p>
          </div>
          <div style={styles.atacqueItem}>
            <span style={styles.ataqueLabel}>Diferenciador</span>
            <p style={styles.ataqueText}>{result.plan_ataque?.flanqueo || "[PENDIENTE]"}</p>
          </div>
          <div style={{ ...styles.atacqueItem, background: "#f0fdf4", borderRadius: 8, padding: "10px 12px" }}>
            <span style={styles.ataqueLabel}>Apertura recomendada</span>
            <p style={{ ...styles.ataqueText, fontStyle: "italic" }}>
              "{result.plan_ataque?.apertura || "[MENSAJE_NO_DISPONIBLE]"}"
            </p>
          </div>
        </div>

        {/* Auditoría */}
        <div style={styles.card} className="nerv-card">
          <h3 style={styles.cardTitle}>🧠 Auditoría RaiSE</h3>
          <div style={styles.auditItem}>
            <span style={styles.auditLabel}>⚠️ Abogado del Diablo</span>
            <p style={styles.auditText}>{result.auditoria?.abogado_diablo || "[SIN_CRITICAS]"}</p>
          </div>
          <div style={styles.auditItem}>
            <span style={styles.auditLabel}>🔍 Sesgo detectado</span>
            <p style={styles.auditText}>{result.auditoria?.sesgo || "[SIN_SESGOS]"}</p>
          </div>
          <div style={styles.confidenceBadge}>
            Confianza general: {result.auditoria?.confianza || "BAJA"}
          </div>
        </div>

        {/* Similares */}
        {(result.similares?.length ?? 0) > 0 && (
          <div style={styles.card} className="nerv-card">
            <h3 style={styles.cardTitle}>🔗 Similares en el ecosistema</h3>
            <div style={styles.tagsWrap}>
              {result.similares.map((s: any, idx: number) => (
                <span key={idx} style={styles.tag}>{typeof s === 'string' ? s : s.name}</span>
              ))}
            </div>
          </div>
        )}

        {/* Competidores */}
        {(result.competidores?.length ?? 0) > 0 && (
          <div style={styles.card} className="nerv-card">
            <h3 style={styles.cardTitle}>⚔️ Competidores Reales</h3>
            <div style={styles.tagsWrap}>
              {result.competidores.map((c: any, idx: number) => (
                <span key={idx} style={{...styles.tag, background: "#fff1f2", color: "#9f1239"}}>{typeof c === 'string' ? c : c.name}</span>
              ))}
            </div>
          </div>
        )}

        {/* Market Pulse */}
        {result.empresaId && (
          <MarketPulse empresaId={result.empresaId} empresaNombre={result.empresa} />
        )}
      </div>
      
      <CommentsSection />
    </div>
  );
}

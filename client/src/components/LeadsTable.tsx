import { Network } from 'lucide-react';
import StatusBadge from './StatusBadge';
import ProgressBar from './ProgressBar';

/**
 * Leads Table Component
 * Design: SaaS professional data table (Linear/Vercel/Stripe inspired)
 * - Clean white background
 * - Subtle 0.5px borders
 * - Status badges with colors
 * - Progress bars for scores
 * - Contact column
 * - Signal & opportunity columns
 * - Graph view button on hover
 * - No military caps, professional typography
 */

interface Lead {
  id: string;
  company: string;
  contact?: string;
  country: string;
  tier: 'diamond' | 'gold' | 'silver';
  status: 'active' | 'pending' | 'high-potential';
  score: number;
  signal: string;
  opportunity: string;
}

interface LeadsTableProps {
  leads: Lead[];
  onRowClick?: (lead: Lead) => void;
}

export default function LeadsTable({ leads, onRowClick }: LeadsTableProps) {
  return (
    <div
      style={{
        background: '#ffffff',
        border: '1px solid #e5e7eb',
        borderRadius: '12px',
        overflow: 'hidden',
        boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
      }}
    >
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid #f3f4f6', background: '#fafafa' }}>
              {['Empresa', 'Contacto', 'País', 'Tier', 'Estado', 'Score', 'Señal', 'Oportunidad', ''].map((col) => (
                <th
                  key={col}
                  style={{
                    padding: '10px 16px',
                    textAlign: 'left',
                    fontSize: '11px',
                    fontWeight: 600,
                    color: '#9ca3af',
                    letterSpacing: '0.04em',
                    textTransform: 'uppercase',
                    fontFamily: 'Inter, system-ui, sans-serif',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {col}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {leads.map((lead, index) => (
              <tr
                key={lead.id}
                onClick={() => onRowClick?.(lead)}
                style={{
                  borderBottom: index < leads.length - 1 ? '1px solid #f3f4f6' : 'none',
                  background: '#ffffff',
                  cursor: 'pointer',
                  transition: 'background 0.12s ease',
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLTableRowElement).style.background = '#f0f7ff';
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLTableRowElement).style.background = '#ffffff';
                }}
              >
                {/* Empresa */}
                <td style={{ padding: '12px 16px', whiteSpace: 'nowrap' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div
                      style={{
                        width: '32px',
                        height: '32px',
                        borderRadius: '8px',
                        background: '#eff6ff',
                        border: '1px solid #bfdbfe',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '12px',
                        fontWeight: 600,
                        color: '#378ADD',
                        flexShrink: 0,
                        fontFamily: 'Inter, system-ui, sans-serif',
                      }}
                    >
                      {lead.company.charAt(0)}
                    </div>
                    <span
                      style={{
                        fontSize: '13px',
                        fontWeight: 500,
                        color: '#111827',
                        fontFamily: 'Inter, system-ui, sans-serif',
                      }}
                    >
                      {lead.company}
                    </span>
                  </div>
                </td>

                {/* Contacto */}
                <td style={{ padding: '12px 16px', whiteSpace: 'nowrap' }}>
                  <span
                    style={{
                      fontSize: '13px',
                      color: '#374151',
                      fontFamily: 'Inter, system-ui, sans-serif',
                    }}
                  >
                    {lead.contact || '—'}
                  </span>
                </td>

                {/* País */}
                <td style={{ padding: '12px 16px', whiteSpace: 'nowrap' }}>
                  <span
                    style={{
                      fontSize: '13px',
                      color: '#6b7280',
                      fontFamily: 'Inter, system-ui, sans-serif',
                    }}
                  >
                    {lead.country}
                  </span>
                </td>

                {/* Tier */}
                <td style={{ padding: '12px 16px', whiteSpace: 'nowrap' }}>
                  <StatusBadge status={lead.tier} />
                </td>

                {/* Estado */}
                <td style={{ padding: '12px 16px', whiteSpace: 'nowrap' }}>
                  <StatusBadge status={lead.status} />
                </td>

                {/* Score */}
                <td style={{ padding: '12px 16px', minWidth: '120px' }}>
                  <ProgressBar value={lead.score} />
                </td>

                {/* Señal */}
                <td style={{ padding: '12px 16px', maxWidth: '180px' }}>
                  <span
                    style={{
                      fontSize: '12px',
                      color: '#6b7280',
                      fontFamily: 'Inter, system-ui, sans-serif',
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden',
                    }}
                  >
                    {lead.signal}
                  </span>
                </td>

                {/* Oportunidad */}
                <td style={{ padding: '12px 16px', maxWidth: '180px' }}>
                  <span
                    style={{
                      fontSize: '12px',
                      color: '#374151',
                      fontFamily: 'Inter, system-ui, sans-serif',
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden',
                    }}
                  >
                    {lead.opportunity}
                  </span>
                </td>

                {/* Acción: Ver mapa */}
                <td style={{ padding: '12px 16px', whiteSpace: 'nowrap' }}>
                  <button
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '5px',
                      padding: '5px 10px',
                      borderRadius: '8px',
                      border: '1px solid #e5e7eb',
                      background: '#ffffff',
                      color: '#378ADD',
                      fontSize: '11px',
                      fontWeight: 500,
                      cursor: 'pointer',
                      transition: 'all 0.12s ease',
                      fontFamily: 'Inter, system-ui, sans-serif',
                    }}
                    onMouseEnter={(e) => {
                      (e.currentTarget as HTMLButtonElement).style.background = '#eff6ff';
                      (e.currentTarget as HTMLButtonElement).style.borderColor = '#bfdbfe';
                    }}
                    onMouseLeave={(e) => {
                      (e.currentTarget as HTMLButtonElement).style.background = '#ffffff';
                      (e.currentTarget as HTMLButtonElement).style.borderColor = '#e5e7eb';
                    }}
                  >
                    <Network size={12} />
                    Mapa
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {leads.length === 0 && (
        <div style={{ padding: '48px 24px', textAlign: 'center' }}>
          <p
            style={{
              fontSize: '14px',
              color: '#9ca3af',
              fontFamily: 'Inter, system-ui, sans-serif',
            }}
          >
            No se encontraron leads
          </p>
        </div>
      )}
    </div>
  );
}

// GTM Radar - Battle Cards View
// Design: SaaS Professional (Linear/Vercel/Stripe inspired)
// Paleta: Blanco, grises suaves, azul #378ADD
// Propósito: Preparar al vendedor antes de una llamada con un lead

import { useEffect, useState } from 'react';
import { ChevronDown, ChevronUp, Sparkles, Phone, Target, Users, Zap, Shield, Sword, FileText, ArrowRight, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { fetchLeadById, mapToBattleCards } from '@/lib/dataService';
import { type BattleCard, type LeadBattleCards } from '@/lib/battleCardData';

const CARD_ICONS: Record<string, React.ReactNode> = {
  company:          <Target size={14} />,
  'decision-makers': <Users size={14} />,
  pain:             <Zap size={14} />,
  'value-prop':     <ArrowRight size={14} />,
  competition:      <Sword size={14} />,
  objections:       <Shield size={14} />,
  script:           <Phone size={14} />,
  'next-steps':     <FileText size={14} />,
};

interface SingleCardProps {
  card: BattleCard;
}

function SingleCard({ card }: SingleCardProps) {
  const [expanded, setExpanded] = useState(false);
  const preview = card.content.slice(0, 2);
  const rest = card.content.slice(2);

  const handleAI = () => {
    toast.info(`Generando análisis IA para "${card.title}"`, {
      description: 'Conecta CrewAI backend para análisis automático',
      duration: 3000,
    });
  };

  return (
    <div style={{
      background: '#ffffff',
      border: '1px solid #e5e7eb',
      borderRadius: '10px',
      overflow: 'hidden',
      transition: 'box-shadow 0.15s ease, transform 0.15s ease',
      cursor: 'default',
    }}
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLDivElement).style.boxShadow = '0 4px 16px rgba(0,0,0,0.07)';
        (e.currentTarget as HTMLDivElement).style.transform = 'translateY(-1px)';
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLDivElement).style.boxShadow = 'none';
        (e.currentTarget as HTMLDivElement).style.transform = 'translateY(0)';
      }}
    >
      {/* Acento lateral de color */}
      <div style={{
        height: '3px',
        background: card.accentColor,
        borderRadius: '10px 10px 0 0',
      }} />

      {/* Header de la card */}
      <div style={{ padding: '14px 16px 10px', borderBottom: '1px solid #f3f4f6' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{
              width: '26px', height: '26px', borderRadius: '7px',
              background: `${card.accentColor}15`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: card.accentColor,
            }}>
              {CARD_ICONS[card.type]}
            </span>
            <span style={{
              fontSize: '13px', fontWeight: 600, color: '#111827',
              fontFamily: 'Inter, system-ui, sans-serif',
            }}>
              {card.icon} {card.title}
            </span>
          </div>
          <button
            onClick={handleAI}
            style={{
              background: 'transparent', border: 'none', cursor: 'pointer',
              color: '#9ca3af', padding: '3px 6px', borderRadius: '6px',
              display: 'flex', alignItems: 'center', gap: '4px',
              fontSize: '11px', fontFamily: 'Inter, system-ui, sans-serif',
              transition: 'all 0.15s ease',
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLButtonElement).style.background = '#f3f4f6';
              (e.currentTarget as HTMLButtonElement).style.color = '#378ADD';
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLButtonElement).style.background = 'transparent';
              (e.currentTarget as HTMLButtonElement).style.color = '#9ca3af';
            }}
            title="Generar con IA"
          >
            <Sparkles size={11} />
            IA
          </button>
        </div>
      </div>

      {/* Contenido */}
      <div style={{ padding: '12px 16px' }}>
        <ul style={{ margin: 0, padding: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '6px' }}>
          {preview.map((item, i) => (
            <li key={i} style={{ display: 'flex', gap: '8px', alignItems: 'flex-start' }}>
              <span style={{
                width: '5px', height: '5px', borderRadius: '50%',
                background: card.accentColor, marginTop: '6px', flexShrink: 0,
              }} />
              <span style={{
                fontSize: '12px', color: '#374151', lineHeight: '1.5',
                fontFamily: 'Inter, system-ui, sans-serif',
              }}>
                {item}
              </span>
            </li>
          ))}
          {expanded && rest.map((item, i) => (
            <li key={`rest-${i}`} style={{ display: 'flex', gap: '8px', alignItems: 'flex-start' }}>
              <span style={{
                width: '5px', height: '5px', borderRadius: '50%',
                background: card.accentColor, marginTop: '6px', flexShrink: 0,
              }} />
              <span style={{
                fontSize: '12px', color: '#374151', lineHeight: '1.5',
                fontFamily: 'Inter, system-ui, sans-serif',
              }}>
                {item}
              </span>
            </li>
          ))}
        </ul>

        {rest.length > 0 && (
          <button
            onClick={() => setExpanded(!expanded)}
            style={{
              marginTop: '10px', background: 'transparent', border: 'none',
              cursor: 'pointer', color: '#378ADD', fontSize: '11px', fontWeight: 500,
              display: 'flex', alignItems: 'center', gap: '4px',
              fontFamily: 'Inter, system-ui, sans-serif', padding: 0,
            }}
          >
            {expanded ? <><ChevronUp size={12} /> Ver menos</> : <><ChevronDown size={12} /> Ver {rest.length} más</>}
          </button>
        )}

        {/* Tip rápido */}
        {card.tip && (
          <div style={{
            marginTop: '10px', padding: '8px 10px',
            background: `${card.accentColor}08`,
            border: `1px solid ${card.accentColor}25`,
            borderRadius: '7px',
          }}>
            <span style={{
              fontSize: '11px', color: '#6b7280', fontStyle: 'italic',
              fontFamily: 'Inter, system-ui, sans-serif', lineHeight: '1.4',
            }}>
              💡 {card.tip}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}

interface BattleCardsProps {
  leadId: string;
}

export default function BattleCards({ leadId }: BattleCardsProps) {
  const [data, setData] = useState<LeadBattleCards | null>(null);

  if (!data) {
    return (
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        height: '300px', color: '#9ca3af',
        fontFamily: 'Inter, system-ui, sans-serif', fontSize: '14px',
      }}>
        Selecciona un lead para ver sus Battle Cards
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        marginBottom: '20px',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{
            width: '32px', height: '32px', borderRadius: '9px',
            background: '#eff6ff', border: '1px solid #bfdbfe',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '14px', fontWeight: 700, color: '#378ADD',
            fontFamily: 'Inter, system-ui, sans-serif',
          }}>
            {data.company.charAt(0)}
          </div>
          <div>
            <div style={{
              fontSize: '15px', fontWeight: 600, color: '#111827',
              fontFamily: 'Inter, system-ui, sans-serif',
            }}>
              {data.company}
            </div>
            <div style={{
              fontSize: '12px', color: '#9ca3af',
              fontFamily: 'Inter, system-ui, sans-serif',
            }}>
              {data.contact} · {data.role}
            </div>
          </div>
        </div>
        <div style={{ display: 'flex', gap: '6px' }}>
          <button
            onClick={() => toast.info('Exportar Battle Cards', { description: 'Disponible con backend conectado' })}
            style={{
              background: '#f9fafb', border: '1px solid #e5e7eb', borderRadius: '8px',
              padding: '6px 12px', cursor: 'pointer', fontSize: '12px', color: '#374151',
              fontFamily: 'Inter, system-ui, sans-serif', fontWeight: 500,
            }}
          >
            Exportar PDF
          </button>
          <button
            onClick={() => toast.info('Analizando todos los cards con CrewAI...', {
              description: '4 agentes: Research, Analysis, Strategy, Report',
              duration: 3000,
            })}
            style={{
              background: '#378ADD', border: 'none', borderRadius: '8px',
              padding: '6px 12px', cursor: 'pointer', fontSize: '12px', color: '#ffffff',
              fontFamily: 'Inter, system-ui, sans-serif', fontWeight: 500,
              display: 'flex', alignItems: 'center', gap: '5px',
            }}
          >
            <Sparkles size={12} />
            Analizar todo con IA
          </button>
        </div>
      </div>

      {/* Grid de cards: 4 columnas en desktop, 2 en tablet, 1 en mobile */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
        gap: '14px',
      }}>
        {data.cards.map((card) => (
          <SingleCard key={card.id} card={card} />
        ))}
      </div>
    </div>
  );
}

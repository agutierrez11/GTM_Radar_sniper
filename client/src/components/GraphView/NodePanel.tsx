// GTM Radar - Node Detail Panel
// Design: SaaS Professional (Linear/Vercel/Stripe inspired)
// Paleta: Blanco, grises suaves, azul #378ADD

import { X, Sparkles, ChevronRight } from 'lucide-react';
import { type LeadNode, NODE_COLORS } from '@/lib/graphData';
import { toast } from 'sonner';

interface NodePanelProps {
  node: LeadNode | null;
  leadName: string;
  onClose: () => void;
}

const AI_PROMPTS = [
  { label: 'Qué es', icon: '📌' },
  { label: 'Cómo actuar', icon: '🎯' },
  { label: 'Riesgos', icon: '⚠️' },
  { label: 'Oportunidades', icon: '💡' },
  { label: 'Preguntas clave', icon: '❓' },
  { label: 'Comparar', icon: '⚖️' },
];

export default function NodePanel({ node, leadName, onClose }: NodePanelProps) {
  if (!node) return null;

  const colors = NODE_COLORS[node.color] || NODE_COLORS.gray;

  const handleAIPrompt = (prompt: string) => {
    toast.info(`Generando: "${prompt}" para ${node.label}`, {
      description: 'Conecta CrewAI para análisis automático',
      duration: 3000,
    });
  };

  return (
    <div
      style={{
        width: '300px',
        background: '#ffffff',
        border: '1px solid #e5e7eb',
        borderRadius: '12px',
        boxShadow: '0 4px 24px rgba(0,0,0,0.08)',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        fontFamily: 'Inter, system-ui, sans-serif',
        maxHeight: 'calc(100vh - 180px)',
      }}
    >
      {/* Header */}
      <div
        style={{
          padding: '16px 20px',
          borderBottom: '1px solid #f3f4f6',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          background: colors.bg,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div
            style={{
              width: '10px',
              height: '10px',
              borderRadius: '50%',
              background: colors.badge,
              flexShrink: 0,
            }}
          />
          <span style={{ fontSize: '14px', fontWeight: 600, color: colors.text }}>
            {node.label}
          </span>
        </div>
        <button
          onClick={onClose}
          style={{
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            padding: '4px',
            borderRadius: '6px',
            color: '#9ca3af',
            display: 'flex',
            alignItems: 'center',
          }}
        >
          <X size={16} />
        </button>
      </div>

      {/* Lead context */}
      <div
        style={{
          padding: '8px 20px',
          background: '#f9fafb',
          borderBottom: '1px solid #f3f4f6',
        }}
      >
        <span style={{ fontSize: '11px', color: '#9ca3af' }}>
          Lead: <strong style={{ color: '#6b7280' }}>{leadName}</strong>
        </span>
      </div>

      {/* Content */}
      <div
        style={{
          padding: '16px 20px',
          flex: 1,
          overflowY: 'auto',
        }}
      >
        <p
          style={{
            fontSize: '13px',
            color: '#374151',
            lineHeight: '1.7',
            margin: 0,
            whiteSpace: 'pre-line',
          }}
        >
          {node.content}
        </p>
      </div>

      {/* AI Prompts */}
      <div
        style={{
          padding: '16px 20px',
          borderTop: '1px solid #f3f4f6',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            marginBottom: '10px',
          }}
        >
          <Sparkles size={13} color="#378ADD" />
          <span style={{ fontSize: '11px', fontWeight: 600, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Generar con IA
          </span>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px' }}>
          {AI_PROMPTS.map((prompt) => (
            <button
              key={prompt.label}
              onClick={() => handleAIPrompt(prompt.label)}
              style={{
                background: '#f9fafb',
                border: '1px solid #e5e7eb',
                borderRadius: '8px',
                padding: '7px 10px',
                fontSize: '11px',
                color: '#374151',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '5px',
                transition: 'all 0.15s ease',
                fontFamily: 'Inter, system-ui, sans-serif',
                textAlign: 'left',
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLButtonElement).style.background = '#eff6ff';
                (e.currentTarget as HTMLButtonElement).style.borderColor = '#bfdbfe';
                (e.currentTarget as HTMLButtonElement).style.color = '#1e40af';
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLButtonElement).style.background = '#f9fafb';
                (e.currentTarget as HTMLButtonElement).style.borderColor = '#e5e7eb';
                (e.currentTarget as HTMLButtonElement).style.color = '#374151';
              }}
            >
              <span>{prompt.icon}</span>
              <span>{prompt.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Footer action */}
      <div
        style={{
          padding: '12px 20px',
          borderTop: '1px solid #f3f4f6',
          background: '#fafafa',
        }}
      >
        <button
          onClick={() => toast.info('Conecta CrewAI para análisis completo automático')}
          style={{
            width: '100%',
            background: '#378ADD',
            border: 'none',
            borderRadius: '8px',
            padding: '9px 16px',
            fontSize: '12px',
            fontWeight: 500,
            color: '#ffffff',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '6px',
            transition: 'background 0.15s ease',
            fontFamily: 'Inter, system-ui, sans-serif',
          }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLButtonElement).style.background = '#2563eb';
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLButtonElement).style.background = '#378ADD';
          }}
        >
          <Sparkles size={13} />
          Análisis completo con IA
          <ChevronRight size={13} />
        </button>
      </div>
    </div>
  );
}

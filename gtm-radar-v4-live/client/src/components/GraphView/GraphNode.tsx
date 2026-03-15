// GTM Radar - Custom Graph Node Component
// Design: SaaS Professional (Linear/Vercel/Stripe inspired)
// Paleta: Blanco, grises suaves, azul #378ADD

import { Handle, Position, type NodeProps } from '@xyflow/react';
import { NODE_COLORS } from '@/lib/graphData';

interface GraphNodeData {
  label: string;
  content: string;
  color: 'blue' | 'green' | 'amber' | 'red' | 'purple' | 'gray';
  type: 'main' | 'concept' | 'detail';
  selected?: boolean;
  [key: string]: unknown;
}

export default function GraphNode({ data, selected }: NodeProps) {
  const nodeData = data as GraphNodeData;
  const colors = NODE_COLORS[nodeData.color] || NODE_COLORS.gray;
  const isMain = nodeData.type === 'main';

  return (
    <div
      style={{
        background: isMain ? '#378ADD' : colors.bg,
        border: `${selected ? '2px' : '1px'} solid ${isMain ? '#2563eb' : selected ? '#378ADD' : colors.border}`,
        borderRadius: isMain ? '12px' : '10px',
        padding: isMain ? '16px 20px' : '12px 16px',
        minWidth: isMain ? '200px' : '180px',
        maxWidth: isMain ? '220px' : '200px',
        boxShadow: selected
          ? '0 0 0 3px rgba(55,138,221,0.2), 0 4px 12px rgba(0,0,0,0.1)'
          : isMain
          ? '0 4px 16px rgba(55,138,221,0.3)'
          : '0 2px 8px rgba(0,0,0,0.06)',
        transition: 'all 0.2s ease',
        cursor: 'pointer',
      }}
    >
      <Handle
        type="target"
        position={Position.Top}
        style={{
          background: isMain ? '#fff' : colors.badge,
          width: 8,
          height: 8,
          border: `2px solid ${isMain ? '#378ADD' : colors.border}`,
        }}
      />

      {/* Label */}
      <div
        style={{
          fontSize: isMain ? '14px' : '12px',
          fontWeight: 600,
          color: isMain ? '#ffffff' : colors.text,
          marginBottom: '6px',
          fontFamily: 'Inter, system-ui, sans-serif',
          letterSpacing: '-0.01em',
        }}
      >
        {nodeData.label}
      </div>

      {/* Content preview */}
      <div
        style={{
          fontSize: '11px',
          color: isMain ? 'rgba(255,255,255,0.85)' : '#6b7280',
          lineHeight: '1.5',
          display: '-webkit-box',
          WebkitLineClamp: 3,
          WebkitBoxOrient: 'vertical',
          overflow: 'hidden',
          fontFamily: 'Inter, system-ui, sans-serif',
        }}
      >
        {nodeData.content}
      </div>

      {/* Badge indicator */}
      {!isMain && (
        <div
          style={{
            display: 'inline-block',
            marginTop: '8px',
            width: '6px',
            height: '6px',
            borderRadius: '50%',
            background: colors.badge,
          }}
        />
      )}

      <Handle
        type="source"
        position={Position.Bottom}
        style={{
          background: isMain ? '#fff' : colors.badge,
          width: 8,
          height: 8,
          border: `2px solid ${isMain ? '#378ADD' : colors.border}`,
        }}
      />
    </div>
  );
}

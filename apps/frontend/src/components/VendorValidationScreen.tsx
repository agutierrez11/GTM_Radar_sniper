'use client';

import React from 'react';

export interface VendorData {
  nombre: string;
  uvp: string;
  core: string;
  vertical: string;
  mercados_latam: string;
  killer_argument: string;
  strategic_hook: string;
  tier: string;
}

interface VendorValidationScreenProps {
  vendorData: VendorData;
  onConfirm: (vendorData: VendorData) => void;
  onReject: () => void;
}

const styles = {
  overlay: {
    position: 'fixed' as const,
    inset: 0,
    backgroundColor: 'rgba(0,0,0,0.75)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
    padding: '16px',
  },
  card: {
    backgroundColor: '#0a0a0a',
    border: '1px solid #1a1a1a',
    borderRadius: '12px',
    padding: '32px',
    maxWidth: '720px',
    width: '100%',
    position: 'relative' as const,
    boxShadow: '0 0 40px rgba(124,58,237,0.15)',
  },
  badge: {
    position: 'absolute' as const,
    top: '20px',
    right: '20px',
    backgroundColor: 'rgba(124,58,237,0.15)',
    border: '1px solid rgba(124,58,237,0.4)',
    color: '#a78bfa',
    fontSize: '10px',
    fontWeight: 700,
    letterSpacing: '0.08em',
    padding: '4px 10px',
    borderRadius: '999px',
    textTransform: 'uppercase' as const,
  },
  title: {
    color: '#ffffff',
    fontSize: '22px',
    fontWeight: 700,
    marginBottom: '6px',
    marginTop: 0,
    paddingRight: '160px',
  },
  subtitle: {
    color: '#6b7280',
    fontSize: '13px',
    marginBottom: '24px',
  },
  fieldGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
    gap: '12px',
    marginBottom: '20px',
  },
  fieldCard: {
    backgroundColor: '#111111',
    border: '1px solid #1f1f1f',
    borderRadius: '8px',
    padding: '14px',
  },
  fieldLabel: {
    color: '#7c3aed',
    fontSize: '10px',
    fontWeight: 700,
    letterSpacing: '0.08em',
    textTransform: 'uppercase' as const,
    marginBottom: '6px',
  },
  fieldValue: {
    color: '#ffffff',
    fontSize: '13px',
    lineHeight: 1.5,
    wordBreak: 'break-word' as const,
  },
  killerBox: {
    backgroundColor: 'rgba(124,58,237,0.08)',
    border: '1px solid rgba(124,58,237,0.3)',
    borderRadius: '8px',
    padding: '16px',
    marginBottom: '24px',
  },
  killerLabel: {
    color: '#7c3aed',
    fontSize: '10px',
    fontWeight: 700,
    letterSpacing: '0.08em',
    textTransform: 'uppercase' as const,
    marginBottom: '8px',
  },
  killerText: {
    color: '#e5e7eb',
    fontSize: '14px',
    lineHeight: 1.6,
    fontStyle: 'italic' as const,
  },
  buttonRow: {
    display: 'flex',
    gap: '12px',
    flexWrap: 'wrap' as const,
  },
  confirmButton: {
    backgroundColor: '#16a34a',
    color: '#ffffff',
    border: 'none',
    borderRadius: '8px',
    padding: '12px 22px',
    fontSize: '14px',
    fontWeight: 600,
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    flex: '1 1 auto',
    justifyContent: 'center',
    transition: 'background-color 0.15s ease',
  },
  rejectButton: {
    backgroundColor: '#1f1f1f',
    color: '#9ca3af',
    border: '1px solid #2a2a2a',
    borderRadius: '8px',
    padding: '12px 22px',
    fontSize: '14px',
    fontWeight: 500,
    cursor: 'pointer',
    flex: '0 0 auto',
    transition: 'background-color 0.15s ease',
  },
};

export default function VendorValidationScreen({
  vendorData,
  onConfirm,
  onReject,
}: VendorValidationScreenProps) {
  const fields: { label: string; key: keyof VendorData }[] = [
    { label: 'UVP', key: 'uvp' },
    { label: 'Core', key: 'core' },
    { label: 'Vertical', key: 'vertical' },
    { label: 'Mercados LATAM', key: 'mercados_latam' },
  ];

  return (
    <div style={styles.overlay} role="dialog" aria-modal="true" aria-labelledby="vendor-title">
      <div style={styles.card}>
        <span style={styles.badge}>GOLD DATA · Verificado por NERV</span>

        <h2 id="vendor-title" style={styles.title}>
          ¿Esto describe tu empresa?
        </h2>
        <p style={styles.subtitle}>
          Encontramos <strong style={{ color: '#ffffff' }}>{vendorData.nombre}</strong> en nuestra
          base de datos. Confirma si es tu empresa.
        </p>

        <div style={styles.fieldGrid}>
          {fields.map(({ label, key }) => (
            <div key={key} style={styles.fieldCard}>
              <div style={styles.fieldLabel}>{label}</div>
              <div style={styles.fieldValue}>{vendorData[key] || '—'}</div>
            </div>
          ))}
        </div>

        {vendorData.killer_argument && (
          <div style={styles.killerBox}>
            <div style={styles.killerLabel}>Argumento de Cierre</div>
            <p style={{ ...styles.killerText, margin: 0 }}>{vendorData.killer_argument}</p>
          </div>
        )}

        <div style={styles.buttonRow}>
          <button
            style={styles.confirmButton}
            onClick={() => onConfirm(vendorData)}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLButtonElement).style.backgroundColor = '#15803d';
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLButtonElement).style.backgroundColor = '#16a34a';
            }}
          >
            ✓ Sí, somos nosotros — buscar targets
          </button>
          <button
            style={styles.rejectButton}
            onClick={onReject}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLButtonElement).style.backgroundColor = '#2a2a2a';
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLButtonElement).style.backgroundColor = '#1f1f1f';
            }}
          >
            No es mi empresa
          </button>
        </div>
      </div>
    </div>
  );
}

import React from "react";

export default function ErrorModal({
  show,
  yamlErrorLine,
  yamlLines,
  yamlErrorMsg,
  isFixing,
  onFix,
  onClose
}) {
  if (!show) return null;
  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100vw',
      height: '100vh',
      background: 'rgba(0,0,0,0.18)',
      zIndex: 1000,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    }}>
      <div style={{
        background: '#fff',
        borderRadius: 14,
        boxShadow: '0 4px 32px #0002',
        padding: '32px 28px 20px 28px',
        minWidth: 320,
        maxWidth: 420,
        textAlign: 'center',
        border: '2px solid #b00020',
        position: 'relative',
      }}>
        <div style={{ fontWeight: 700, color: '#b00020', fontSize: 18, marginBottom: 8 }}>YAML Hatası</div>
        {yamlErrorLine !== null && (
          <div style={{ marginBottom: 8 }}>
            <b>Hatalı satır: {yamlErrorLine + 1}</b>
            <div style={{ fontFamily: 'Fira Mono, monospace', color: '#333', fontSize: 14, background: '#f8d7da', borderRadius: 6, padding: 4, margin: '4px 0' }}>
              {yamlLines[yamlErrorLine]}
            </div>
          </div>
        )}
        <div style={{ color: '#b00020', marginBottom: 12 }}>{yamlErrorMsg}</div>
        <div style={{ display: 'flex', justifyContent: 'center', gap: 12 }}>
          <button
            style={{
              padding: '6px 18px',
              background: '#1976d2',
              color: '#fff',
              border: 'none',
              borderRadius: 6,
              fontWeight: 600,
              cursor: isFixing ? 'wait' : 'pointer',
              fontSize: 15,
              opacity: isFixing ? 0.7 : 1
            }}
            onClick={onFix}
            disabled={isFixing}
          >
            {isFixing ? 'Düzeltiliyor...' : 'Fixle (Claude ile)'}
          </button>
          <button
            style={{
              padding: '6px 18px',
              background: '#eee',
              color: '#333',
              border: 'none',
              borderRadius: 6,
              fontWeight: 600,
              cursor: 'pointer',
              fontSize: 15,
            }}
            onClick={onClose}
          >
            Kapat
          </button>
        </div>
      </div>
    </div>
  );
} 
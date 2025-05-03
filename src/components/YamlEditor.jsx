import React from "react";

export default function YamlEditor({
  yamlText,
  onChange,
  yamlErrorLine,
  onScroll,
  lineNumberRef
}) {
  const yamlLines = yamlText.split("\n");
  const lineNumbers = Array.from({ length: yamlLines.length }, (_, i) => i + 1);
  return (
    <div style={{ display: 'flex', height: '100%' }}>
      <div
        ref={lineNumberRef}
        style={{
          background: '#f4f4f4',
          color: '#888',
          padding: '18px 6px',
          borderRadius: '12px 0 0 12px',
          fontFamily: 'Fira Mono, Consolas, Menlo, monospace',
          fontSize: '1.08rem',
          textAlign: 'right',
          userSelect: 'none',
          minWidth: 32,
          borderRight: '1px solid #e0e0e0',
          overflow: 'hidden',
          height: '100%',
        }}
      >
        {lineNumbers.map(n => <div key={n}>{n}</div>)}
      </div>
      <textarea
        className={`yaml-textarea${yamlErrorLine !== null ? ' yaml-error-line' : ''}`}
        value={yamlText}
        onChange={onChange}
        spellCheck={false}
        placeholder="Paste or write your YAML here..."
        style={yamlErrorLine !== null ? { borderColor: '#b00020' } : {}}
        onScroll={onScroll}
      />
    </div>
  );
} 
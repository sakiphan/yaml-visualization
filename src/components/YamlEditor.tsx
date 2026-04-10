import type { YamlEditorProps } from '../types';

export default function YamlEditor({
  yamlText,
  onChange,
  yamlErrorLine,
  onScroll,
  lineNumberRef,
}: YamlEditorProps) {
  const lineCount = yamlText.split('\n').length;
  const lineNumbers = Array.from({ length: lineCount }, (_, i) => i + 1);

  return (
    <div className="yaml-editor-container">
      <div ref={lineNumberRef} className="yaml-line-numbers">
        {lineNumbers.map((n) => (
          <div key={n} className="yaml-line-number">{n}</div>
        ))}
      </div>
      <textarea
        className={`yaml-textarea ${yamlErrorLine !== null ? 'yaml-textarea--error' : ''}`}
        value={yamlText}
        onChange={onChange}
        spellCheck={false}
        placeholder="Paste or write your YAML here..."
        onScroll={onScroll}
      />
    </div>
  );
}

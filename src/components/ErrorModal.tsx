import type { ErrorModalProps } from '../types';

export default function ErrorModal({
  show,
  yamlErrorLine,
  yamlLines,
  yamlErrorMsg,
  isFixing,
  onFix,
  onClose,
}: ErrorModalProps) {
  if (!show) return null;

  return (
    <div className="error-modal-overlay" onClick={onClose}>
      <div className="error-modal-card" onClick={(e) => e.stopPropagation()}>
        <div className="error-modal-title">YAML Error</div>

        {yamlErrorLine !== null && (
          <div className="error-modal-context">
            <span className="error-modal-line-label">
              Error at line {yamlErrorLine + 1}
            </span>
            <pre className="error-modal-code">
              {yamlLines[yamlErrorLine]}
            </pre>
          </div>
        )}

        <div className="error-modal-msg">{yamlErrorMsg}</div>

        <div className="error-modal-actions">
          <button
            className="btn-fix"
            onClick={onFix}
            disabled={isFixing}
          >
            {isFixing ? 'Fixing...' : 'Fix with Claude'}
          </button>
          <button className="btn-close" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

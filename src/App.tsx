import { useState, useRef, useEffect, useCallback } from 'react';
import Split from 'react-split';
import { toPng } from 'html-to-image';
import type { ReactFlowInstance } from 'reactflow';
import 'reactflow/dist/style.css';
import './styles/app.css';
import { useYamlParser } from './hooks/useYamlParser';
import { useClaudeFix } from './hooks/useClaudeFix';
import YamlEditor from './components/YamlEditor';
import ErrorModal from './components/ErrorModal';
import FlowPanel from './components/FlowPanel';

export default function App() {
  const [yamlText, setYamlText] = useState('');
  const {
    flows,
    errors,
    yamlErrorLine,
    yamlErrorMsg,
    showErrorModal,
    setShowErrorModal,
  } = useYamlParser(yamlText);
  const { isFixing, fixWithClaude } = useClaudeFix();

  const reactFlowRefs = useRef<(HTMLDivElement | null)[]>([]);
  const [rfInstances, setRfInstances] = useState<ReactFlowInstance[]>([]);
  const lineNumberRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    document.title = 'YAML Visualizer';
  }, []);

  useEffect(() => {
    rfInstances.forEach((inst) => {
      if (inst) inst.fitView({ padding: 0.2, includeHiddenNodes: true });
    });
  }, [flows, rfInstances]);

  const handleInit = useCallback(
    (idx: number) => (instance: ReactFlowInstance) => {
      setRfInstances((prev) => {
        const arr = [...prev];
        arr[idx] = instance;
        return arr;
      });
    },
    []
  );

  const handleScroll = useCallback(
    (e: React.UIEvent<HTMLTextAreaElement>) => {
      if (lineNumberRef.current) {
        lineNumberRef.current.scrollTop = (e.target as HTMLTextAreaElement).scrollTop;
      }
    },
    []
  );

  const handleDownloadPng = useCallback(
    (idx: number) => () => {
      const node = reactFlowRefs.current[idx];
      if (!node) return;
      toPng(node, {
        cacheBust: true,
        filter: (el: HTMLElement) =>
          !el.classList || !el.classList.contains('download-btn'),
      })
        .then((dataUrl) => {
          const link = document.createElement('a');
          link.download = `flow-${idx + 1}.png`;
          link.href = dataUrl;
          link.click();
        })
        .catch((err: Error) => {
          alert('Failed to download PNG: ' + err.message);
        });
    },
    []
  );

  const handleFix = useCallback(async () => {
    const fixed = await fixWithClaude(yamlText, yamlErrorMsg);
    if (fixed) {
      setYamlText(fixed);
      setShowErrorModal(false);
    }
  }, [fixWithClaude, yamlText, yamlErrorMsg, setShowErrorModal]);

  const handleDragEnd = useCallback(() => {
    rfInstances.forEach((inst) => {
      if (inst) inst.fitView({ padding: 0.2, includeHiddenNodes: true });
    });
    setTimeout(() => {
      rfInstances.forEach((inst) => {
        if (inst) inst.fitView({ padding: 0.2, includeHiddenNodes: true });
      });
    }, 100);
  }, [rfInstances]);

  const yamlLines = yamlText.split('\n');

  return (
    <div className="container">
      <header className="header">
        <h1 className="header__title">YAML Visualizer</h1>
        <span className="header__badge">v2.0</span>
      </header>

      <Split
        className="main-split"
        sizes={[28, 72]}
        minSize={[200, 300]}
        expandToMin
        gutterSize={6}
        gutterAlign="center"
        snapOffset={0}
        dragInterval={1}
        direction="horizontal"
        onDragEnd={handleDragEnd}
      >
        <div className="yaml-panel">
          <YamlEditor
            yamlText={yamlText}
            onChange={(e) => setYamlText(e.target.value)}
            yamlErrorLine={yamlErrorLine}
            onScroll={handleScroll}
            lineNumberRef={lineNumberRef}
          />
          <ErrorModal
            show={showErrorModal}
            yamlErrorLine={yamlErrorLine}
            yamlLines={yamlLines}
            yamlErrorMsg={yamlErrorMsg}
            isFixing={isFixing}
            onFix={handleFix}
            onClose={() => setShowErrorModal(false)}
          />
        </div>

        <div className="flow-panel">
          {flows.length === 0 && errors.length === 0 && (
            <div className="flow-empty">
              <div className="flow-empty__icon">{'{ }'}</div>
              <p className="flow-empty__text">
                Paste your YAML on the left to visualize
              </p>
            </div>
          )}
          {flows.map((flow, idx) => (
            <FlowPanel
              key={idx}
              flow={flow}
              error={errors[idx]}
              idx={idx}
              reactFlowRef={(el) => {
                reactFlowRefs.current[idx] = el;
              }}
              handleDownloadPng={handleDownloadPng}
              handleInit={handleInit}
            />
          ))}
        </div>
      </Split>
    </div>
  );
}

import React, { useState, useRef, useEffect } from "react";
import YAML from "js-yaml";
import Split from "react-split";
import "reactflow/dist/style.css";
import "./App.css";
import { toPng } from 'html-to-image';
import { getYamlErrorLine, layoutElements, yamlToTree } from './utils/yamlUtils';
import YamlEditor from './components/YamlEditor';
import ErrorModal from './components/ErrorModal';
import FlowPanel from './components/FlowPanel';

const defaultYaml = "";

export default function App() {
  const [yamlText, setYamlText] = useState(defaultYaml);
  const [flows, setFlows] = useState([]);
  const [errors, setErrors] = useState([]);
  const [yamlErrorLine, setYamlErrorLine] = useState(null);
  const [yamlErrorMsg, setYamlErrorMsg] = useState("");
  const reactFlowRefs = useRef([]);
  const [rfInstances, setRfInstances] = useState([]);
  const lineNumberRef = useRef(null);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [isFixing, setIsFixing] = useState(false);

  useEffect(() => { document.title = "YAML Visualizer"; }, []);
  useEffect(() => {
    rfInstances.forEach((inst) => { if (inst) inst.fitView({ padding: 0.2, includeHiddenNodes: true }); });
  }, [flows, rfInstances]);

  useEffect(() => {
    setYamlErrorLine(null);
    setYamlErrorMsg("");
    if (!yamlText.trim()) {
      setFlows([]); setErrors([]); return;
    }
    try {
      const docs = [];
      YAML.loadAll(yamlText, (doc) => docs.push(doc));
      const newFlows = [], newErrors = [];
      docs.forEach((doc, idx) => {
        try {
          if (!doc) throw new Error("Empty document");
          const { nodes, edges } = yamlToTree(doc, `root${idx}`, [
            { id: `root${idx}`, data: { label: "YAML" }, style: { background: "#e0e0e0", borderRadius: 8, padding: 8, minWidth: 80 } },
          ]);
          const layoutedNodes = layoutElements(nodes, edges, "TB");
          newFlows.push({ nodes: layoutedNodes, edges });
          newErrors.push(null);
        } catch (err) {
          newFlows.push({ nodes: [], edges: [] });
          newErrors.push("YAML error: " + err.message);
          const line = getYamlErrorLine(err.message);
          setYamlErrorLine(line);
          setYamlErrorMsg(err.message);
          setShowErrorModal(true);
        }
      });
      setFlows(newFlows);
      setErrors(newErrors);
    } catch (err) {
      setFlows([]);
      setErrors(["YAML error: " + err.message]);
      const line = getYamlErrorLine(err.message);
      setYamlErrorLine(line);
      setYamlErrorMsg(err.message);
      setShowErrorModal(true);
    }
  }, [yamlText]);

  const handleInit = (idx) => (instance) => {
    setRfInstances((prev) => { const arr = [...prev]; arr[idx] = instance; return arr; });
  };

  const yamlLines = yamlText.split("\n");

  const handleScroll = (e) => {
    if (lineNumberRef.current) {
      lineNumberRef.current.scrollTop = e.target.scrollTop;
    }
  };

  const handleDownloadPng = (idx) => () => {
    const node = reactFlowRefs.current[idx];
    if (!node) return;
    toPng(node, {
      cacheBust: true,
      filter: (el) => !el.classList || !el.classList.contains('download-btn')
    })
      .then((dataUrl) => {
        const link = document.createElement('a');
        link.download = `flow-${idx + 1}.png`;
        link.href = dataUrl;
        link.click();
      })
      .catch((err) => {
        window.alert('Failed to download PNG: ' + err.message);
      });
  };

  async function fixWithClaude(yamlText, errorMsg) {
    setIsFixing(true);
    try {
      const response = await fetch("http://localhost:3001/api/claude-fix", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ yamlText, errorMsg })
      });
      const data = await response.json();
      let fixed = "";
      if (data.content && data.content[0] && data.content[0].text) {
        fixed = data.content[0].text;
        if (fixed.startsWith("```") ) {
          fixed = fixed.replace(/```[a-zA-Z]*\n?/, "").replace(/```$/, "").trim();
        }
        setYamlText(fixed);
        setShowErrorModal(false);
      } else if (data.error) {
        alert("Claude API Error: " + data.error);
      } else {
        alert("Unexpected response from Claude: " + JSON.stringify(data));
      }
    } catch (err) {
      alert("Claude auto-fix failed: " + err.message);
    } finally {
      setIsFixing(false);
    }
  }

  return (
    <div className="container">
      <h2 className="main-title">YAML Visualizer</h2>
      <Split
        className="main-flex"
        sizes={[12, 88]}
        minSize={[60, 100]}
        expandToMin={true}
        gutterSize={10}
        gutterAlign="center"
        snapOffset={0}
        dragInterval={1}
        direction="horizontal"
        style={{ display: 'flex', width: '100vw', height: 'calc(100vh - 70px)' }}
        onDragEnd={() => {
          rfInstances.forEach(inst => {
            if (inst) inst.fitView({ padding: 0.2, includeHiddenNodes: true });
          });
          setTimeout(() => {
            rfInstances.forEach(inst => {
              if (inst) inst.fitView({ padding: 0.2, includeHiddenNodes: true });
            });
          }, 100);
        }}
      >
        <div className="yaml-panel">
          <YamlEditor
            yamlText={yamlText}
            onChange={e => setYamlText(e.target.value)}
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
            onFix={() => fixWithClaude(yamlText, yamlErrorMsg)}
            onClose={() => setShowErrorModal(false)}
          />
        </div>
        <div className="flow-panel" style={{ overflowY: 'auto' }}>
          {flows.length === 0 && errors.length === 0 && (
            <div className="flow-area" />
          )}
          {flows.map((flow, idx) => (
            <FlowPanel
              key={idx}
              flow={flow}
              error={errors[idx]}
              idx={idx}
              reactFlowRef={el => reactFlowRefs.current[idx] = el}
              handleDownloadPng={handleDownloadPng}
              handleInit={handleInit}
            />
          ))}
        </div>
      </Split>
    </div>
  );
}

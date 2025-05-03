import React, { useState, useRef, useEffect } from "react";
import YAML from "js-yaml";
import ReactFlow, { Background } from "reactflow";
import dagre from "dagre";
import Split from "react-split";
import "reactflow/dist/style.css";
import "./App.css";
import { toPng } from 'html-to-image';

const defaultYaml = "";

const nodeWidth = 160;
const nodeHeight = 40;

function getYamlErrorLine(errorMsg) {
  // Hata mesajından satır bilgisini bul (örn: at line 7, col 5 veya at line 7)
  const match = errorMsg.match(/at line (\d+)/i) || errorMsg.match(/at line (\d+),/i) || errorMsg.match(/\((\d+):(\d+)\)/);
  if (match) {
    // Bazı parserlar 0-index, bazıları 1-index döndürebilir, genellikle 1-index
    return parseInt(match[1], 10) - 1;
  }
  return null;
}

function tryAutoFixYaml(yamlText, errorMsg) {
  // Sadece en yaygın hatalar için basit düzeltme önerisi
  // Girinti hatası: "bad indentation"
  if (errorMsg.includes("bad indentation")) {
    // Tüm satırları 2 boşlukla yeniden girintile
    try {
      const obj = YAML.load(yamlText);
      return YAML.dump(obj, { indent: 2 });
    } catch {
      return null;
    }
  }
  // Duplicated mapping key: satırı sil
  if (errorMsg.includes("duplicated mapping key")) {
    const match = errorMsg.match(/\((\d+):(\d+)\)/);
    if (match) {
      const line = parseInt(match[1], 10) - 1;
      const lines = yamlText.split("\n");
      lines.splice(line, 1);
      return lines.join("\n");
    }
  }
  return null;
}

function layoutElements(nodes, edges, direction = "TB") {
  const dagreGraph = new dagre.graphlib.Graph();
  dagreGraph.setDefaultEdgeLabel(() => ({}));
  dagreGraph.setGraph({ rankdir: direction });

  nodes.forEach((node) => {
    dagreGraph.setNode(node.id, { width: nodeWidth, height: nodeHeight });
  });
  edges.forEach((edge) => {
    dagreGraph.setEdge(edge.source, edge.target);
  });

  dagre.layout(dagreGraph);

  return nodes.map((node) => {
    const nodeWithPosition = dagreGraph.node(node.id);
    return {
      ...node,
      position: {
        x: nodeWithPosition.x - nodeWidth / 2,
        y: nodeWithPosition.y - nodeHeight / 2,
      },
      sourcePosition: "bottom",
      targetPosition: "top",
    };
  });
}

function yamlToTree(data, parentId = "root", nodes = [], edges = [], level = 0, yOffset = 0) {
  const id = `${parentId}-${level}`;
  if (typeof data === "object" && data !== null) {
    Object.entries(data).forEach(([key, value], idx) => {
      const nodeId = `${id}-${key}-${idx}`;
      nodes.push({
        id: nodeId,
        data: { label: key },
        style: {
          border: "1px solid #b4b4b4",
          borderRadius: 8,
          padding: 8,
          background: "#fff",
          minWidth: 80,
        },
      });
      edges.push({ id: `${parentId}->${nodeId}`, source: parentId, target: nodeId });
      yamlToTree(value, nodeId, nodes, edges, level + 1, yOffset + 100 * idx);
    });
  } else {
    const nodeId = `${id}-value`;
    nodes.push({
      id: nodeId,
      data: { label: String(data) },
      style: {
        background: "#f0f0ff",
        borderRadius: 8,
        padding: 8,
        minWidth: 80,
      },
    });
    edges.push({ id: `${parentId}->${nodeId}`, source: parentId, target: nodeId });
  }
  return { nodes, edges };
}

export default function App() {
  const [yamlText, setYamlText] = useState(defaultYaml);
  const [flows, setFlows] = useState([]); // Her doküman için ayrı flow
  const [errors, setErrors] = useState([]); // Her doküman için hata
  const [yamlErrorLine, setYamlErrorLine] = useState(null);
  const [yamlErrorMsg, setYamlErrorMsg] = useState("");
  const [yamlFix, setYamlFix] = useState(null);
  const reactFlowRefs = useRef([]);
  const [rfInstances, setRfInstances] = useState([]);
  const lineNumberRef = useRef(null);

  useEffect(() => {
    document.title = "YAML Visualizer";
  }, []);

  useEffect(() => {
    // Her flow için fitView uygula
    rfInstances.forEach((inst) => {
      if (inst) inst.fitView({ padding: 0.2, includeHiddenNodes: true });
    });
  }, [flows, rfInstances]);

  useEffect(() => {
    setYamlErrorLine(null);
    setYamlErrorMsg("");
    setYamlFix(null);
    if (!yamlText.trim()) {
      setFlows([]);
      setErrors([]);
      return;
    }
    try {
      const docs = [];
      YAML.loadAll(yamlText, (doc) => docs.push(doc));
      const newFlows = [];
      const newErrors = [];
      docs.forEach((doc, idx) => {
        try {
          if (!doc) throw new Error("Boş doküman");
          const { nodes, edges } = yamlToTree(doc, `root${idx}`, [
            {
              id: `root${idx}`,
              data: { label: "YAML" },
              style: {
                background: "#e0e0e0",
                borderRadius: 8,
                padding: 8,
                minWidth: 80,
              },
            },
          ]);
          const layoutedNodes = layoutElements(nodes, edges, "TB");
          newFlows.push({ nodes: layoutedNodes, edges });
          newErrors.push(null);
        } catch (err) {
          newFlows.push({ nodes: [], edges: [] });
          newErrors.push("YAML hatalı: " + err.message);
          // Hata satırı ve otomatik düzeltme
          const line = getYamlErrorLine(err.message);
          setYamlErrorLine(line);
          setYamlErrorMsg(err.message);
          setYamlFix(tryAutoFixYaml(yamlText, err.message));
          if (line !== null) {
            window.alert(`YAML formatı hatalı! Hatalı satır: ${line + 1}`);
          } else {
            window.alert("YAML formatı hatalı!");
          }
        }
      });
      setFlows(newFlows);
      setErrors(newErrors);
    } catch (err) {
      setFlows([]);
      setErrors(["YAML hatalı: " + err.message]);
      // Hata satırı ve otomatik düzeltme
      const line = getYamlErrorLine(err.message);
      setYamlErrorLine(line);
      setYamlErrorMsg(err.message);
      setYamlFix(tryAutoFixYaml(yamlText, err.message));
      if (line !== null) {
        window.alert(`YAML formatı hatalı! Hatalı satır: ${line + 1}`);
      } else {
        window.alert("YAML formatı hatalı!");
      }
    }
  }, [yamlText]);

  // Her flow için ayrı instance tut
  const handleInit = (idx) => (instance) => {
    setRfInstances((prev) => {
      const arr = [...prev];
      arr[idx] = instance;
      return arr;
    });
  };

  // YAML textarea satır vurgusu
  const yamlLines = yamlText.split("\n");
  const lineNumbers = Array.from({ length: yamlLines.length }, (_, i) => i + 1);

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
        window.alert('PNG olarak indirme başarısız: ' + err.message);
      });
  };

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
              onChange={e => setYamlText(e.target.value)}
              spellCheck={false}
              placeholder="Paste or write your YAML here..."
              style={yamlErrorLine !== null ? { borderColor: '#b00020' } : {}}
              onScroll={handleScroll}
            />
          </div>
          {yamlErrorMsg && (
            <div className="yaml-error-info">
              {yamlErrorLine !== null && (
                <>
                  <b>Error at line {yamlErrorLine + 1}:</b> <br />
                  <code>{yamlLines[yamlErrorLine]}</code>
                  <br />
                </>
              )}
              {yamlErrorMsg}
              {yamlFix && (
                <>
                  <br />
                  <button className="yaml-fix-btn" onClick={() => setYamlText(yamlFix)}>
                    Auto Fix
                  </button>
                </>
              )}
            </div>
          )}
        </div>
        <div className="flow-panel" style={{ overflowY: 'auto' }}>
          {flows.length === 0 && errors.length === 0 && (
            <div className="flow-area" />
          )}
          {flows.map((flow, idx) => (
            <div className="flow-area" ref={el => reactFlowRefs.current[idx] = el} key={idx} style={{ flex: 1, margin: 0, minHeight: 0, position: 'relative' }}>
              {errors[idx] && <div className="error">{errors[idx]}</div>}
              <button
                className="download-btn"
                style={{
                  position: 'absolute',
                  top: 10,
                  right: 10,
                  zIndex: 10,
                  padding: '2px 8px',
                  fontSize: '0.85rem',
                  minWidth: 0,
                  minHeight: 0,
                  borderRadius: 6,
                  border: '1px solid #1976d2',
                  background: '#e3eafc',
                  color: '#1976d2',
                  cursor: 'pointer'
                }}
                onClick={handleDownloadPng(idx)}
              >
                PNG olarak indir
              </button>
              <ReactFlow
                nodes={flow.nodes}
                edges={flow.edges}
                minZoom={0.1}
                maxZoom={2}
                onInit={handleInit(idx)}
                fitView
                style={{ width: '100%', height: '100%' }}
              >
                <Background color="#fff" gap={16} />
              </ReactFlow>
            </div>
          ))}
        </div>
      </Split>
    </div>
  );
}

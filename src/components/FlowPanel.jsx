import React from "react";
import ReactFlow, { Background } from "reactflow";

export default function FlowPanel({
  flow,
  error,
  idx,
  reactFlowRef,
  handleDownloadPng,
  handleInit
}) {
  return (
    <div className="flow-area" ref={reactFlowRef} style={{ flex: 1, margin: 0, minHeight: 0, position: 'relative' }}>
      {error && <div className="error">{error}</div>}
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
        Download PNG
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
  );
} 
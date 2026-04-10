import { useMemo } from 'react';
import ReactFlow, { Background, Controls } from 'reactflow';
import type { FlowPanelProps } from '../types';
import CustomNode from './CustomNode';

const nodeTypes = { custom: CustomNode };

export default function FlowPanel({
  flow,
  error,
  idx,
  reactFlowRef,
  handleDownloadPng,
  handleInit,
}: FlowPanelProps) {
  const memoNodeTypes = useMemo(() => nodeTypes, []);

  return (
    <div className="flow-area" ref={reactFlowRef}>
      {error && <div className="flow-error">{error}</div>}
      <button
        className="flow-download-btn download-btn"
        onClick={handleDownloadPng(idx)}
      >
        Download PNG
      </button>
      <ReactFlow
        nodes={flow.nodes}
        edges={flow.edges}
        nodeTypes={memoNodeTypes}
        minZoom={0.1}
        maxZoom={2}
        onInit={handleInit(idx)}
        fitView
      >
        <Background color="rgba(255,255,255,0.03)" gap={24} />
        <Controls className="flow-controls" />
      </ReactFlow>
    </div>
  );
}

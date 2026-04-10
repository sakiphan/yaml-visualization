import dagre from 'dagre';
import { Position } from 'reactflow';
import type { Node, Edge } from 'reactflow';
import type { YamlFlowData } from '../types';

export function getYamlErrorLine(errorMsg: string): number | null {
  const match =
    errorMsg.match(/at line (\d+)/i) ||
    errorMsg.match(/\((\d+):(\d+)\)/);
  if (match) {
    return parseInt(match[1], 10) - 1;
  }
  return null;
}

const NODE_WIDTH = 160;
const NODE_HEIGHT = 40;

export function layoutElements(
  nodes: Node[],
  edges: Edge[],
  direction: string = 'TB'
): Node[] {
  const dagreGraph = new dagre.graphlib.Graph();
  dagreGraph.setDefaultEdgeLabel(() => ({}));
  dagreGraph.setGraph({ rankdir: direction });

  nodes.forEach((node) => {
    dagreGraph.setNode(node.id, { width: NODE_WIDTH, height: NODE_HEIGHT });
  });
  edges.forEach((edge) => {
    dagreGraph.setEdge(edge.source, edge.target);
  });

  dagre.layout(dagreGraph);

  return nodes.map((node) => {
    const pos = dagreGraph.node(node.id);
    return {
      ...node,
      position: {
        x: pos.x - NODE_WIDTH / 2,
        y: pos.y - NODE_HEIGHT / 2,
      },
      sourcePosition: Position.Bottom,
      targetPosition: Position.Top,
    };
  });
}

export function yamlToTree(
  data: unknown,
  parentId: string = 'root',
  nodes: Node[] = [],
  edges: Edge[] = [],
  level: number = 0
): YamlFlowData {
  const id = `${parentId}-${level}`;

  if (typeof data === 'object' && data !== null) {
    const entries = Array.isArray(data)
      ? data.map((item, i) => [`[${i}]`, item] as const)
      : Object.entries(data as Record<string, unknown>);

    entries.forEach(([key, value], idx) => {
      const nodeId = `${id}-${key}-${idx}`;
      nodes.push({
        id: nodeId,
        type: 'custom',
        data: { label: String(key), isLeaf: false },
        position: { x: 0, y: 0 },
      });
      edges.push({
        id: `${parentId}->${nodeId}`,
        source: parentId,
        target: nodeId,
      });
      yamlToTree(value, nodeId, nodes, edges, level + 1);
    });
  } else {
    const nodeId = `${id}-value`;
    nodes.push({
      id: nodeId,
      type: 'custom',
      data: { label: String(data), isLeaf: true },
      position: { x: 0, y: 0 },
    });
    edges.push({
      id: `${parentId}->${nodeId}`,
      source: parentId,
      target: nodeId,
    });
  }

  return { nodes, edges };
}

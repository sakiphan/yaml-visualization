import dagre from "dagre";

export function getYamlErrorLine(errorMsg) {
  const match = errorMsg.match(/at line (\d+)/i) || errorMsg.match(/at line (\d+),/i) || errorMsg.match(/\((\d+):(\d+)\)/);
  if (match) {
    return parseInt(match[1], 10) - 1;
  }
  return null;
}

const nodeWidth = 160;
const nodeHeight = 40;

export function layoutElements(nodes, edges, direction = "TB") {
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

export function yamlToTree(data, parentId = "root", nodes = [], edges = [], level = 0, yOffset = 0) {
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
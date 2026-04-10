import { Handle, Position } from 'reactflow';
import type { NodeProps } from 'reactflow';

export default function CustomNode({ data }: NodeProps) {
  const isLeaf = data.isLeaf ?? false;

  return (
    <div className={`custom-node ${isLeaf ? 'custom-node--leaf' : ''}`}>
      <Handle type="target" position={Position.Top} className="custom-node__handle" />
      <span className="custom-node__label">{data.label}</span>
      <Handle type="source" position={Position.Bottom} className="custom-node__handle" />
    </div>
  );
}

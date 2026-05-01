import { Handle, Position } from '@xyflow/react';
import type { NodeProps } from '@xyflow/react';

export function ProcessNode({ data }: NodeProps) {
  return (
    <div className="process-node">
      <Handle type="target" position={Position.Top} />
      <div className="node-label">{(data.label as string) ?? 'Process'}</div>
      <Handle type="source" position={Position.Bottom} />
    </div>
  );
}

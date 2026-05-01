import { Handle, Position } from '@xyflow/react';
import type { NodeProps } from '@xyflow/react';

export function EndNode({ data }: NodeProps) {
  return (
    <div className="end-node">
      <Handle type="target" position={Position.Top} />
      <div className="node-label">{(data.label as string) ?? 'End'}</div>
    </div>
  );
}

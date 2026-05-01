import { Handle, Position } from '@xyflow/react';
import type { NodeProps } from '@xyflow/react';

export function StartNode({ data }: NodeProps) {
  return (
    <div className="start-node">
      <div className="node-label">{(data.label as string) ?? 'Start'}</div>
      <Handle type="source" position={Position.Bottom} />
    </div>
  );
}

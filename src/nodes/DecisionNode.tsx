import { Handle, Position } from '@xyflow/react';
import type { NodeProps } from '@xyflow/react';

export function DecisionNode({ data }: NodeProps) {
  return (
    <div className="decision-node">
      <Handle type="target" position={Position.Top} />
      <div className="decision-shape">
        <div className="node-label">{(data.label as string) ?? 'Decision'}</div>
      </div>
      <Handle type="source" position={Position.Bottom} id="yes" />
      <Handle type="source" position={Position.Right} id="no" />
    </div>
  );
}

import React from 'react';
import './Palette.css';

const PALETTE_ITEMS = [
  { type: 'startNode', label: 'Start', className: 'palette-start' },
  { type: 'processNode', label: 'Process', className: 'palette-process' },
  { type: 'decisionNode', label: 'Decision', className: 'palette-decision' },
  { type: 'endNode', label: 'End', className: 'palette-end' },
];

export function Palette() {
  const onDragStart = (event: React.DragEvent, nodeType: string, label: string) => {
    event.dataTransfer.setData('application/reactflow-type', nodeType);
    event.dataTransfer.setData('application/reactflow-label', label);
    event.dataTransfer.effectAllowed = 'move';
  };

  return (
    <aside className="palette">
      <h2 className="palette-title">Nodes</h2>
      {PALETTE_ITEMS.map(({ type, label, className }) => (
        <div
          key={type}
          className={`palette-item ${className}`}
          draggable
          onDragStart={(e) => onDragStart(e, type, label)}
        >
          {label}
        </div>
      ))}
      <p className="palette-hint">Drag onto canvas</p>
    </aside>
  );
}

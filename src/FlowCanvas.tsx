import { useCallback, useRef } from 'react';
import React from 'react';
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  addEdge,
  useNodesState,
  useEdgesState,
  type OnConnect,
  type Node,
  type Edge,
  BackgroundVariant,
  MarkerType,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';

import { StartNode } from './nodes/StartNode';
import { EndNode } from './nodes/EndNode';
import { ProcessNode } from './nodes/ProcessNode';
import { DecisionNode } from './nodes/DecisionNode';

const nodeTypes = {
  startNode: StartNode,
  endNode: EndNode,
  processNode: ProcessNode,
  decisionNode: DecisionNode,
};

const initialNodes: Node[] = [
  { id: '1', type: 'startNode', position: { x: 250, y: 50 }, data: { label: 'Start' } },
];

const initialEdges: Edge[] = [];

let idCounter = 2;
const getId = () => `node_${idCounter++}`;

export function FlowCanvas() {
  const reactFlowWrapper = useRef<HTMLDivElement>(null);
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  const onConnect: OnConnect = useCallback(
    (connection) =>
      setEdges((eds) =>
        addEdge({ ...connection, markerEnd: { type: MarkerType.ArrowClosed } }, eds)
      ),
    [setEdges]
  );

  const onDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  const onDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault();
      const type = event.dataTransfer.getData('application/reactflow-type');
      const label = event.dataTransfer.getData('application/reactflow-label');
      if (!type || !reactFlowWrapper.current) return;

      const rect = reactFlowWrapper.current.getBoundingClientRect();
      const position = {
        x: event.clientX - rect.left - 60,
        y: event.clientY - rect.top - 20,
      };

      setNodes((nds) => [
        ...nds,
        { id: getId(), type, position, data: { label } },
      ]);
    },
    [setNodes]
  );

  const onNodeDoubleClick = useCallback(
    (_: React.MouseEvent, node: Node) => {
      const newLabel = window.prompt('Rename node:', node.data.label as string);
      if (newLabel !== null && newLabel.trim() !== '') {
        setNodes((nds) =>
          nds.map((n) => (n.id === node.id ? { ...n, data: { ...n.data, label: newLabel.trim() } } : n))
        );
      }
    },
    [setNodes]
  );

  const clearCanvas = () => {
    setNodes([]);
    setEdges([]);
  };

  const exportFlow = () => {
    const data = JSON.stringify({ nodes, edges }, null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'process-map.json';
    a.click();
    URL.revokeObjectURL(url);
  };

  const importFileRef = useRef<HTMLInputElement>(null);

  const onImportFile = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const parsed = JSON.parse(e.target?.result as string);
        if (!Array.isArray(parsed.nodes) || !Array.isArray(parsed.edges)) {
          alert('Invalid process map file.');
          return;
        }
        setNodes(parsed.nodes);
        setEdges(parsed.edges);
        // Bump idCounter past any existing node ids
        const maxId = parsed.nodes.reduce((max: number, n: Node) => {
          const num = parseInt(n.id.replace('node_', ''), 10);
          return isNaN(num) ? max : Math.max(max, num);
        }, idCounter);
        idCounter = maxId + 1;
      } catch {
        alert('Failed to parse file.');
      }
    };
    reader.readAsText(file);
    // Reset so the same file can be re-imported
    event.target.value = '';
  };

  return (
    <div className="canvas-wrapper" ref={reactFlowWrapper}>
      <div className="toolbar">
        <button className="btn-secondary" onClick={exportFlow}>Export</button>
        <button className="btn-secondary" onClick={() => importFileRef.current?.click()}>Import</button>
        <button className="btn-danger" onClick={clearCanvas}>Clear</button>
        <input
          ref={importFileRef}
          type="file"
          accept=".json,application/json"
          style={{ display: 'none' }}
          onChange={onImportFile}
        />
      </div>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onDrop={onDrop}
        onDragOver={onDragOver}
        onNodeDoubleClick={onNodeDoubleClick}
        fitView
      >
        <Background variant={BackgroundVariant.Dots} gap={20} size={1} color="#313244" />
        <Controls />
        <MiniMap
          nodeColor={(n) => {
            if (n.type === 'startNode') return '#a6e3a1';
            if (n.type === 'endNode') return '#f38ba8';
            if (n.type === 'decisionNode') return '#fab387';
            return '#89b4fa';
          }}
          style={{ background: '#181825' }}
        />
      </ReactFlow>
    </div>
  );
}

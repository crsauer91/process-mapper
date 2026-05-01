import { useCallback, useRef, useEffect } from 'react';
import React from 'react';
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  addEdge,
  useNodesState,
  useEdgesState,
  useReactFlow,
  ReactFlowProvider,
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

// Extend window type for Electron preload bridge
declare global {
  interface Window {
    electronAPI?: {
      showNodeContextMenu: (nodeId: string, label: string) => void;
      showCanvasContextMenu: (x: number, y: number) => void;
      exportPDF: (title: string) => Promise<void>;
      on: (channel: string, cb: (...args: unknown[]) => void) => (() => void) | undefined;
    };
  }
}

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

interface FlowCanvasProps {
  processTitle?: string;
}

function FlowCanvasInner({ processTitle = 'process-map' }: FlowCanvasProps) {
  const reactFlowWrapper = useRef<HTMLDivElement>(null);
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const { fitView, screenToFlowPosition } = useReactFlow();
  const selectedNodeId = useRef<string | null>(null);

  // Track selected node
  const onSelectionChange = useCallback(({ nodes: sel }: { nodes: Node[] }) => {
    selectedNodeId.current = sel.length === 1 ? sel[0].id : null;
  }, []);

  const renameNode = useCallback((nodeId: string) => {
    setNodes((nds) => {
      const node = nds.find((n) => n.id === nodeId);
      if (!node) return nds;
      const newLabel = window.prompt('Rename node:', node.data.label as string);
      if (newLabel !== null && newLabel.trim() !== '') {
        return nds.map((n) =>
          n.id === nodeId ? { ...n, data: { ...n.data, label: newLabel.trim() } } : n
        );
      }
      return nds;
    });
  }, [setNodes]);

  const deleteNode = useCallback((nodeId: string) => {
    setNodes((nds) => nds.filter((n) => n.id !== nodeId));
    setEdges((eds) => eds.filter((e) => e.source !== nodeId && e.target !== nodeId));
  }, [setNodes, setEdges]);

  const duplicateNode = useCallback((nodeId: string) => {
    setNodes((nds) => {
      const node = nds.find((n) => n.id === nodeId);
      if (!node) return nds;
      return [...nds, {
        ...node,
        id: getId(),
        position: { x: node.position.x + 40, y: node.position.y + 40 },
        selected: false,
      }];
    });
  }, [setNodes]);

  const addNodeAt = useCallback((type: string, label: string, x: number, y: number) => {
    const pos = reactFlowWrapper.current
      ? screenToFlowPosition({ x, y })
      : { x, y };
    setNodes((nds) => [...nds, { id: getId(), type, position: pos, data: { label } }]);
  }, [setNodes, screenToFlowPosition]);

  const clearCanvas = useCallback(() => {
    setNodes([]);
    setEdges([]);
  }, [setNodes, setEdges]);

  const exportFlow = useCallback(() => {
    const slug = (processTitle || 'process-map').toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
    const data = JSON.stringify({ title: processTitle, nodes, edges }, null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${slug}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }, [processTitle, nodes, edges]);

  const exportPDF = useCallback(() => {
    window.electronAPI?.exportPDF(processTitle);
  }, [processTitle]);

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
    event.target.value = '';
  };

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
      const position = screenToFlowPosition({
        x: event.clientX - rect.left,
        y: event.clientY - rect.top,
      });
      setNodes((nds) => [...nds, { id: getId(), type, position, data: { label } }]);
    },
    [setNodes, screenToFlowPosition]
  );

  const onNodeDoubleClick = useCallback(
    (_: React.MouseEvent, node: Node) => renameNode(node.id),
    [renameNode]
  );

  // Right-click on a node → native context menu
  const onNodeContextMenu = useCallback(
    (event: React.MouseEvent, node: Node) => {
      event.preventDefault();
      event.stopPropagation();
      if (window.electronAPI) {
        window.electronAPI.showNodeContextMenu(node.id, node.data.label as string);
      }
    },
    []
  );

  // Right-click on canvas background → native context menu
  const onPaneContextMenu = useCallback(
    (event: React.MouseEvent | MouseEvent) => {
      event.preventDefault();
      if (window.electronAPI) {
        window.electronAPI.showCanvasContextMenu(
          (event as React.MouseEvent).clientX,
          (event as React.MouseEvent).clientY
        );
      }
    },
    []
  );

  // Wire up Electron menu / IPC events
  useEffect(() => {
    const api = window.electronAPI;
    if (!api) return;

    const unsubs: Array<(() => void) | undefined> = [];

    unsubs.push(api.on('menu:new', () => { setNodes(initialNodes); setEdges([]); }));
    unsubs.push(api.on('menu:export', () => exportFlow()));
    unsubs.push(api.on('menu:export-pdf', () => exportPDF()));
    unsubs.push(api.on('menu:import', () => importFileRef.current?.click()));
    unsubs.push(api.on('menu:clear', () => clearCanvas()));
    unsubs.push(api.on('menu:fit-view', () => fitView({ duration: 300 })));
    unsubs.push(api.on('menu:rename-selected', () => {
      if (selectedNodeId.current) renameNode(selectedNodeId.current);
    }));
    unsubs.push(api.on('menu:delete-selected', () => {
      if (selectedNodeId.current) deleteNode(selectedNodeId.current);
    }));
    unsubs.push(api.on('menu:add-node', (args) => {
      const { type, label } = args as { type: string; label: string };
      addNodeAt(type, label, 400, 300);
    }));
    // Node context menu responses
    unsubs.push(api.on('node-action:rename', (nodeId) => renameNode(nodeId as string)));
    unsubs.push(api.on('node-action:delete', (nodeId) => deleteNode(nodeId as string)));
    unsubs.push(api.on('node-action:duplicate', (nodeId) => duplicateNode(nodeId as string)));
    // Canvas context menu add-node
    unsubs.push(api.on('canvas-action:add-node', (args) => {
      const { type, label, x, y } = args as { type: string; label: string; x: number; y: number };
      addNodeAt(type, label, x, y);
    }));

    return () => unsubs.forEach((u) => u?.());
  }, [exportFlow, exportPDF, clearCanvas, fitView, renameNode, deleteNode, duplicateNode, addNodeAt, setNodes, setEdges]);

  return (
    <div className="canvas-wrapper" ref={reactFlowWrapper}>
      <div className="toolbar">
        <button className="btn-secondary" onClick={exportFlow}>Export JSON</button>
        <button className="btn-secondary" onClick={exportPDF}>Export PDF</button>
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
        onNodeContextMenu={onNodeContextMenu}
        onPaneContextMenu={onPaneContextMenu}
        onSelectionChange={onSelectionChange}
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

export function FlowCanvas(props: FlowCanvasProps) {
  return (
    <ReactFlowProvider>
      <FlowCanvasInner {...props} />
    </ReactFlowProvider>
  );
}


const { contextBridge, ipcRenderer } = require('electron')

contextBridge.exposeInMainWorld('electronAPI', {
  // Send events to main process
  showNodeContextMenu: (nodeId, label) =>
    ipcRenderer.send('context-menu:node', { nodeId, label }),
  showCanvasContextMenu: (x, y) =>
    ipcRenderer.send('context-menu:canvas', { x, y }),

  // Listen for menu/context-menu actions from main process
  on: (channel, callback) => {
    const allowed = [
      'menu:new', 'menu:import', 'menu:export', 'menu:clear',
      'menu:rename-selected', 'menu:delete-selected', 'menu:fit-view',
      'menu:add-node',
      'node-action:rename', 'node-action:duplicate', 'node-action:delete',
      'canvas-action:add-node',
    ]
    if (!allowed.includes(channel)) return
    const handler = (_event, ...args) => callback(...args)
    ipcRenderer.on(channel, handler)
    return () => ipcRenderer.removeListener(channel, handler)
  },
})

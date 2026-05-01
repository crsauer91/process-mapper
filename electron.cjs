const { app, BrowserWindow, Menu, ipcMain, dialog } = require('electron')
const path = require('path')
const fs = require('fs')
const isDev = process.env.NODE_ENV === 'development'

let mainWindow = null

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1280,
    height: 800,
    minWidth: 900,
    minHeight: 600,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.cjs'),
    },
    title: 'Process Mapper',
    titleBarStyle: 'hiddenInset',
  })

  if (isDev) {
    mainWindow.loadURL('http://localhost:5173')
  } else {
    mainWindow.loadFile(path.join(__dirname, 'dist/index.html'))
  }

  buildMenu()
}

function buildMenu() {
  const isMac = process.platform === 'darwin'

  const template = [
    // App menu (macOS only)
    ...(isMac ? [{
      label: app.name,
      submenu: [
        { role: 'about' },
        { type: 'separator' },
        { role: 'services' },
        { type: 'separator' },
        { role: 'hide' },
        { role: 'hideOthers' },
        { role: 'unhide' },
        { type: 'separator' },
        { role: 'quit' },
      ],
    }] : []),

    // File menu
    {
      label: 'File',
      submenu: [
        {
          label: 'New Process Map',
          accelerator: 'CmdOrCtrl+N',
          click: () => mainWindow?.webContents.send('menu:new'),
        },
        { type: 'separator' },
        {
          label: 'Import…',
          accelerator: 'CmdOrCtrl+O',
          click: () => mainWindow?.webContents.send('menu:import'),
        },
        {
          label: 'Export as JSON…',
          accelerator: 'CmdOrCtrl+S',
          click: () => mainWindow?.webContents.send('menu:export'),
        },
        {
          label: 'Export as PDF…',
          accelerator: 'CmdOrCtrl+P',
          click: () => mainWindow?.webContents.send('menu:export-pdf'),
        },
        { type: 'separator' },
        isMac ? { role: 'close' } : { role: 'quit' },
      ],
    },

    // Edit menu
    {
      label: 'Edit',
      submenu: [
        { role: 'undo' },
        { role: 'redo' },
        { type: 'separator' },
        { role: 'cut' },
        { role: 'copy' },
        { role: 'paste' },
        { role: 'selectAll' },
        { type: 'separator' },
        {
          label: 'Rename Selected Node',
          accelerator: 'F2',
          click: () => mainWindow?.webContents.send('menu:rename-selected'),
        },
        {
          label: 'Delete Selected Node',
          accelerator: 'Backspace',
          click: () => mainWindow?.webContents.send('menu:delete-selected'),
        },
        { type: 'separator' },
        {
          label: 'Clear Canvas',
          accelerator: 'CmdOrCtrl+Shift+Backspace',
          click: async () => {
            const { response } = await dialog.showMessageBox(mainWindow, {
              type: 'warning',
              buttons: ['Clear', 'Cancel'],
              defaultId: 1,
              cancelId: 1,
              message: 'Clear the canvas?',
              detail: 'All nodes and connections will be removed. This cannot be undone.',
            })
            if (response === 0) mainWindow?.webContents.send('menu:clear')
          },
        },
      ],
    },

    // Canvas menu
    {
      label: 'Canvas',
      submenu: [
        {
          label: 'Add Start Node',
          click: () => mainWindow?.webContents.send('menu:add-node', { type: 'startNode', label: 'Start' }),
        },
        {
          label: 'Add End Node',
          click: () => mainWindow?.webContents.send('menu:add-node', { type: 'endNode', label: 'End' }),
        },
        {
          label: 'Add Process Node',
          click: () => mainWindow?.webContents.send('menu:add-node', { type: 'processNode', label: 'Process' }),
        },
        {
          label: 'Add Decision Node',
          click: () => mainWindow?.webContents.send('menu:add-node', { type: 'decisionNode', label: 'Decision' }),
        },
        { type: 'separator' },
        {
          label: 'Fit View',
          accelerator: 'CmdOrCtrl+Shift+F',
          click: () => mainWindow?.webContents.send('menu:fit-view'),
        },
      ],
    },

    // View menu
    {
      label: 'View',
      submenu: [
        { role: 'reload' },
        { role: 'forceReload' },
        { type: 'separator' },
        { role: 'resetZoom' },
        { role: 'zoomIn' },
        { role: 'zoomOut' },
        { type: 'separator' },
        { role: 'togglefullscreen' },
        ...(isDev ? [{ type: 'separator' }, { role: 'toggleDevTools' }] : []),
      ],
    },

    // Window menu
    {
      label: 'Window',
      submenu: [
        { role: 'minimize' },
        { role: 'zoom' },
        ...(isMac ? [{ type: 'separator' }, { role: 'front' }] : []),
      ],
    },
  ]

  const menu = Menu.buildFromTemplate(template)
  Menu.setApplicationMenu(menu)
}

// Context menu for node right-click (triggered from renderer via IPC)
ipcMain.on('context-menu:node', (event, { nodeId, label }) => {
  const menu = Menu.buildFromTemplate([
    { label: `"${label}"`, enabled: false },
    { type: 'separator' },
    {
      label: 'Rename…',
      click: () => event.sender.send('node-action:rename', nodeId),
    },
    {
      label: 'Duplicate',
      click: () => event.sender.send('node-action:duplicate', nodeId),
    },
    { type: 'separator' },
    {
      label: 'Delete',
      click: () => event.sender.send('node-action:delete', nodeId),
    },
  ])
  menu.popup({ window: BrowserWindow.fromWebContents(event.sender) })
})

// Context menu for canvas right-click (empty area)
ipcMain.on('context-menu:canvas', (event, { x, y }) => {
  const menu = Menu.buildFromTemplate([
    { label: 'Add Node', enabled: false },
    { type: 'separator' },
    {
      label: 'Start Node',
      click: () => event.sender.send('canvas-action:add-node', { type: 'startNode', label: 'Start', x, y }),
    },
    {
      label: 'Process Node',
      click: () => event.sender.send('canvas-action:add-node', { type: 'processNode', label: 'Process', x, y }),
    },
    {
      label: 'Decision Node',
      click: () => event.sender.send('canvas-action:add-node', { type: 'decisionNode', label: 'Decision', x, y }),
    },
    {
      label: 'End Node',
      click: () => event.sender.send('canvas-action:add-node', { type: 'endNode', label: 'End', x, y }),
    },
    { type: 'separator' },
    {
      label: 'Fit View',
      click: () => event.sender.send('menu:fit-view'),
    },
    { type: 'separator' },
    {
      label: 'Export as JSON…',
      click: () => event.sender.send('menu:export'),
    },
    {
      label: 'Export as PDF…',
      click: () => event.sender.send('menu:export-pdf'),
    },
    {
      label: 'Import…',
      click: () => event.sender.send('menu:import'),
    },
  ])
  menu.popup({ window: BrowserWindow.fromWebContents(event.sender) })
})

// PDF export — renders via printToPDF (respects @media print CSS)
ipcMain.handle('export:pdf', async (event, { title }) => {
  const win = BrowserWindow.fromWebContents(event.sender)
  const slug = (title || 'process-map').toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
  const { filePath, canceled } = await dialog.showSaveDialog(win, {
    title: 'Export as PDF',
    defaultPath: `${slug}.pdf`,
    filters: [{ name: 'PDF Document', extensions: ['pdf'] }],
  })
  if (canceled || !filePath) return
  const pdfData = await win.webContents.printToPDF({
    printBackground: true,
    pageSize: 'A4',
    landscape: true,
  })
  fs.writeFileSync(filePath, pdfData)
})

app.whenReady().then(() => {
  createWindow()
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit()
})

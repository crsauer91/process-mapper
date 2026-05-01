# Process Mapper

A native macOS desktop app for drawing business process diagrams — drag-and-drop flowcharts with a clean dark UI.

Built with **React 19 + TypeScript + Vite + Electron + @xyflow/react**.

## Features

- **4 node types**: Start, End, Process, Decision (diamond)
- **Drag & drop** nodes from the palette onto the canvas
- **Connect nodes** by dragging from handles
- **Rename nodes** by double-clicking or via right-click context menu
- **Right-click nodes** for Rename, Duplicate, Delete
- **Right-click canvas** to add any node type at cursor position, Fit View, Export, or Import
- **Native app menu bar** — File, Edit, Canvas, View, and Window menus with full keyboard shortcuts
- **Editable process title** — click the title in the header to rename your diagram; export uses it as the filename
- **Export as PDF** — File menu (`Cmd+P`), toolbar button, or right-click canvas; native Save dialog, landscape A4, diagram only
- **Export / Import** diagrams as JSON
- **Draggable title bar** with version number
- Native macOS app (arm64 + x64 DMG)

## Development

```bash
npm install
npm run electron:dev   # Vite dev server + Electron
```

## Build

```bash
npm run electron:build  # Produces release/*.dmg
```

Output: `release/Process Mapper-{version}-arm64.dmg` and `release/Process Mapper-{version}.dmg`

## Tech Stack

| Layer | Library |
|-------|---------|
| UI Framework | React 19 + TypeScript |
| Build Tool | Vite 8 |
| Diagram Engine | @xyflow/react 12 |
| Desktop Shell | Electron 41 |
| Packaging | electron-builder 26 |

## CI/CD

- Every push to `main` runs lint + web build
- Pushing a `v*` tag builds both DMGs and creates a GitHub Release automatically

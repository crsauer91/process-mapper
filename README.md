# Process Mapper

A native macOS desktop app for drawing business process diagrams — drag-and-drop flowcharts with a clean dark UI.

Built with **React 19 + TypeScript + Vite + Electron + @xyflow/react**.

## Features

- **4 node types**: Start, End, Process, Decision (diamond)
- **Drag & drop** nodes from the palette onto the canvas
- **Connect nodes** by dragging from handles
- **Rename nodes** by double-clicking
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

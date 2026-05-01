# Changelog

All notable changes to this project will be documented in this file.
Format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/).

## [1.2.0] - 2026-05-01

### Added
- Export diagram as PDF via File → Export as PDF… (`Cmd+P`), toolbar button, or canvas right-click menu
- Uses Electron `printToPDF` with native Save dialog; outputs landscape A4 with diagram only (header, palette, toolbar, and controls hidden via `@media print`)

## [1.1.0] - 2026-05-01

### Added
- Native macOS app menu bar with File, Edit, Canvas, View, and Window submenus
- Right-click context menu on nodes: Rename, Duplicate, Delete
- Right-click context menu on canvas background: Add node (all types), Fit View, Export, Import
- Editable process title in the header bar (click to rename, Enter/Escape to confirm)
- Export filename now uses the process title as a slug
- Electron preload bridge (`contextBridge`) for secure IPC between main and renderer

### Changed
- App menu actions (New, Export, Import, Clear, Fit View, Rename/Delete selected) now available from menu bar in addition to toolbar buttons

## [1.0.0] - 2026-05-01

### Added
- Initial release of Process Mapper
- 4 node types: Start (green pill), End (red pill), Process (blue rect), Decision (orange diamond)
- Drag-and-drop palette for placing nodes on canvas
- Connect nodes by dragging from handles
- Double-click nodes to rename them
- Export diagram as JSON
- Import diagram from JSON
- Clear canvas button
- Native macOS desktop app (arm64 + x64 DMG) via Electron 41
- Draggable title bar with version number display
- Dark theme (Catppuccin-inspired)
- GitHub Actions CI/CD: lint+build on push, DMG release on `v*` tag

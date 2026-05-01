# Changelog

All notable changes to this project will be documented in this file.
Format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/).

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

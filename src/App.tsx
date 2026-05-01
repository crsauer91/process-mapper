import { useState, useRef } from 'react'
import './App.css'
import { Palette } from './Palette'
import { FlowCanvas } from './FlowCanvas'

declare const __APP_VERSION__: string

function App() {
  const [processTitle, setProcessTitle] = useState('Untitled Process')
  const [editing, setEditing] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const startEdit = () => {
    setEditing(true)
    setTimeout(() => inputRef.current?.select(), 0)
  }

  const commitEdit = (val: string) => {
    setEditing(false)
    const trimmed = val.trim()
    if (trimmed) setProcessTitle(trimmed)
  }

  return (
    <div className="app-layout">
      <header className="app-header">
        <span className="app-title">Process Mapper</span>
        <span className="app-divider">|</span>
        {editing ? (
          <input
            ref={inputRef}
            className="process-title-input"
            defaultValue={processTitle}
            onBlur={(e) => commitEdit(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') commitEdit((e.target as HTMLInputElement).value)
              if (e.key === 'Escape') setEditing(false)
            }}
            autoFocus
          />
        ) : (
          <span
            className="process-title"
            onClick={startEdit}
            title="Click to rename process"
          >
            {processTitle}
          </span>
        )}
        <span className="app-version">v{__APP_VERSION__}</span>
      </header>
      <div className="app-body">
        <Palette />
        <FlowCanvas processTitle={processTitle} />
      </div>
    </div>
  )
}

export default App

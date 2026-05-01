import './App.css'
import { Palette } from './Palette'
import { FlowCanvas } from './FlowCanvas'

function App() {
  return (
    <div className="app-layout">
      <header className="app-header">
        <span className="app-title">Process Mapper</span>
      </header>
      <div className="app-body">
        <Palette />
        <FlowCanvas />
      </div>
    </div>
  )
}

export default App

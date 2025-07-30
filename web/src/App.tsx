import { createSignal } from 'solid-js'
import './App.css'
import ByldCanvas from './webgpu/blyd-canvas'

function App() {
  const [count, setCount] = createSignal(0)

  return (
    <>
      <h1>BYLD3D</h1>
      <div>
        <ByldCanvas/>
      </div>
      <div class="card">
        <button onClick={() => setCount((count) => count + 1)}>
          count is {count()}
        </button>
      </div>
    </>
  )
}

export default App

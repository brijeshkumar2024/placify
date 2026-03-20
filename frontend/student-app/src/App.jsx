import { Routes, Route } from 'react-router-dom'

function App() {
  return (
    <Routes>
      <Route path="/" element={<div className="text-2xl font-bold p-8">Campus Placement Portal — Student App</div>} />
    </Routes>
  )
}

export default App
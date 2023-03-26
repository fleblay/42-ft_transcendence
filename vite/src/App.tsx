import { useState } from 'react'
import { MyForm } from './screen/NameSelector'

function App() {
  const [count, setCount] = useState(0)

  return (
    <div className="App">
     <MyForm/>
    </div>
  )
}

export default App

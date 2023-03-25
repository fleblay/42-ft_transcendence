import { useState } from 'react'
import { NameSelector } from './screen/NameSelector'

function App() {
  const [count, setCount] = useState(0)

  return (
    <div className="App">
     <NameSelector onSelect={()=> null}/>
    </div>
  )
}

export default App

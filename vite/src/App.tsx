import { useState } from 'react'
import { MyForm } from './screen/NameSelector'
import { GetAll } from './screen/getall'

function App() {
  const [count, setCount] = useState(0)

  return (
    <div className="App">
     <MyForm/>
	 <GetAll></GetAll>
    </div>
  )
}

export default App

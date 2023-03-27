import { MyForm } from './screen/NameSelector'
import { GetAll } from './screen/getall'
import { GameCanvas } from './game/game'

function App() {

  return (
    <div className="App">
     <MyForm/>
	 <GetAll></GetAll>
	 <GameCanvas/>
    </div>
  )
}

export default App

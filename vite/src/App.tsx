import { MyForm } from './screen/NameSelector'
import { GetAll } from './screen/getall'
import { GameCanvas } from './game/game'
import React from 'react'

const apiCall = {
	event: "bts:subscribe",
	data: {channel: "order_book_btcusd"}
}

const ws = new WebSocket("wss://ws.bitstamp.net")

ws.onopen = (event) => {
	ws.send(JSON.stringify(apiCall))
}

ws.onmessage = (event) => {
	const json = JSON.parse(event.data)
	console.log(json)
}

function App() {

  return (
    <div className="App">
     <MyForm/>
	 <GetAll></GetAll>
	{/*<GameCanvas/>*/}
    </div>
  )
}

export default App

import {useState} from "react";
import React from "react";

function Square({win, value, onSquareClick}: any) {
	return <button className={win === undefined ? "square" : "square_win"} onClick={onSquareClick}>{value}</button>
}

function Board({xIsNext, squares, onPlay}: any): JSX.Element {

	function handleClick(i:number) {
		return () => {
		if (squares[i] || calculategameOver(squares))
			return
		const nextSquares = squares.slice()
		nextSquares[i] = xIsNext ? "X" : "O"
		onPlay(nextSquares)
		}
	}
	const gameOver = calculategameOver(squares)
	let status = gameOver ? `Winner: ${gameOver.gameOver} with ${gameOver.winningrow}` : xIsNext ? "Next is X" : "Next is O"
	return (
			<>
			<div className="status">{status}</div>
			<div className="board-row">
				<Square win={gameOver?.winningrow.find(e => e == 0)} value={squares[0]} onSquareClick={handleClick(0)} />
				<Square win={gameOver?.winningrow.find(e => e == 1)} value={squares[1]} onSquareClick={handleClick(1)} />
				<Square win={gameOver?.winningrow.find(e => e == 2)} value={squares[2]} onSquareClick={handleClick(2)} />
			</div>
			<div className="board-row">
				<Square win={gameOver?.winningrow.find(e => e == 3)} value={squares[3]} onSquareClick={handleClick(3)} />
				<Square win={gameOver?.winningrow.find(e => e == 4)} value={squares[4]} onSquareClick={handleClick(4)} />
				<Square win={gameOver?.winningrow.find(e => e == 5)} value={squares[5]} onSquareClick={handleClick(5)} />
			</div>
			<div className="board-row">
				<Square win={gameOver?.winningrow.find(e => e == 6)} value={squares[6]} onSquareClick={handleClick(6)} />
				<Square win={gameOver?.winningrow.find(e => e == 7)} value={squares[7]} onSquareClick={handleClick(7)} />
				<Square win={gameOver?.winningrow.find(e => e == 8)} value={squares[8]} onSquareClick={handleClick(8)} />
			</div>
			</>
		   )
}

export default function Game() {
	const [history, setHistory] = useState([Array(9).fill(null)])
	const [currentMove, setCurrentMove] = useState(0)
	const xIsNext = currentMove % 2 === 0
	const currentSquares = history[currentMove]

	function handlePlay(nextSquares: any) {
		const nextHistory = [...history.slice(0, currentMove + 1), nextSquares]
		setHistory(nextHistory)
		setCurrentMove(nextHistory.length - 1)
	}

	function jumpTo(nextMove: any) {
		setCurrentMove(nextMove)
	}

	const moves = history.map((squares, move) => {
		let description = move > 0 ? `Got to move # ${move}` : "Go to game start"
		return (
			<li key={move}>
				<button onClick={() => jumpTo(move)}>{description}</button>
			</li>
		)
	})

	return (
		<div className="game">
			<div className="game-board">
				<Board xIsNext={xIsNext} squares={currentSquares} onPlay={handlePlay}/>
			</div>
			<div className="game-info">
				<ol>{moves}</ol>
			</div>
		</div>
	)
}

function calculategameOver(squares: number[]) {
  const lines = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [2, 4, 6]
  ];
  for (let i = 0; i < lines.length; i++) {
    const [a, b, c] = lines[i];
    if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
      return {winningrow : lines[i], gameOver: squares[a]};
    }
  }
  return null;
}

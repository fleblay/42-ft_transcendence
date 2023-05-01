import { IgameInfo } from "../types";

export function GameFinishedScreen({ gameInfo }: { gameInfo: IgameInfo | null}) {
	return (
		<div>
			<div>Game finished</div>
			<div>Winner: {gameInfo?.players.map((player, index) => <div key={index}>{player.score}</div>)}</div>
		</div>
	)
}

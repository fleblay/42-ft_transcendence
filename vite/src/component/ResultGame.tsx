import { Box, Typography } from "@mui/material";
import { IgameInfo } from "../types";
import { useAuthService } from "../auth/AuthService";

export function GameFinishedScreen({ gameInfo }: { gameInfo: IgameInfo | null}) {
	const auth = useAuthService()

	const winner = gameInfo?.players.reduce((prev, current) => {
		if (prev.score > current.score) {
			return prev
		} else {
			return current
		}
	})
	return (
		<Box sx={{ display: 'flex', alignItems: 'center', flexDirection: 'column', margin: theme => `${theme.spacing(8)} 0`  }}>
			<Typography paddingBottom={2} color='primary' variant="h3">{winner?.user.id === auth.user?.id ? 'You won!' : `${winner?.user.username} won!`}</Typography>
			<Typography variant="h4">Scores</Typography>
			<Box sx={{ display: 'flex', justifyContent: 'center' }}>
				{gameInfo?.players.map((player, index, array) => (
					<Box key={player.user.id} sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', borderRight: array.length - 1 === index ? 0 : 2, borderColor: (theme) => theme.palette.primary.main, padding: theme => `${theme.spacing(2)} ${theme.spacing(3)}` }}>
						<Typography variant="h6" >{player.user.username}</Typography>
						<Typography>{player.score}</Typography>
					</Box>
				))}
			</Box>
		</Box>
	)
}

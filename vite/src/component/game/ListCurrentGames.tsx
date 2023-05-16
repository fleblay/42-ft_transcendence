import VisibilityIcon from '@mui/icons-material/Visibility';
import { Avatar, Box, Button, Typography } from '@mui/material';
import Paper from '@mui/material/Paper';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableRow from '@mui/material/TableRow';
import React from 'react';
import apiClient from '../../auth/interceptor.axios';
import { SocketContext } from '../../socket/SocketProvider';
import { CurrentGame, GameOptions } from '../../types';

interface ListCurrentGamesProps {
	joinGame: (options: GameOptions, game?: string) => void;
}

export const ListCurrentGames: React.FC<ListCurrentGamesProps> = ({ joinGame }) => {

	const [listGames, setListGames] = React.useState<{ [gameId: string]: CurrentGame }>({});
	const { addSubscription, customOff, customOn } = React.useContext(SocketContext);

	React.useEffect(() => {
		apiClient.get<CurrentGame[]>('/api/game/current').then((res) => {
			const games = res.data;
			if (!games || !Array.isArray(games)) return;
			setListGames(games.reduce<{ [gameId: string]: CurrentGame }>((prev, game) => {
				prev[game.id] = game;
				return prev;
			}, {}));
		});
		return addSubscription('game.current');
	}, []);

	React.useEffect(() => {
		function updateCurrentGame(game: CurrentGame) {
			setListGames((prev) => {
				return {
					...prev,
					[game.id]: game
				}
			});
		}
		function onDeleteCurrentGame(gameId: string) {
			setListGames((prev) => {
				const { [gameId]: _, ...rest } = prev;
				return rest;
			});
		}
		customOn('game.current.update', updateCurrentGame);
		customOn('game.current.delete', onDeleteCurrentGame);
		return () => {
			customOff('game.current.update', updateCurrentGame);
			customOff('game.current.delete', onDeleteCurrentGame);
		};
	}, [listGames]);

	const arrayGames = Object.values(listGames);

	if (!arrayGames.length) return null;

	return (
		<TableContainer component={Paper} sx={{ width: '50%' }}>
			<Table sx={{ minWidth: '100%', maxHeight: 200, overflowY: 'auto' }}>
				<TableBody>
					{arrayGames.map((game) => (
						<TableRow key={game.id}>
							<TableCell component="th" scope="row" sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-evenly' }}>
								{game.players.map((player, index, arr) => (
									<React.Fragment key={player.id}>
										<Box sx={{ display: 'flex', alignItems: 'center', flexDirection: 'column' }}>
											<Avatar sx={{ width: 24, height: 24, mb: 1 }} src={`/avatars/${player.id}.png`} />
											{player.username}
										</Box>
										{
											index === arr.length - 1 ? null : <Typography variant="h6">vs</Typography>
										}
									</React.Fragment>
								))}
							</TableCell>
							<TableCell style={{ width: 25 }} align="right">
								<Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between'}}>
									{<VisibilityIcon />}{game.viewers}
								</Box>
							</TableCell>
							<TableCell style={{ width: 80 }} align="right">
								<Button onClick={() => joinGame({}, game.id)}>Spectate</Button>
							</TableCell>
						</TableRow>
					))}
				</TableBody>
			</Table>
		</TableContainer>
	);
}

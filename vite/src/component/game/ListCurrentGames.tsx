import React, { useEffect, useState } from 'react';
import { CurrentGame, GameOptions } from '../../types';
import { Box, Typography, Button } from '@mui/material';
import apiClient from '../../auth/interceptor.axios';
import { SocketContext } from '../../socket/SocketProvider';

interface ListCurrentGamesProps {
	joinGame: (options: GameOptions, game?: string) => void;
}

export const ListCurrentGames: React.FC<ListCurrentGamesProps> = ({ joinGame }) => {
	const [listGames, setListGames] = React.useState<{[gameId: string]: CurrentGame}>({});
	const { addSubscription, customOff, customOn } = React.useContext(SocketContext);

	React.useEffect(() => {
		apiClient.get<CurrentGame[]>('/game/current').then((res) => {
			const games = res.data;
			setListGames(games.reduce<{[gameId: string]: CurrentGame}>((prev, game) => {
				prev[game.id] = game;
				return prev;
			}, {}));
		});
		return addSubscription('listGames');
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
		customOn('game.update', updateCurrentGame);
		return () => {
			customOff('game.update', updateCurrentGame);
		};
	}, [listGames]);

	return (
		<Box>
			{
				Object.values(listGames).map((game) => {
					return (
						<Box key={game.id}>
							<Typography>{game.id}</Typography>
							<Button onClick={() => joinGame({}, game.id)}>Join</Button>
						</Box>
					);
				})
			}
		</Box>
	);
}

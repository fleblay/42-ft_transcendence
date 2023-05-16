import React from 'react';
import { CurrentGame, GameOptions } from '../../types';
import { Box, Button } from '@mui/material';
import apiClient from '../../auth/interceptor.axios';
import { SocketContext } from '../../socket/SocketProvider';
import { useTheme } from '@mui/material/styles';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableFooter from '@mui/material/TableFooter';
import TablePagination from '@mui/material/TablePagination';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import IconButton from '@mui/material/IconButton';
import FirstPageIcon from '@mui/icons-material/FirstPage';
import KeyboardArrowLeft from '@mui/icons-material/KeyboardArrowLeft';
import KeyboardArrowRight from '@mui/icons-material/KeyboardArrowRight';
import LastPageIcon from '@mui/icons-material/LastPage';

interface TablePaginationActionsProps {
	count: number;
	page: number;
	rowsPerPage: number;
	onPageChange: (
		event: React.MouseEvent<HTMLButtonElement>,
		newPage: number,
	) => void;
}

function TablePaginationActions(props: TablePaginationActionsProps) {
	const theme = useTheme();
	const { count, page, rowsPerPage, onPageChange } = props;

	const handleBackButtonClick = (event: React.MouseEvent<HTMLButtonElement>) => {
		onPageChange(event, page - 1);
	};

	const handleNextButtonClick = (event: React.MouseEvent<HTMLButtonElement>) => {
		onPageChange(event, page + 1);
	};
	return (
		<Box sx={{ flexShrink: 0, ml: 2.5 }}>
			<IconButton
				onClick={handleBackButtonClick}
				disabled={page === 0}
				aria-label="previous page"
			>
				{theme.direction === 'rtl' ? <KeyboardArrowRight /> : <KeyboardArrowLeft />}
			</IconButton>
			<IconButton
				onClick={handleNextButtonClick}
				disabled={page >= Math.ceil(count / rowsPerPage) - 1}
				aria-label="next page"
			>
				{theme.direction === 'rtl' ? <KeyboardArrowLeft /> : <KeyboardArrowRight />}
			</IconButton>
		</Box>
	);
}

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

	const [page, setPage] = React.useState(0);
	const [rowsPerPage, setRowsPerPage] = React.useState(5);

	// Avoid a layout jump when reaching the last page with empty rows.
	const emptyRows =
		page > 0 ? Math.max(0, (1 + page) * rowsPerPage - arrayGames.length) : 0;

	const handleChangePage = (
		event: React.MouseEvent<HTMLButtonElement> | null,
		newPage: number,
	) => {
		setPage(newPage);
	};

	const handleChangeRowsPerPage = (
		event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
	) => {
		setRowsPerPage(parseInt(event.target.value, 10));
		setPage(0);
	};

	if (!arrayGames.length) return null;

	return (
		<TableContainer component={Paper} sx={{ width: '50%' }}>
			<Table sx={{ minWidth: 500 }} aria-label="custom pagination table">
				<TableBody>
					{(rowsPerPage > 0
						? arrayGames.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
						: arrayGames
					).map((game) => (
						<TableRow key={game.id}>
							<TableCell component="th" scope="row">
								{game.players.length}
							</TableCell>
							<TableCell style={{ width: 160 }} align="right">
								{game.viewers}
							</TableCell>
							<TableCell style={{ width: 160 }} align="right">
							<Button onClick={() => joinGame({}, game.id)}>Join</Button>
							</TableCell>

						</TableRow>
					))}
					{emptyRows > 0 && (
						<TableRow style={{ height: 53 * emptyRows }}>
							<TableCell colSpan={6} />
						</TableRow>
					)}
				</TableBody>
				<TableFooter>
					<TableRow>
						<TablePagination
							rowsPerPageOptions={[5, 10, 25]}
							colSpan={3}
							count={arrayGames.length}
							rowsPerPage={rowsPerPage}
							page={page}
							SelectProps={{
								inputProps: {
									'aria-label': 'rows per page',
								},
								native: true,
							}}
							onPageChange={handleChangePage}
							onRowsPerPageChange={handleChangeRowsPerPage}
							ActionsComponent={TablePaginationActions}
						/>
					</TableRow>
				</TableFooter>
			</Table>
		</TableContainer>
	);
}

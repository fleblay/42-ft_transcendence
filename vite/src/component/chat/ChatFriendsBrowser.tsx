import { Avatar, Box, Button, IconButton, List, ListItem, ListItemText, TextField, Theme, Toolbar, Typography } from "@mui/material"
import { FC, useContext, useEffect, useState } from "react"
import { Channel, Friend } from "../../types"
import { useNavigate } from "react-router-dom"
import apiClient from "../../auth/interceptor.axios"
import { SocketContext } from "../../socket/SocketProvider"
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import SearchIcon from '@mui/icons-material/Search';
import { styled, alpha } from '@mui/material/styles';
import InputBase from '@mui/material/InputBase';
import { useDebouncedValue } from "../Debounced"
import { useAuthService } from "../../auth/AuthService"
import MessageOutlinedIcon from '@mui/icons-material/MessageOutlined';
import Badge from '@mui/material/Badge';

export const StyledBadge = styled(Badge)(({ theme, color }) => ({
	'& .MuiBadge-badge': {
		backgroundColor: color,
		color: color,
		boxShadow: `0 0 0 2px ${theme.palette.background.paper}`,
		'&::after': {
			position: 'absolute',
			top: 0,
			left: 0,
			width: '100%',
			height: '100%',
			borderRadius: '50%',
			animation: 'ripple 1.2s infinite ease-in-out',
			border: '1px solid currentColor',
			content: '""',
		},
	},
	'@keyframes ripple': {
		'0%': {
			transform: 'scale(.8)',
			opacity: 1,
		},
		'100%': {
			transform: 'scale(2.4)',
			opacity: 0,
		},
	},
}));


export const FriendsBrowser: FC = () => {

	const [friendList, setFriendList] = useState<Map<number, Friend>>(new Map());
	const [searchFriends, setSearchFriends] = useState<string>("");
	const [debouncedSearchFriends] = useDebouncedValue(searchFriends, 10);
	const auth = useAuthService();
	const navigate = useNavigate();

	const { addSubscription, customOn, customOff } = useContext(SocketContext);

	useEffect(() => {
		return addSubscription(`/chat/friends/${auth.user?.id}`);
	}, [auth.user]);


	useEffect(() => {
		function onFriendUpdate({ status, friend }: { status: 'removed' | 'update', friend: Friend }) {
			console.log("onFriendUpdate", friend);
			if (status === 'removed') {
				setFriendList((oldFriendList) => {
					const newFriendList = new Map(oldFriendList);
					newFriendList.delete(friend.id);
					return newFriendList;
				})
			} else {
				setFriendList((oldFriendList) => {
					return new Map(oldFriendList.set(friend.id, friend));
				});
			}
		}
		customOn("chat.friend.update", onFriendUpdate);
		return () => {
			customOff("chat.friend.update", onFriendUpdate);
		}
	}, [friendList])

	useEffect(() => {
		if (!auth.user) return;
		console.log('Fetching friends')
		apiClient.get(`/api/friends?status=accepted`).then((response) => {
			console.log("Friends", response);
			let result: Map<number, Friend> = new Map();
			response.data.forEach((friend: Friend) => {
				result.set(friend.id, friend);
			});
			setFriendList(result);
		}).catch((error) => {
			console.error('Error fetching friends: ', error.response.data);
		});

	}, [auth.user]);

	const joinDm = (userId: number) => {
		apiClient.post(`/api/chat/dm/${userId}/join`).then((response) => {
			console.log("joinChannel", response);
			navigate(`/chat/${response.data}`);
		}).catch((error) => {
			console.log(error);
		});
	}

	return (
		<Box>
			<Box sx={{ marginTop: 1 }}>
				<Search>
					<SearchIconWrapper>
						<SearchIcon />
					</SearchIconWrapper>
					<StyledInputBase
						placeholder="Search…"
						inputProps={{ 'aria-label': 'search' }}
						value={searchFriends}
						onChange={(event) => setSearchFriends(event.target.value)}
					/>
				</Search>
				<Typography variant="subtitle1" sx={{ marginLeft: 1, marginTop: 1 }} color="text.secondary"
				>{`${friendList.size} Friends`}</Typography>
			</Box>
			<List
				sx={{
					overflow: 'auto',
					maxHeight: 500,
				}}
			>
				{Array.from(friendList, ([key, value]) => value)
					.filter((friend: Friend) => friend.username.includes(debouncedSearchFriends))
					.map((friend: Friend, index, array) => {

							return (
								<ListItem key={friend.id} sx={{
									paddingTop: 0,
									paddingBottom: 0,
									borderBottom: array.length - 1 === index ? 1 : 0,
									borderTop: 1,
									borderColor: (theme: Theme) => theme.palette.grey[300]
								}}>
									<StyledBadge
										overlap="circular"
										anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
										variant="dot"
										color={friend.status == "online" ? "success" : "error"}
									>
										<Avatar src={`/avatars/${friend.id}.png`} sx={{ margin: 1, width: '40px', height: '40px' }} />
									</StyledBadge>
									<ListItemText primary={friend.username} />
									<IconButton onClick={() => joinDm(friend.id)}><MessageOutlinedIcon /></IconButton>
								</ListItem>
							)
						})
					}
			</List>
		</Box>
	)
}

const Search = styled('div')(({ theme }) => ({
	position: 'relative',
	borderRadius: theme.shape.borderRadius,
	backgroundColor: theme.palette.common.white,
	'&:hover': {
		backgroundColor: theme.palette.common.white,
	},
	marginLeft: 0,
	width: '100%',
	[theme.breakpoints.up('sm')]: {
		marginLeft: theme.spacing(1),
		width: 'auto',
	},
}));

const SearchIconWrapper = styled('div')(({ theme }) => ({
	padding: theme.spacing(0, 2),
	height: '100%',
	position: 'absolute',
	pointerEvents: 'none',
	display: 'flex',
	alignItems: 'center',
	justifyContent: 'center',
}));

const StyledInputBase = styled(TextField)(({ theme }) => ({
	color: 'inherit',
	'& .MuiInputBase-input': {
		padding: theme.spacing(1, 1, 1, 0),
		// vertical padding + font size from searchIcon
		paddingLeft: `calc(1em + ${theme.spacing(4)})`,
		transition: theme.transitions.create('width'),
		width: '100%',
		[theme.breakpoints.up('sm')]: {
			width: '12ch',
			'&:focus': {
				width: '20ch',
			},
		},
	},
}));
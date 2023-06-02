import MessageOutlinedIcon from '@mui/icons-material/MessageOutlined'
import { Avatar, Box, IconButton, Link, List, ListItem, ListItemText, Theme, Typography, styled } from "@mui/material"
import Badge from '@mui/material/Badge'
import { FC, useContext, useEffect, useState } from "react"
import { Link as LinkRouter, useNavigate } from "react-router-dom"
import { useAuthService } from "../../auth/AuthService"
import apiClient from "../../auth/interceptor.axios"
import { SocketContext } from "../../socket/SocketProvider"
import { Friend } from "../../types"
import { useDebouncedValue } from "../Debounced"
import { SearchBar } from "../SearchBar"

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


interface FriendDisplayProps {
	originalFriend: Friend;
	index: number;
	array: Friend[];
}


const FriendDisplay: FC<FriendDisplayProps> = ({ originalFriend, index, array }) => {
	const navigate = useNavigate();
	const [friend, setFriend] = useState<Friend>(originalFriend);
	const { addSubscription, customOn, customOff } = useContext(SocketContext);

	useEffect(() => {
		return addSubscription(`/player/${friend.id}`);
	}, []);

	useEffect(() => {
		function onFriendUpdate({ userId, event }: { userId: number, event: string }) {
			switch (event) {
				case "connected":
					setFriend((oldFriend) => {
						return { ...oldFriend, online: true };
					});
					break;
				case "disconnected":
					setFriend((oldFriend) => {
						return { ...oldFriend, online: false };
					});
					break;
				default:
					break;

			}
		}
		customOn("page.player", onFriendUpdate);
		return () => {
			customOff("page.player", onFriendUpdate);
		}
	}, [friend])

	const joinDm = (userId: number) => {
		apiClient.post(`/api/chat/dm/${userId}/join`).then((response) => {
			navigate(`/chat/${response.data}`);
		}).catch((error) => {});
	}
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
				color={friend.online ? "success" : "error"}
			>
				<Avatar src={`${(import.meta.env.BASE_URL === "/" ? "" : import.meta.env.BASE_URL)}/avatars/${friend.id}.png`} sx={{ margin: 1, width: '40px', height: '40px' }} />
			</StyledBadge>

				<ListItemText primary={
					<Link component={LinkRouter} to={`/player/${friend.id}`}>{friend.username}</Link>
				} />

			<IconButton onClick={() => joinDm(friend.id)}><MessageOutlinedIcon /></IconButton>
		</ListItem>
	)
}



export const FriendsBrowser: FC = () => {

	const [friendList, setFriendList] = useState<Map<number, Friend>>(new Map());
	const [searchFriends, setSearchFriends] = useState<string>("");
	const [debouncedSearchFriends] = useDebouncedValue(searchFriends, 10);
	const auth = useAuthService();

	const { addSubscription, customOn, customOff } = useContext(SocketContext);

	useEffect(() => {
		return addSubscription(`/chat/friends/${auth.user?.id}`);
	}, [auth.user]);


	useEffect(() => {
		function onFriendUpdate({ status, friend }: { status: 'removed' | 'update', friend: Friend }) {
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
		customOn("chat.friends.update", onFriendUpdate);
		return () => {
			customOff("chat.friends.update", onFriendUpdate);
		}
	}, [friendList])

	useEffect(() => {
		if (!auth.user) return;
		apiClient.get(`/api/friends?status=accepted`).then((response) => {
			let result: Map<number, Friend> = new Map();
			response.data.forEach((friend: Friend) => {
				result.set(friend.id, friend);
			});
			setFriendList(result);
		}).catch((error) => {
			console.error('Error fetching friends: ', error.response.data);
		});

	}, [auth.user]);



	return (
		<Box>
			<Box sx={{ marginTop: 1 }}>
				<SearchBar value={searchFriends} onChange={(event) => setSearchFriends(event.target.value)} />
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
							<FriendDisplay key={friend.id} originalFriend={friend} index={index} array={array} />
						)
					})
				}
			</List>
		</Box>
	)
}

import { Box, Button, List, ListItem, ListItemText, TextField, Theme, Toolbar, Typography } from "@mui/material"
import { FC, useContext, useEffect, useState } from "react"
import { Channel } from "../../types"
import { useNavigate } from "react-router-dom"
import apiClient from "../../auth/interceptor.axios"
import { SocketContext } from "../../socket/SocketProvider"
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import SearchIcon from '@mui/icons-material/Search';
import { styled, alpha } from '@mui/material/styles';
import InputBase from '@mui/material/InputBase';
import { useDebouncedValue } from "../Debounced"

interface ChannelMap { [id: number]: Channel };

export const ChannelBrowser: FC = () => {
	const [publicChannels, setPublicChannels] = useState<ChannelMap>({});
	const [searchChannel, setSearchChannel] = useState<string>("");
	const [debouncedSearchChannel] = useDebouncedValue(searchChannel, 10);

	const navigate = useNavigate();

	const { addSubscription, customOn, customOff } = useContext(SocketContext);

	useEffect(() => {
		return addSubscription(`/chat/public`);
	}, []);

	useEffect(() => {
		function onUpdateChannel(channel: Channel) {
			console.log("onNewMessage", channel);
			setPublicChannels((oldChannel) => {
				return { ...oldChannel, [channel.id]: channel };
			});
		}

		customOn("chat.message.new", onUpdateChannel);
		return () => {
			customOff("chat.message.new", onUpdateChannel);
		};
	}, [publicChannels])

	useEffect(() => {
		apiClient.get(`/api/chat/channels/my`).then((response) => {

			let result: ChannelMap = response.data.reduce((map: ChannelMap, obj: Channel) => {
				map[obj.id] = obj;
				return map;
			}, {});
			setPublicChannels(result);
		}).catch((error) => {
			console.log(error);
		});
	}, []);

	const joinChannel = (channelId: number) => {
		apiClient.post(`/api/chat/channels/${channelId}/join`).then((response) => {
			console.log("joinChannel", response);
			navigate(`/chat/${channelId}`);
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
						value={searchChannel}
						onChange={(event) => setSearchChannel(event.target.value)}
					/>
				</Search>
				<Typography variant="subtitle1" sx={{ marginLeft: 1, marginTop: 1 }} color="text.secondary"
				>{`${Object.values(publicChannels).length} channels`}</Typography>
			</Box>
			<List
				sx={{
					overflow: 'auto',
					maxHeight: 500,
				}}
			>
				{Object.values(publicChannels)
					.filter((channel: Channel) => debouncedSearchChannel.length === 0 || channel.name.toLowerCase().includes(debouncedSearchChannel.toLowerCase()))
					.map((channel: Channel, index, array) => (
						<ListItem key={channel.id} sx={{
							paddingTop: 0,
							paddingBottom: 0,
							'&:hover': {
								bgcolor: (theme: Theme) => theme.palette.grey[200],
								'> button': {
									visibility: 'visible'
								}
							},
							borderBottom: array.length - 1 === index ? 1 : 0,
							borderTop: 1,
							borderColor: (theme: Theme) => theme.palette.grey[300],
							'> button': {
								visibility: 'hidden'
							}
						}}>
							{channel.hasPassword &&
								<LockOutlinedIcon
									sx={{
										color: (theme: Theme) => theme.palette.grey[500],
										marginRight: 1
									}}
								/>}
							<ListItemText
								primary={channel.name}
								secondary={`${channel.members?.length} members`}
							/>
							<Button onClick={() => joinChannel(channel.id)} variant='contained' color='success'>Join</Button>
						</ListItem>
					))}
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
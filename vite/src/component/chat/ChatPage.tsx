import { AppBar, Box, Button, Container, Divider, Fab, Grid, Tab, Tabs, TextField, Typography } from '@mui/material';
import React, { useRef, useState, useEffect, useContext } from 'react';
import apiClient from '../../auth/interceptor.axios';
import { ChannelsListDebug, MyChannelsList } from './ChannelsList';
import { MessageArea } from './MessageArea';
import { SocketContext } from '../../socket/SocketProvider';
import { useParams } from 'react-router-dom';
import { MemberList } from './ChannelMemberList';
import { Channel } from '../../types'
import ChatMenu from './ChatMenu';
import { ChannelBrowser } from './ChannelBrowse';
import { FriendsBrowser } from './ChatFriendsBrowser';


const MyChannels = ({ channelId }: { channelId: string }) => {
	return (
		<>
			<Grid container spacing={3}>
				<Grid item xs={2}>
					<Typography textAlign={'center'}> Channels</Typography>
				</Grid>
				<Grid item xs={8}>
					<Typography textAlign={'center'}> {channelId} </Typography>
				</Grid>
				<Grid item xs={2}>
					<Typography textAlign={'center'}> User</Typography>
				</Grid>
			</Grid>
			<Divider />
			<Grid container spacing={2}>
				<Grid item xs={3}>
					<ChatMenu />
				</Grid>
				<Grid item xs={7}>

					{channelId
						? (
							channelId === 'friends'
								? <FriendsBrowser />
								: <MessageArea channelId={channelId} />
						)
						: <ChannelBrowser />}
				</Grid>
				<Grid item xs={2}>
					{channelId && channelId !== 'friends' ? <MemberList channelId={channelId} /> : null}
				</Grid>
			</Grid>
			<Divider />
			<Grid container spacing={3} sx={{ mt: "20px" }}>
				<Grid item xs={2}>
				</Grid>
			</Grid>
		</>
	)
}

export function ChatPage() {

	const [channels, setChannels] = useState<Channel[]>([]);
	const { addSubscription, customOn, customOff } = useContext(SocketContext);
	const { channelId } = useParams();

	useEffect(() => {
		console.log('changing chat', channelId)
		return addSubscription(`/chat/${channelId || ''}`);
	}, [channelId]);


	useEffect(() => {
		function onNewChannel(data: Channel) {
			console.log('newChannel', data);
			setChannels((channels) => [...channels, data]);
		}
		customOn('newChannel', onNewChannel);
		return () => {
			customOff('newChannel', onNewChannel);
		};
	}, []);

	const createChannel = () => {
		console.log("createChannel");
		const channelParams = {
			name: "test" + Math.floor(Math.random() * 1000),
			private: false,
			password: "test"
		}
		apiClient.post(`/api/chat/channels/create`, channelParams).then((response) => {
			console.log("channels/create", "ok");
		}).catch((error) => {
			console.log(error);
		}
		);
	}

	return (
		<>
			<Container maxWidth="xl" sx={{ maxHeight: '100px', minHeight: '100px' }}>
				<AppBar position="static" sx={{ borderTopLeftRadius: '16px', borderTopRightRadius: '16px', height: '80px' }}>
					<Typography textAlign="center" variant="h6" sx={{ flexGrow: 1, paddingTop: '25px' }}>
						Chat
					</Typography>
				</AppBar>
				<Box sx={{
					width: '100%',
					border: '1px solid #D3C6C6',
					boxShadow: '0px 4px 4px rgba(0, 0, 0, 0.25)',
					borderRadius: '0 0 16px 16px',
					p: '2rem',
					bgcolor: 'background.paper',
					maxHeight: 'calc(100vh - 80px)',
					overflowY: 'scroll'
				}}>
					<MyChannels channelId={channelId || ''} />
				</Box>
			</Container >
		</>
	);
}

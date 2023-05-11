import { AppBar, Box, Button, Container, Divider, Fab, Grid, Tab, Tabs, TextField, Typography } from '@mui/material';
import React, { useRef, useState, useEffect, useContext } from 'react';
import apiClient from '../../auth/interceptor.axios';
import { MessageArea } from './MessageArea';
import { SocketContext } from '../../socket/SocketProvider';
import { useParams } from 'react-router-dom';
import { MemberList } from './ChannelMemberList';
import { Channel, ChannelInfo } from '../../types'
import ChatMenu from './ChatMenu';
import { ChannelBrowser } from './ChannelBrowse';
import { FriendsBrowser } from './ChatFriendsBrowser';


const MyChannels = ({ channelInfo, channelId }: { channelInfo: ChannelInfo | null, channelId: string }) => {
	return (
		<>
			<Grid container spacing={3}>
				<Grid item xs={2}>
					<Typography textAlign={'center'}> Channels</Typography>
				</Grid>
				{
					channelInfo
					&& (
						<>
							<Grid item xs={8}>
								<Typography textAlign={'center'}> {channelInfo.name} </Typography>
							</Grid>
							{
								!channelInfo.directMessage
								&& (
									<Grid item xs={2}>
										<Typography textAlign={'center'}>Users</Typography>
									</Grid>
								)
							}
						</>
					)
				}
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
					{channelId
						&& channelId !== 'friends'
						&& !channelInfo?.directMessage
						? <MemberList channelId={channelId} />
						: null
					}
				</Grid>
			</Grid>
		</>
	)
}

export function ChatPage() {

	const [channelInfo, setChannelInfo] = useState<ChannelInfo | null>(null);
	const { addSubscription, customOn, customOff } = useContext(SocketContext);
	const { channelId } = useParams();

	useEffect(() => {
		console.log('changing chat', channelId)
		return addSubscription(`/chat/${channelId || ''}`);
	}, [channelId]);

	useEffect(() => {
		if (!channelId || channelId === 'friends')
			setChannelInfo(null);
		else {
			apiClient.get<ChannelInfo>(`/api/chat/channels/${channelId}/info`).then(({ data }) => {
				setChannelInfo(data);
			}).catch((error) => {
				console.log(error);
			});
		}

	}, [channelId]);

	return (
		<>
			<Container maxWidth="xl" sx={{ maxHeight: '100px', minHeight: '100px' }}>
				<AppBar position="static"
					sx={({ shape }) => ({
						borderRadius: `${shape.borderRadius}px ${shape.borderRadius}px 0 0`,
						height: '80px'
					})}>
					<Typography textAlign="center" variant="h6" sx={{ flexGrow: 1, paddingTop: '25px' }}>
						Chat
					</Typography>
				</AppBar>
				<Box sx={({ shape }) => ({
					width: '100%',
					border: '1px solid #D3C6C6',
					boxShadow: '0px 4px 4px rgba(0, 0, 0, 0.25)',
					borderRadius: `0 0 ${shape.borderRadius}px ${shape.borderRadius}px`,
					p: '2rem',
					bgcolor: 'background.paper',
					maxHeight: 'calc(100vh - 80px)',
					overflowY: 'scroll'
				})}>
					<MyChannels channelInfo={channelInfo} channelId={channelId || ''} />
				</Box>
			</Container >
		</>
	);
}

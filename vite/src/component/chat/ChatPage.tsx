import { AppBar, Box, Button, Container, Divider, Grid, Typography } from '@mui/material';
import React, { useState, useEffect, useContext } from 'react';
import apiClient from '../../auth/interceptor.axios';
import { MessageArea } from './MessageArea';
import { SocketContext } from '../../socket/SocketProvider';
import { useNavigate, useParams } from 'react-router-dom';
import { MemberList } from './ChannelMemberList';
import { Channel, ChannelInfo } from '../../types'
import ChatMenu from './ChatMenu';
import { ChannelBrowser } from './ChannelBrowse';
import { FriendsBrowser } from './ChatFriendsBrowser';
import { useAuthService } from '../../auth/AuthService';
import SettingsIcon from '@mui/icons-material/Settings';
import ShieldOutlinedIcon from '@mui/icons-material/ShieldOutlined';
import { ModifyChannelModal } from './ModifyChannelModal';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';

const MyChannels = ({ channelInfo, channelId }: { channelInfo: ChannelInfo | null, channelId: string }) => {
	const { user } = useAuthService()

	const [openModal, setOpenModal] = useState(false)

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
								<Typography textAlign={'center'} >
									{!channelInfo.directMessage && channelInfo.private && <ShieldOutlinedIcon style={{ verticalAlign: 'middle' }} sx={{ color: (theme) => theme.palette.grey[500], marginRight: 1, marginBottom: 0.5 }} />}
									{!channelInfo.directMessage && channelInfo.hasPassword && <LockOutlinedIcon style={{ verticalAlign: 'middle' }} sx={{ color: (theme) => theme.palette.grey[500], marginRight: 1, marginBottom: 0.5 }} />}

									{channelInfo.name}
									{!channelInfo.directMessage
										&& channelInfo.ownerId
										&& channelInfo.ownerId === user?.id
										&& <Button variant='text' onClick={() => setOpenModal(true)}><SettingsIcon /></Button>
									}
								</Typography>
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
			<ModifyChannelModal channelInfo={channelInfo} open={openModal} handleClose={() => setOpenModal(false)} />
		</>
	)
}

export function ChatPage() {

	const [channelInfo, setChannelInfo] = useState<ChannelInfo | null>(null);
	const { addSubscription, customOn, customOff } = useContext(SocketContext);
	const { channelId } = useParams();
	const auth = useAuthService();
	const [containerHeight, setContainerHeight] = useState(0);
	const navigate = useNavigate();

	useEffect(() => {
	  const handleResize = () => {
		const windowHeight = window.innerHeight;
		setContainerHeight(windowHeight);
	  };
  
	  handleResize();
  
	  window.addEventListener('resize', handleResize);
  
	  return () => {
		window.removeEventListener('resize', handleResize);
	  };
	}, []);

	useEffect(() => {
		return addSubscription(`/chat/${channelId || ''}`);
	}, [channelId]);

	useEffect(() => {
		return addSubscription(`/chat/myChannels/${auth.user?.id}`);
	}, [auth.user?.id]);

	useEffect(() => {
		function onChannelModify(channel: Channel) {
			if (channelId && channel.id !== +channelId)
				return;
			setChannelInfo((prev) => {
				if (!prev)
					return null;
				return { ...prev, name: channel.name, private: channel.private, hasPassword: channel.hasPassword };
			});
		}
		customOn('chat.modify.channel', onChannelModify);
		return () => {
			customOff('chat.modify.channel', onChannelModify);
		}
	}, [channelId, channelInfo]);

	useEffect(() => {
		if (!channelId || channelId === 'friends')
			setChannelInfo(null);
		else {
			apiClient.get<ChannelInfo>(`/api/chat/channels/${channelId}/info`).then(({ data }) => {
				setChannelInfo(data);
			}).catch((error) => {
				if (error.response.data.statusCode === 400 && error.response.data.message === "Invalid ID")
					navigate('/chat');
			});
		}

	}, [channelId]);

	return (
		<>
			<Container maxWidth="xl" style={{ height: containerHeight }} sx={{minHeight: '100px' }}>
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

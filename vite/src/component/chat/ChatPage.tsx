import { AppBar, Box, Button, Container, Divider, Fab, FilledInput, FormControl, Grid, IconButton, Input, InputAdornment, InputLabel, Modal, Tab, Tabs, TextField, Typography } from '@mui/material';
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
import { useAuthService } from '../../auth/AuthService';
import SettingsIcon from '@mui/icons-material/Settings';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import ShieldOutlinedIcon from '@mui/icons-material/ShieldOutlined';

const ModifyChannelModal: React.FC<{ channelInfo: ChannelInfo | null, open: boolean, handleClose: () => void }> = ({ channelInfo, open, handleClose }) => {
	const [error, setError] = useState<string | null>(null);

	const [memberInvite, setMemberInvite] = useState<string>("");

	function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
		event.preventDefault();

		const channelForm = new FormData(event.currentTarget);

		apiClient.post(`/api/chat/channels/${channelInfo?.id}/info`, {
			name: channelForm.get('name'),
			password: channelForm.get('password') || ''
		}).then(() => {
			handleClose()
		}).catch((err) => {
			setError(err.response.data.message)
		})
	}
	function handleInviteMember() {
		if (memberInvite.length < 3) return;
		apiClient.post(`/api/chat/channels/${channelInfo?.id}/join`, {
			username: memberInvite
		}).then(() => {
			setMemberInvite("")
		}).catch((err) => {
			setError(err.response.data.message)
		})
	}
	return (
		<Modal open={open} onClose={handleClose} style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
			<Container maxWidth="sm" className="centered-container" >
				<Box sx={{
					width: '100%',
					border: '1px solid #D3C6C6',
					boxShadow: '0px 4px 4px rgba(0, 0, 0, 0.25)',
					borderRadius: '16px',
					display: 'flex',
					flexDirection: 'column',
					alignItems: 'center',
					bgcolor: 'background.paper',
					p: '1rem'
				}}>
					<Typography textAlign="center" variant="h6" sx={{ flexGrow: 1, mb: '10px' }} >
						Modify Channel
					</Typography>
					<Divider />
					{error
						&& <Typography textAlign="center" variant="h6" sx={{ flexGrow: 1, mb: '10px' }} >
							{error}
						</Typography>
					}

					<form onSubmit={handleSubmit} style={{ width: '50%', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10 }}>
						<TextField required label="name" type="name" name="name" defaultValue={channelInfo?.name} sx={{ flexGrow: 1, }} />
						{!channelInfo?.private && <TextField label="Password" type="password" name="password" sx={{ flexGrow: 1, }} />}
						<Button variant="outlined" type='submit' sx={{ flexGrow: 1, mt: '10px', width: '100%', height: '30px' }}>
							Modify
						</Button>
					</form>

					{
						channelInfo?.private
						&& <FormControl sx={{ m: 1, width: '25ch' }} variant="standard">
							<InputLabel>Invite members</InputLabel>
							<Input
								type='text'
								value={memberInvite}
								onChange={(e) => setMemberInvite(e.target.value)}
								endAdornment={
									<InputAdornment position="end">
										<IconButton
											onClick={handleInviteMember}
										>
											<PersonAddIcon />
										</IconButton>
									</InputAdornment>
								}
							/>
						</FormControl>

					}
					<Button onClick={handleClose}>Close</Button>
				</Box>
			</Container>
		</Modal>
	);
}
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
								<Typography textAlign={'center'}>
									{!channelInfo.directMessage && channelInfo.private && <ShieldOutlinedIcon sx={{ color: (theme) => theme.palette.grey[500], marginRight: 1 }} />}
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

	useEffect(() => {
		console.log('changing chat', channelId)
		return addSubscription(`/chat/${channelId || ''}`);
	}, [channelId]);

	useEffect(() => {
		function onChannelModify(channel: Channel) {
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
	}, []);

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

import { AppBar, Box, Button, Container, Divider, Fab, Grid, Tab, Tabs, TextField, Typography } from '@mui/material';
import React, { useRef, useState, useEffect, useContext } from 'react';
import apiClient from '../../auth/interceptor.axios';
import { ChannelsListDebug, MyChannelsList } from './ChannelsList';
import { MessageArea } from './MessageArea';
import { SocketContext } from '../../socket/SocketProvider';
import { useParams } from 'react-router-dom';
import { ChannelUsers } from './ChannelUsers';
import SendIcon from '@mui/icons-material/Send';
import { Channel } from '../../types'


type chatTabsValue = 'Channels' | 'My channels';
interface chatTabsProps {
	value: chatTabsValue;
	setValue: React.Dispatch<React.SetStateAction<chatTabsValue>>;
}

function ChatTabs({ value, setValue }: chatTabsProps) {

	const handleChange = (event: React.SyntheticEvent, newValue: chatTabsValue) => {
		setValue(newValue);
	};
	return (
		<Box sx={{ borderBottom: 1, borderColor: 'divider' }} display="flex" flexDirection={'column'} alignItems={'center'} justifyContent={'center'}>
			<Tabs value={value} onChange={handleChange} aria-label="icon label tabs example">
				<Tab value={'Channels'} label="Channels" />
				<Tab value={'My channels'} label="My channels" />
				<Tab value={'Direct Messages'} label="Direct Messages" />
			</Tabs>
		</Box>
	);
}


export function ChatPage() {

	const [channels, setChannels] = useState<Channel[]>([]);
	const [messageToSend, setMessageToSend] = useState<string>("");
	const [tabs, setTabs] = useState<'Channels' | 'My channels' >('Channels');
	const { addSubscription, customOn, customOff } = useContext(SocketContext);
	const { channelId } = useParams();


	const handleOnChange = (event: React.ChangeEvent<HTMLInputElement>) => {
		setMessageToSend(event.target.value);
	};

	useEffect(() => {
		console.log('changing chat', channelId)
		return addSubscription(`/chat/${channelId || ''}`);
	}, [channelId]);

	useEffect(() => {
		updateChannel()
	}, []);

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

	const updateChannel = () => {
		console.log("updateChannel");
		apiClient.get(`/api/chat/channels/all`).then(({ data }: { data: Channel[] }) => {
			console.log("channels/all", data);
			setChannels(data);
		}).catch((error) => {
			console.log(error);
		});
	}

	const createChannel = () => {
		console.log("createChannel");
		const channelParams = {
			name: "test",
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

	const sendMessage = () => {
		console.log("messageToSend", messageToSend);
		apiClient.post(`/api/chat/channels/${channels[0].id}/messages`, { content: messageToSend }).then((response) => {
			console.log(`send message to ${channels[0].id}`, response);
			setMessageToSend("");
		}).catch((error) => {
			console.log(error);
		});
	};

	const myChannels = () => {
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
				<Grid container spacing={3}>
					<Grid item xs={2}>
						<MyChannelsList channels={channels} />
					</Grid>
					<Grid item xs={8}>
						{channelId ? <MessageArea channelId={channelId} /> : null}
					</Grid>
					<Grid item xs={2}>
						{channelId ? <ChannelUsers channelId={channelId} /> : null}
					</Grid>
				</Grid>
				<Divider />
				<Grid container spacing={3} sx={{ mt: "20px" }}>
					<Grid item xs={2}>
					</Grid>
					<Grid item xs={8}>
						<TextField id="outlined-basic-email" label="Type Something" value={messageToSend} onChange={handleOnChange} fullWidth
							onKeyDown={(ev) => {
								if (ev.key === 'Enter') {
									ev.preventDefault();
									sendMessage();
								}
							}}
						/>
					</Grid>
					<Grid item xs={2}>
						<Button variant="contained" onClick={sendMessage} endIcon={<SendIcon />}>Send</Button>
					</Grid>

				</Grid>
			</>
		)
	}

	return (
		<>
		
			<Container maxWidth="lg">
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
				}}>
						
					
					<ChatTabs value={tabs} setValue={setTabs} />

					{tabs === 'Channels' ? <ChannelsListDebug channels={channels} /> : null}

					{tabs === 'My channels' ? myChannels() : null}
					<Grid container spacing={3} sx={{ mt: "20px" }}>
						<Grid item xs={4}>
							<Button variant="contained" color="primary" onClick={createChannel}> Create Channel </Button>
						</Grid>
						<Grid item xs={4}>
							<Button variant="contained" color="primary" onClick={updateChannel}>Update Channel </Button>
						</Grid>
					</Grid>
				</Box>
			</Container >
		</>
	);
}

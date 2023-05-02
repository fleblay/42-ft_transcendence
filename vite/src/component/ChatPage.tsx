import { AppBar, Box, Button, Container, Divider, Fab, Grid, TextField, Typography } from '@mui/material';
import React, { useRef, useState, useEffect, useContext } from 'react';
import apiClient from '../auth/interceptor.axios';
import { ChannelsList, ChannelsListDebug } from './ChannelsList';
import { MessageArea } from './MessageArea';
import { SocketContext } from '../socket/SocketProvider';
import { useParams } from 'react-router-dom';


export function ChatPage() {

    const [channels, setChannels] = useState<any[]>([]);
    const [messageToSend, setMessageToSend] = useState<string>("");


    const handleOnChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setMessageToSend(event.target.value);
    };


	const { setSubscription, setUnsubscribe } = useContext(SocketContext);

	const { channelId } = useParams();

	React.useEffect(() => {
		const room = `/chat/${channelId}`;
		setSubscription(room);
		return () => {
			setUnsubscribe(room);
			console.log("cleaned up");
		};
	}, []);

    useEffect(() => {
        apiClient.get(`/api/chat/channels`).then((response) => {
            console.log("response", response);
            setChannels(response.data);
        }).catch((error) => {
            console.log(error);
        });
    }, []);

    const updateChannel = () => {
        console.log("updateChannel");
        apiClient.get(`/api/chat/channels`).then((response) => {
            console.log("response", response);
            setChannels(response.data);
        }).catch((error) => {
            console.log(error);
        });
    }


    const createChannel = () => {
        console.log("createChannel");
        const channelParams = {
            name: "test",
            type: "private",
            password: "test"
        }
        apiClient.post(`/api/chat/channels`, channelParams).then((response) => {
            console.log("response", response);
        }).catch((error) => {
            console.log(error);
        }
        );
    }

    const sendMessage = () => {
        console.log("sendMessage");
        console.log("messageToSend", messageToSend);
        apiClient.post(`/api/chat/channels/${channels[0].id}/messages`, { content: messageToSend }).then((response) => {
            console.log("response", response);
        }
        ).catch((error) => {
            console.log(error);
        }
        );
    };

    const joinChannel = () => {
        console.log("joinChannel");
    };


    return (
        <>
            <Container maxWidth="lg">
                <Box sx={{
                    width: '100%',
                    border: '1px solid #D3C6C6',
                    boxShadow: '0px 4px 4px rgba(0, 0, 0, 0.25)',
                    borderRadius: '16px',
                    p: '2rem',
                    bgcolor: 'background.paper',
                }}>
                    <AppBar position="static" sx={{ borderTopLeftRadius: '16px', borderTopRightRadius: '16px', height: '80px' }}>
                        <Typography textAlign="center" variant="h6" sx={{ flexGrow: 1, paddingTop: '25px' }}>
                            Chat
                        </Typography>
                    </AppBar>
                    <Grid container spacing={3}>
                        <Grid item xs={2}>
                            <Typography textAlign={'center'}> Channels</Typography>
                        </Grid>
                        <Grid item xs={8}>
                            <Typography textAlign={'center'}> Channels Name</Typography>
                        </Grid>
                        <Grid item xs={2}>
                            <Typography textAlign={'center'}> User</Typography>
                        </Grid>
                    </Grid>
                    <Divider />
                    <Grid container spacing={3}>
                        <Grid item xs={2}>
                            <ChannelsList channels={channels} />
                        </Grid>
                        <Grid item xs={8}>
                            <MessageArea />
                        </Grid>
                        <Grid item xs={2}>
                            <Typography textAlign={'center'}> List User</Typography>
                        </Grid>
                    </Grid>
                    <Divider />
                    <Grid container spacing={3}>
                        <Grid item xs={2}>
                            <Button variant="contained" color="primary" onClick={createChannel}> Create Channel </Button>
                        </Grid>
                        <Grid item xs={8}>
                        <TextField id="outlined-basic-email" label="Type Something" onChange={handleOnChange} fullWidth />
                        </Grid>
                        <Grid item xs={2}>
                            <Button variant="contained" color="primary" onClick={sendMessage}> send </Button>
                        </Grid>
                    </Grid>
                    <Button variant="contained" color="primary" onClick={updateChannel}>Update Channel </Button>
                    <ChannelsListDebug channels={channels} />
                </Box>
            </Container >
        </>
    );
}

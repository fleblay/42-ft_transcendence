import { AppBar, Box, Button, Container, Divider, Grid, Typography } from '@mui/material';
import React, { useRef, useState, useEffect, useContext } from 'react';
import apiClient from '../auth/interceptor.axios';
import { ChannelsList } from './ChannelsList';
import { SocketContext } from '../socket/SocketProvider';
import { useParams } from 'react-router-dom';


export function ChatPage() {

    const [channels, setChannels] = useState<any[]>([]);

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
                        <Grid item xs="auto">
                            <Typography> Channels</Typography>
                        </Grid>
                        <Grid item xs={6}>
                        <Typography> Channels Name</Typography>
                        </Grid>
                        <Grid item xs>
                        <Typography> User</Typography>
                        </Grid>
                    </Grid>
                    <Divider />

                    <Button variant="contained" color="primary" onClick={createChannel}> Create Channel </Button>
                    <Button variant="contained" color="primary" onClick={updateChannel}>Update Channel </Button>
                    <ChannelsList channels={channels} />
                </Box>
            </Container >
        </>
    );
}

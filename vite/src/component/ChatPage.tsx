import { AppBar, Box, Button, Container, Divider, Fab, Grid, Tab, Tabs, TextField, Typography } from '@mui/material';
import React, { useRef, useState, useEffect, useContext } from 'react';
import apiClient from '../auth/interceptor.axios';
import { ChannelsListDebug, MyChannelsList } from './ChannelsList';
import { MessageArea } from './MessageArea';
import { SocketContext } from '../socket/SocketProvider';
import { useParams } from 'react-router-dom';
import { ChannelUsers } from './ChannelUsers';
import SendIcon from '@mui/icons-material/Send';



type chatTabsValue = 'Channels' | 'My channels' | 'Direct Messages';
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

                {/* <Tab icon={<PeopleIcon />} label="Friends" /> */}
                {/* <Tab icon={<GroupAddIcon />} label="Incomings" /> */}
                {/* <Tab icon={<GroupRemoveIcon />} label="Outgoings" /> */}
            </Tabs>
        </Box>
    );
}



export function ChatPage() {

    const [channels, setChannels] = useState<any[]>([]);
    const [messageToSend, setMessageToSend] = useState<string>("");
    const [tabs, setTabs] = useState<'Channels' | 'My channels' | 'Direct Messages'>('Channels');




    const handleOnChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setMessageToSend(event.target.value);
    };


    const { setSubscription, setUnsubscribe } = useContext(SocketContext);

    const { channelId } = useParams();

    React.useEffect(() => {
        if (!channelId) return;
        const room = `/chat/${channelId}`;
        setSubscription(room);
        return () => {
            setUnsubscribe(room);
            console.log("cleaned up");
        };
    }, []);

    useEffect(() => {
        apiClient.get(`/api/chat/channels/all`).then((response) => {
            console.log("response all channels", response);
            setChannels(response.data);
        }).catch((error) => {
            console.log(error);
        });
    }, []);

    const updateChannel = () => {
        console.log("updateChannel");
        apiClient.get(`/api/chat/channels/all`).then((response) => {
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
            private: false,
            password: "test"
        }
        apiClient.post(`/api/chat/channels/create`, channelParams).then((response) => {
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

    const myChannels = () => {
        return (
            <>
                <Grid container spacing={3}>
                    <Grid item xs={3}>
                        <Typography textAlign={'center'}> Channels</Typography>
                    </Grid>
                    <Grid item xs={7}>
                        <Typography textAlign={'center'}> {channelId} </Typography>
                    </Grid>
                    <Grid item xs={3}>
                        <Typography textAlign={'center'}>Member</Typography>
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
                <Grid container spacing={3} sx={{mt: "20px"}}>
                    <Grid item xs={2}>
                    </Grid>
                    <Grid item xs={8}>
                        <TextField id="outlined-basic-email" label="Type Something" onChange={handleOnChange} fullWidth />
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

import { Grid, List, ListItem, ListItemText, makeStyles } from "@mui/material";
import { Message } from "../types";
import { useContext, useEffect, useState } from "react";
import apiClient from "../auth/interceptor.axios";
import { SocketContext } from "../socket/SocketProvider";

interface MessageAreaProps {
    channelId: string;
}

export function MessageArea({ channelId }: MessageAreaProps) {

    const [messages, setMessages] = useState<Message[] | null>(null);

	const { customOn, customOff, setSubscription, setUnsubscribe } = useContext(SocketContext);

    useEffect(() => {
        apiClient.get(`/api/chat/channels/${channelId}/messages`).then(({data} : {data: Message[]}) => {
            console.log(`channels/${channelId}/messages`, data);
            setMessages(data);
        }).catch((error) => {
            console.log(error);
        });
    }, []);

	useEffect(() => {
		function onNewMessage(message: Message) {
			console.log("onNewMessage", message);
			setMessages((messages) => {
				if (messages === null) return [message];
				return [...messages, message];
			});
		}
		setSubscription(`/chat/${channelId}`);
		customOn("chat.message.new", onNewMessage);
		return () => {
			setUnsubscribe(`/chat/${channelId}`);
			customOff("chat.message.new", onNewMessage);
		};
	}, []);


    return (
        <List>
            { messages && messages.map((message: Message) => {
                return (
                    <ListItem key={message.id}>
                        <Grid container>
                            <Grid item xs={12}>
                                <ListItemText primary={message.date}></ListItemText>
                            </Grid>
                            <Grid item xs={12}>
                                <ListItemText secondary={message.content}></ListItemText>
                            </Grid>
                        </Grid>
                    </ListItem>
                )
            })}
        </List>

    );
}

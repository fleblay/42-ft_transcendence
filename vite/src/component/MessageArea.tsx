import { Grid, List, ListItem, ListItemText, makeStyles } from "@mui/material";
import { Message } from "../types";
import { useEffect, useState } from "react";
import apiClient from "../auth/interceptor.axios";

interface MessageAreaProps {
    channelId: string;
}


export function MessageArea({ channelId }: MessageAreaProps) {

    const [messages, setMessages] = useState<Message[] | null>(null);;

    useEffect(() => {
        apiClient.get(`/api/chat/channels/${channelId}/messages`).then((response) => {
            console.log("response", response);
            //setMessages(response.data);
        }).catch((error) => {
            console.log(error);
        });
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

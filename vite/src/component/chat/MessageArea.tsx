import { Box, Button, Grid, List, ListItem, ListItemText, TextField, makeStyles } from "@mui/material";
import { Message } from "../../types";
import { useContext, useEffect, useState } from "react";
import apiClient from "../../auth/interceptor.axios";
import { SocketContext } from "../../socket/SocketProvider";
import { ChatMsg } from "./ChatMessage";
import { useAuthService } from "../../auth/AuthService";
import SendIcon from '@mui/icons-material/Send';

interface MessageAreaProps {
	channelId: string;
}

export function MessageArea({ channelId }: MessageAreaProps) {
	const { user } = useAuthService()

	const [messages, setMessages] = useState<Message[]>([]);
	const [messageToSend, setMessageToSend] = useState<string>("");

	const { customOn, customOff, addSubscription } = useContext(SocketContext);

	useEffect(() => {
		apiClient.get(`/api/chat/channels/${channelId}/messages`).then(({ data }: { data: Message[] }) => {
			console.log(`channels/${channelId}/messages`, data);
			setMessages(data);
		}).catch((error) => {
			console.log(error);
		});
	}, [channelId]);

	useEffect(() => {
		return addSubscription(`/chat/${channelId}`);
	}, [channelId]);

	useEffect(() => {
		function onNewMessage(message: Message) {
			console.log("onNewMessage", message);
			setMessages((messages) => {
				return [...messages, message];
			});
		}

		customOn("chat.message.new", onNewMessage);
		return () => {
			customOff("chat.message.new", onNewMessage);
		};
	}, [messages])

	const handleOnChange = (event: React.ChangeEvent<HTMLInputElement>) => {
		setMessageToSend(event.target.value);
	};

	const sendMessage = () => {
		console.log("messageToSend", messageToSend);
		apiClient.post(`/api/chat/channels/${channelId}/messages`, { content: messageToSend }).then((response) => {
			console.log(`send message to ${channelId}`, response);
			setMessageToSend("");
		}).catch((error) => {
			console.log(error);
		});
	};

	return (
		<>
			<List>
				{
					messages.reduce((acc: Message[][], message: Message) => {
						if (acc.length === 0) {
							return [[message]];
						}
						const lastMessage = acc[acc.length - 1][0];
						if (lastMessage.owner.user.id === message.owner.user.id) {
							acc[acc.length - 1].push(message);
						} else {
							acc.push([message]);
						}
						return acc;
					}, []).map((messages: Message[], i: number) => {
						return (
							<ChatMsg
								key={i}
								side={messages[0].owner.user.id === user?.id ? 'right' : 'left'}
								avatar={`/avatars/${messages[0].owner.user.id}.png`}
								messages={messages.map((message) => message.content)}
								username={messages[0].owner.user.username}
							/>
						);
					})
				}
			</List>
			<Box
				sx={{
					width: '100%',
					display: 'flex',
					alignItems: 'center',
					'& > :not(style)': { m: 1 },
				}}
			>
					<TextField id="outlined-basic-email" label="Type Something" value={messageToSend} onChange={handleOnChange}
						onKeyDown={(ev) => {
							if (ev.key === 'Enter') {
								ev.preventDefault();
								sendMessage();
							}
						}}
					/>
					<Button variant="contained" onClick={sendMessage} endIcon={<SendIcon />}>Send</Button>
			</Box>
		</>

	)
}

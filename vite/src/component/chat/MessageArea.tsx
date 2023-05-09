import { Box, Button, Divider, List, TextField } from "@mui/material";
import { Message } from "../../types";
import { useContext, useEffect, useRef, useState } from "react";
import apiClient from "../../auth/interceptor.axios";
import { SocketContext } from "../../socket/SocketProvider";
import { ChatMsg } from "./ChatMessage";
import { useAuthService } from "../../auth/AuthService";
import SendIcon from '@mui/icons-material/Send';
import SportsTennisIcon from '@mui/icons-material/SportsTennis';
import { useNavigate } from "react-router-dom";

interface MessageAreaProps {
	channelId: string;
}

export function MessageArea({ channelId }: MessageAreaProps) {
	const { user } = useAuthService()
	const { customEmit, customOn, customOff, addSubscription } = useContext(SocketContext);

	const navigate = useNavigate();

	const [messages, setMessages] = useState<Message[]>([]);
	const [messageToSend, setMessageToSend] = useState<string>("");

	const messageAreaRef = useRef<HTMLUListElement>(null);

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
		if (messageAreaRef.current) {
			const element = messageAreaRef.current;
			if (Math.abs(element.scrollHeight - element.scrollTop - element.clientHeight) <= 250 || element.scrollTop === 0)
				element.scrollTo({ top: element.scrollHeight, behavior: element.scrollTop === 0 ? 'auto' : 'smooth' });
		}
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
	}, [messages, messageAreaRef.current])

	const handleOnChange = (event: React.ChangeEvent<HTMLInputElement>) => {
		setMessageToSend(event.target.value);
	};

	const sendMessage = () => {
		if (messageToSend.trim().length === 0) return;
		apiClient.post(`/api/chat/channels/${channelId}/messages`, { content: messageToSend }).then((response) => {
			setMessageToSend("");
		}).catch((error) => {
			console.log(error);
		});
	};

	const sendGameMessage = async () => {
		let message = "Let's play a game of pong!"
		if (messageToSend.trim().length !== 0)
			message = messageToSend;

		customEmit('game.create', {}, (gameId: string) => {
			apiClient.post(`/api/chat/channels/${channelId}/messages`, { content: message, gameId }).then((response) => {
				setMessageToSend("");
			}).catch((error) => {
				console.log(error);
			});
			navigate(`/game/${gameId}`);
		});
	}

	return (
		<>
			<List sx={{ height: '50vh', overflow: 'auto' }} ref={messageAreaRef}>
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
								messages={messages}
								username={messages[0].owner.user.username}
							/>
						);
					})
				}
			</List>
			<Divider />
			<Box
				sx={{
					width: '100%',
					display: 'flex',
					alignItems: 'center',
					'& > :not(style)': { m: 1 },
				}}
			>
				<TextField id="outlined-basic-email" label="Type Something" value={messageToSend} onChange={handleOnChange} fullWidth
					onKeyDown={(ev) => {
						if (ev.key === 'Enter') {
							ev.preventDefault();
							sendMessage();
						}
					}}
				/>
				<Button variant="contained" onClick={sendGameMessage}><SportsTennisIcon /></Button>
				<Button variant="contained" onClick={sendMessage}><SendIcon /></Button>
			</Box>
		</>
	)
}

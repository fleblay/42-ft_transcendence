import { Box, Button, Divider, List, TextField } from "@mui/material";
import { Message } from "../../types";
import { useCallback, useContext, useEffect, useRef, useState } from "react";
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

	const [offset, setOffset] = useState(0);

	const navigate = useNavigate();

	const [messages, setMessages] = useState<Message[]>([]);
	const [messageToSend, setMessageToSend] = useState<string>("");

	const messageAreaRef = useRef<HTMLUListElement>(null);

	const requestMessages = useCallback((overwriteOffset?: number) => {
		apiClient.get<Message[]>(`/api/chat/channels/${channelId}/messages?offset=${overwriteOffset || offset}`).then(({ data }) => {
			setMessages((messages) => {
				return [...data, ...messages].sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
			});
			if (data && data.length > 0)
				setOffset((offset) => overwriteOffset || offset + 10);
		}).catch((error) => {
			console.log(error);
		});
	}, [channelId, offset]);

	useEffect(() => {
		setOffset(0);
		setMessages([]);
		requestMessages(0);
		if (messageAreaRef.current) {
			messageAreaRef.current.scrollTo({ top: messageAreaRef.current.scrollHeight, behavior: 'auto' });
		}
		return addSubscription(`/chat/${channelId}`);
	}, [channelId]);

	useEffect(() => {
		if (messageAreaRef.current) {
			const element = messageAreaRef.current;
			if (Math.abs(element.scrollHeight - element.scrollTop - element.clientHeight) <= 250)
				element.scrollTo({ top: element.scrollHeight, behavior: 'smooth' });
		}
		function onNewMessage(message: Message) {
			apiClient.post(`/api/chat/channels/${channelId}/ack`)
			setMessages((messages) => {
				return [...messages, message];
			});
		}

		customOn("chat.message.new", onNewMessage);
		return () => {
			customOff("chat.message.new", onNewMessage);
		};
	}, [channelId, messages, messageAreaRef.current])

	const handleOnChange = (event: React.ChangeEvent<HTMLInputElement>) => {
		setMessageToSend(event.target.value);
	};

	const checkMessageForGameURL = (message: string): { url?: string, pathname?: string } => {
		const originRegex = new RegExp(`^${window.location.origin}`);
		const urls = message.match(/\bhttps?:\/\/\S+/gi);

		if (urls) {
			for (let i = 0; i < urls.length; i++) {
				const url = urls[i];

				if (originRegex.test(url)) {
					const urlObject = new URL(url);
					const pathname = urlObject.pathname;
					const uuidRegex = /^\/game\/([0-9a-fA-F]{8}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{12})$/;
					if (uuidRegex.test(pathname))
						return { url, pathname };
				}
			}
		}
		return {};
	};

	const sendMessage = () => {
		if (messageToSend.trim().length === 0) return;
		const gameURL = checkMessageForGameURL(messageToSend);

		const { url, pathname } = gameURL
		const gameId = pathname?.split('/')[2];
		const message = {
			content: messageToSend.replace(url || '', ''),
			gameId,
		}

		apiClient.post(`/api/chat/channels/${channelId}/messages`, message).then((response) => {
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


	function onScroll(event: React.UIEvent<HTMLUListElement, UIEvent>) {
		const element = event.currentTarget;
		if (element.scrollTop === 0) {
			requestMessages();
			element.scrollTo({ top: 1, behavior: 'auto' });
		}
	}

	return (
		<>
			<List sx={{ height: '50vh', overflow: 'auto' }} ref={messageAreaRef} onScroll={onScroll}>
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
						if (messages.length === 0) return null;
						return (
							<ChatMsg
								key={i}
								side={messages[0].owner.user.id === user?.id ? 'right' : 'left'}
								avatar={`/avatars/${messages[0].owner.user.id}.png`}
								messages={messages}
								username={messages[0].owner.user.username}
								blocked={user?.blockedId.includes(messages[0].owner.user.id)}
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

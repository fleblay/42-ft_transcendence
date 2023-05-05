import React, { createContext, useContext, useState } from 'react'
import { LoginData, LoginForm } from './component/LoginForm'
import { Link, Navigate, Outlet, Route, Routes, useLocation, useNavigate } from 'react-router-dom'
import axios from "axios";
import { RegisterForm } from './component/RegisterForm'
import { OldCreateGame } from './component/OldCreateGame'
import { ListUsers } from './component/ListUsers'
import { FakeGames } from './component/FakeGame'
import { AuthService, useAuthService } from './auth/AuthService'
import { SocketContext, SocketProvider } from './socket/SocketProvider'
import { MenuBar } from './component/Menu'
import { ProfilPlayer } from './component/ProfilPlayer'
import { AllRefreshToken } from './component/TokenView'
import { UsernameDialog } from './component/UsernameDialog'
import { FriendList } from './component/FriendList'
import { BlockedList } from './component/BlockedList';
import { UserDataProvider } from './userDataProvider/userDataProvider';
import { DfaForm } from './component/DfaForm';
import { GamePage } from './component/GamePage';
import { OldGamePage } from './component/OldGameScreen';
import { ChatPage } from './component/chat/ChatPage';
import ChatMenu from './component/chat/ChatMenu';
import { CircularProgress, Paper, Stack } from '@mui/material';

export interface Destinations {
	name: string,
	path: string,
	public: boolean
}

export const allRoutes: Destinations[] = [
	{ name: "Register", path: "/register", public: true },
	{ name: "Login", path: "/login", public: true },
	{ name: "Chat", path: "/chat", public: false },
	{ name: "Game", path: "/game", public: false },
	{ name: "Leaderboard", path: "/leaderboard", public: false },
	{ name: "AllRefreshToken", path: "/AllRefreshToken", public: true },
	{ name: "Friends", path: "/friends", public: false },
	{ name: "Blocked", path: "/blocked", public: false },
]

function RequireAuth({ children }: { children: JSX.Element }) {
	let auth = useAuthService();
	let location = useLocation();
	const { socket } = useContext(SocketContext)

	if (!auth.user) {
		// Redirect them to the /login page, but save the current location they were
		// trying to go to when they were redirected. This allows us to send them
		// along to that page after they login, which is a nicer user experience
		// than dropping them off on the home page.
		return <>
			<Link to="/login">Login Page</Link>;
			<Link to="/register">Register Page</Link>;
		</>
	}
	if (!auth.user.username) {
		return (
			<UsernameDialog />
		)
	}
	if (!socket || !socket.connected) {
		return (
			<Stack direction="column" justifyContent="center" alignItems={'center'} width={'100%'} height={'100vh'}>
				<CircularProgress />
			</Stack>
		)
	}
	return children;
}

function BackLoader() {
	return (
		<Stack direction="column" justifyContent="center" alignItems={'center'} width={'100%'} height={'100vh'}>
			<h1>We got a problem with the server, please wait</h1>
			<CircularProgress />
		</Stack>
	)
}

function App() {

	const [backIsReady, setBackIsReady] = useState(false)
	const [cooldown, setCooldown] = React.useState<number>(10);

	React.useEffect(() => {
		const intevalId = setInterval(() => {
			axios.get("/api/areyouready").then((response) => {
				if (response.status === 200) {
					setBackIsReady(true);
					clearInterval(intevalId);
				}
			}).catch((error) => {
				console.log(error);
			})
			if (cooldown < 1000)
				setCooldown(cooldown => cooldown *= 10);
		}, cooldown)
		return () => clearInterval(intevalId);
	}, [cooldown])
	if (!backIsReady) return <BackLoader />

	return (
		<AuthService>
			<SocketProvider>
				<RequireAuth>
					<MenuBar />
				</RequireAuth>

				<Routes>
					<Route>
						<Route path="/" element={<Navigate to='/game' replace />} />
						<Route path="game/">
							<Route path=":idGame" element={
								<RequireAuth>
									<GamePage />
								</RequireAuth>
							} />
							<Route path="" element={
								<RequireAuth>
									<GamePage />
								</RequireAuth>
							} />
						</Route>

						<Route path='/public' element={<div>Public</div>} />
						<Route path="chat/:channelId?" element={
							<RequireAuth>
								<>
									<ChatMenu />
									<ChatPage />
								</>
							</RequireAuth>
						} />
						<Route path="/Login" element={<LoginForm />} />
						<Route path="/Register" element={<RegisterForm />} />
						<Route path="/leaderboard" element={
							<>
								<ListUsers />
								<br />
								<FakeGames />
							</>
						} />
						<Route path="/AllRefreshToken" element={<AllRefreshToken />} />
						<Route path="/player/">
							<Route path=":idPlayer" element={
								<RequireAuth>
									<UserDataProvider>
										<ProfilPlayer />
									</UserDataProvider>
								</RequireAuth>
							} />
						</Route>
						<Route path="/friends" element={
							<RequireAuth>
								<FriendList />
							</RequireAuth>
						} />
						<Route path="/blocked" element={
							<RequireAuth>
								<BlockedList />
							</RequireAuth>
						} />
						<Route path="/dfa" element={<DfaForm />} />
						<Route path='*' element={<div>404</div>} />
					</Route>
				</Routes>
			</SocketProvider>
		</AuthService>
	);
}

export default App

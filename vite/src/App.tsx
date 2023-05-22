import React, { createContext, useContext, useState } from 'react'
import { LoginData, LoginForm } from './component/LoginForm'
import { Link, Navigate, Outlet, Route, Routes, useLocation, useNavigate } from 'react-router-dom'
import { RegisterForm } from './component/RegisterForm'
import { Leaderboard } from './component/Leaderboard'
import { FakeGames } from './component/game/FakeGame'
import { AuthService, useAuthService } from './auth/AuthService'
import { SocketContext, SocketProvider } from './socket/SocketProvider'
import { MenuBar } from './component/Menu'
import { ProfilPlayer } from './component/ProfilPlayer'
import { UsernameDialog } from './component/UsernameDialog'
import { FriendList } from './component/FriendList'
import { BlockedList } from './component/BlockedList';
import { UserDataProvider } from './userDataProvider/userDataProvider';
import { DfaForm } from './component/DfaForm';
import { GamePage } from './component/game/GamePage';
import { ChatPage } from './component/chat/ChatPage';
import { CircularProgress, Paper, Stack } from '@mui/material';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs'
import { MyError } from './component/Error';
import { InterceptorAxios } from './auth/interceptor.axios';
import { NotificationsList } from './component/notifications/notificationsList';
import { NotFound } from './component/404';

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
	{ name: "Friends", path: "/friends", public: false },
	{ name: "notification", path: "/notification", public: false },
	{ name: "dfa", path: "/dfa", public: true },
]

function RequireAuth({ children }: { children: JSX.Element }) {
	let auth = useAuthService();
	const location = useLocation();
	const { socket } = useContext(SocketContext)

	if (!auth.user) {
		// Redirect them to the /login page, but save the current location they were
		// trying to go to when they were redirected. This allows us to send them
		// along to that page after they login, which is a nicer user experience
		// than dropping them off on the home page.
		return <></>
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

const Layout = ({ children }: { children: JSX.Element }) => {
	return (
		<>
			{children}
			<MyError />
		</>
	)
};


function App() {
	return (
		<LocalizationProvider dateAdapter={AdapterDayjs}>
			<AuthService>
				<InterceptorAxios>
					<Layout>

						<SocketProvider>
							<RequireAuth>
								<MenuBar />
							</RequireAuth>

							<Routes>
								<Route>
									<Route path="/login" element={<LoginForm />} />
									<Route path="/register" element={<RegisterForm />} />
									<Route path="/dfa" element={<DfaForm />} />
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

									<Route path="chat/:channelId?" element={
										<RequireAuth>
											<ChatPage />
										</RequireAuth>
									} />
									<Route path="/leaderboard" element={
										<RequireAuth>
											<>
												<Leaderboard />
												<br />
												<FakeGames />
											</>
										</RequireAuth>
									} />
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
									<Route path="/notification" element={
										<RequireAuth>
											<NotificationsList />
										</RequireAuth>
									} />
									<Route path='*' element={<NotFound />} />
								</Route>
							</Routes>
						</SocketProvider>
					</Layout>
				</InterceptorAxios>
			</AuthService>

		</LocalizationProvider>
	);
}

export default App

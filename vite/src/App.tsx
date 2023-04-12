import React, { createContext, useState } from 'react'
import { Socket, io } from 'socket.io-client'
import { delAccessToken, getAccessToken, saveToken } from './token/token'
import { LoginData, LoginForm } from './component/LoginForm'
import { Link, Navigate, Outlet, Route, Routes, useLocation, useNavigate } from 'react-router-dom'
import { AuthProvider } from './auth'
import axios from "axios";
import { RegisterForm } from './component/RegisterForm'
import { CreateGame } from './component/CreateGame'
import { ListUsers } from './component/ListUsers'
import { AuthService, useAuthService } from './auth/AuthService'
import { GamePage } from './component/GameScreen'
import apiClient from './auth/interceptor.axios'
import { ResponsiveAppBar } from './component/ResponsiveAppBar'
import { SocketProvider } from './socket/SocketProvider'

export interface Destinations {
	name: string,
	path: string,
	public: boolean
}

export const allRoutes: Destinations[] = [
	{ name: "Register", path: "/register", public: true },
	{ name: "Login", path: "/login", public: true },
	{ name: "Public", path: "/public", public: true },
	{ name: "About", path: "/about", public: true },
	{ name: "Chat", path: "/chat", public: false },
	{ name: "Game", path: "/game", public: false },
	{ name: "ListAll", path: "/list", public: true },
	{ name: "Leaderboard", path: "/top", public: false },
	{ name: "UserDataBase", path: "/allusers", public: false },
	{ name: "testMenu", path: "/testMenu", public: false },
]

export interface IUser {
	username: string,
	email: string,
	id: number
}


function AuthStatus() {
	let auth = useAuthService();
	let navigate = useNavigate();

	if (!auth.user) {
		return <p>You are not logged in.</p>;
	}

	return (
		<p>
			Welcome {auth.user.username}!{" "}
			<button
				onClick={() => {
					auth.logout(() => navigate("/"));
				}}
			>
				Sign out
			</button>
		</p>
	);
}


function RequireAuth({ children }: { children: JSX.Element }) {
	let auth = useAuthService();
	let location = useLocation();

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

	return children;
}

function Header() {
	return (
		<div>
			<AuthStatus />

			<ul>
				<li>
					<Link to="/">Game Page</Link>
				</li>
				<li>
					<Link to="/chat">Chat Page</Link>
				</li>
			</ul>

			<Outlet />
		</div>
	);
}

function Destinations() {
	const auth = useAuthService()
	const links = allRoutes.map((destination) => {
		if (!auth.user && !destination.public) return (<></>)
		return (
			<>
				<span> </span>
				<span><Link to={destination.path}>{destination.name}</Link></span>
				<span> </span>
			</>)
	})
	return (
		<div>
			{...links}
		</div>
	)
}

//export const AppContext = createContext<any>({});

function ListGames() {
	const [list, setList] = React.useState("empty")

	return (
		<>
			<button onClick={() => { apiClient.get("/api/game/current").then((response) => { console.log(response.data); setList(response.data.toString()) }) }}>GetList</button>
			<div> {list} </div>
		</>
	)
}

function App() {

	return (
		<AuthService>
			<SocketProvider>
				<Routes>
					<Route element={<div> <Destinations /> <Header /> </div>}>
						<Route path="/" element={<Navigate to='/game' replace />} />
						<Route path="game/">
							<Route path=":idGame" element={
								<RequireAuth>
									<GamePage />
								</RequireAuth>
							} />
							<Route path="" element={
								<RequireAuth>
									<CreateGame />
								</RequireAuth>
							} />
						</Route>
						<Route path='/public' element={<div>Public</div>} />
						<Route
							path="/chat"
							element={
								<RequireAuth>
									<>
										<label>w</label>
										<LoginForm />
									</>
								</RequireAuth>
							}
						/>
						<Route path="/login" element={<LoginForm />} />
						<Route path="/register" element={<RegisterForm />} />
						<Route path="/list" element={<ListGames />} />
						<Route path="/allusers" element={<ListUsers />} />
						<Route path="/testMenu" element={<ResponsiveAppBar />} />

					</Route>
				</Routes>
			</SocketProvider>
		</AuthService>
	);
}

export default App

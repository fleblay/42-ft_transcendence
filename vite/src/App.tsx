import { MyForm } from './pages/NameSelector'
import { GetAll } from './pages/getall'
import { GameCanvas } from './game/game'
import React, { createContext, useState } from 'react'
import { Socket, io } from 'socket.io-client'
import { delToken, getToken, saveToken } from './token/token'
import { LoginData, LoginForm } from './pages/LoginPage'
import { Link, Navigate, Outlet, Route, Routes, useLocation, useNavigate } from 'react-router-dom'
import { AuthProvider } from './auth'
import axios from "axios";
import { RegisterForm } from './pages/RegisterPage'
import { CreateGame } from './component/CreateGame'
import { AuthService, useAuthService } from './auth/AuthService'

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
]

export interface IUser {
	username: string,
	email: string,
}

export interface SocketContextType {
	socket: Socket
}

export let SocketContext = React.createContext<SocketContextType>(null!)
// Appeler par AuthService quand auth.user change de valeur.
// Creer le socket quand auth.user est defini (On est connecter)
function SocketProvider({ children }: { children: React.ReactNode }) {
	const auth = useAuthService()

	React.useEffect(() => {
		if (!auth.user) return
		function onConnect() {
			console.log('Connected to socket')
			socket.emit('ping', { message: "This is my first ping" }, (response: any) => {
				console.log(response)
			})
		}

		function onMessage(data: any) {
			console.log('Receiving a message')
			console.log(data)
		}

		socket.on('connect', onConnect);
		socket.on('message', onMessage)
		return () => {
			socket.off('connect', onConnect);
			socket.off('message', onMessage);
		}
	}, [auth.user])
	if (!auth.user) return <>{children}</>;

	const socket = io({
		auth: {
			token: getToken()
		}
	})

	const value = { socket }
	console.log("Socket Creation")
	return <SocketContext.Provider value={value}>{children}</SocketContext.Provider>
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

/*
function LoginPage() {
	let navigate = useNavigate();
	let location = useLocation();
	let auth = useAuthService();

	let from = location.state?.from?.pathname || "/";

	function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
		event.preventDefault();

		let formData = new FormData(event.currentTarget);
		let username = formData.get("username") as string;

		auth.login(username, () => {
			// Send them back to the page they tried to visit when they were
			// redirected to the login page. Use { replace: true } so we don't create
			// another entry in the history stack for the login page.  This means that
			// when they get to the protected page and click the back button, they
			// won't end up back on the login page, which is also really nice for the
			// user experience.
			navigate(from, { replace: true });
		});
	}

	return (
		<div>
			<p>You must log in to view the page at {from}</p>

			<form onSubmit={handleSubmit}>
				<label>
					Username: <input name="username" type="text" />
				</label>{" "}
				<button type="submit">Login</button>
			</form>
		</div>
	);
}
*/
/*
function LoginPage() {
	let auth = useAuthService();
	const [info, setInfo] = useState<string>(auth.user ? "Already Logged in" : "No info yet...")

	function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
		event.preventDefault();

		let formData = new FormData(event.currentTarget);
		let email = formData.get("email") as string;
		let password = formData.get("password") as string;

		console.log("Trying to loggin using :", email, password)
		axios
			.post("/api/users/login", { email, password })
			.then((response) => {
				saveToken(response.data);
				auth.login(email)
				console.log("Successful Loggin")
				setInfo("Welcome back !")
			})
			.catch((error) => {
				console.log("Error trying to Loggin", error);
				setInfo("Oups, something went wrong ! : " + error.response.data.message)
			});
	}

	return (
		<>
			<form onSubmit={handleSubmit}>
				<div>
					<label>email<input name="email" type="email" /></label>
				</div>

				<div>
					<label>Password <input name="password" type="text" /> </label>
				</div>
				<button type="submit">Login</button>
			</form>
			<div>
				<p>{info}</p>
			</div>
		</>
	);
}

function RegisterPage() {
	let auth = useAuthService();
	const [info, setInfo] = useState<string>(auth.user ? "Already Logged in" : "No info yet...")

	function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
		event.preventDefault();

		let formData = new FormData(event.currentTarget);
		let username = formData.get("username") as string;
		let email = formData.get("email") as string;
		let password = formData.get("password") as string;

		console.log("Trying to register using :", username, email, password)
		axios
			.post("/api/users/signup", { username, email, password })
			.then((response) => {
				saveToken(response.data);
				auth.login(username, () => { })
				console.log("Successful register")
			})
			.catch((error) => {
				console.log("Error trying to register : " + error);
				setInfo("Oups, something went wrong ! : " + error.response.data.message)
			});
	}

	return (
		<>
			<form onSubmit={handleSubmit}>
				<div>
					<label>Username<input name="username" type="text" /></label>
				</div>

				<div> <label>Email <input name="email" type="email" /> </label>
				</div>

				<div>
					<label>Password <input name="password" type="text" /> </label>
				</div>
				<button type="submit">Register</button>
			</form>
			<div>
				<p>{info}</p>
			</div>
		</>
	);
}
*/

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
	<button onClick={()=> {axios.get("/api/game/current").then((response)=> {console.log(response.data);setList(response.data.toString())})}}>GetList</button>
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
						<Route path="/game" element={
							<RequireAuth>
								<div>
									<CreateGame />
								</div>
							</RequireAuth>
						} />
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
					</Route>
				</Routes>
			</SocketProvider>
		</AuthService>
	);
	/*
		function newSocket() {
			return io({
				auth: {
					token: getToken()
				}
			})
		}
	
		function reconnect() {
			socket.close()
			setSocket(newSocket());
		}
	
		const [socket, setSocket] = useState<Socket>(newSocket());
		const navigate = useNavigate()
		React.useEffect(() => {
			console.log('Creating event listener');
			function onConnect() {
				console.log('Emiting a ping beging')
				// socket.emit('ping', 'This is my first ping')e
				console.log('Emiting a ping end')
	
			}
			function onMessage(data: any) {
				console.log('Receiving a message')
				console.log(data)
			}
	
			function onException(data: any) {
				if (data.status === "error") {
					console.log('Redirecting to login')
					navigate('/login')
				}
				console.log('Receiving an exception')
				console.log(data)
				socket.disconnect()
			}
	
			socket.on('connect', onConnect);
			socket.on('message', onMessage)
			socket.on('exception', onException)
			return () => {
				socket.off('connect', onConnect);
				socket.off('message', onMessage)
				socket.off('exception', onException)
			}
		}, [socket])
	
		return (
			<div className="App">
				<AppContext.Provider value={{ socket, reconnect, navigate }}>
					<MyForm />
					<GetAll />
					<GameCanvas />
					<div>
					<button onClick={() => { socket.emit('ping', {word: 'Coucou'}) }}>Say hello to everyone</button>
					</div>
					<div>
					<button onClick={() => { socket.emit('createLobby') }}>Create a game Lobby</button>
					</div>
					<Link to="/login"> go login</Link>
					<Link to="/register"> go register</Link>
					<div onClick={() => { delToken() }}>Logout</div>
				</AppContext.Provider>
			</div>
		)
		*/
}

export default App

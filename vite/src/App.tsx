import { MyForm } from './pages/NameSelector'
import { GetAll } from './pages/getall'
import { GameCanvas } from './game/game'
import React, { createContext, useState } from 'react'
import { Socket, io } from 'socket.io-client'
import { delToken, getToken } from './token/token'
import { LoginForm } from './pages/LoginPage'
import { Link, Navigate, Outlet, Route, Routes, useLocation, useNavigate } from 'react-router-dom'
import { fakeAuthProvider } from './auth'

//0.Definit l'interface pour le type de contexte passe au provider
interface AuthContextType {
	user: any;
	login: (user: string, callback: VoidFunction) => void;
	logout: (callback: VoidFunction) => void;
}

//1.Definit la value passe pour tous les enfants du AuthContext.Provider
let AuthContext = React.createContext<AuthContextType>(null!);

//2.Definit la value passe pour tous les enfants du AuthContext.Provider
//3.Renvoie la balise AuthContext.Provider
function AuthService({ children }: { children: React.ReactNode }) {
	let [user, setUser] = React.useState<any>(null);

	let login = (newUser: string, callback: VoidFunction) => {
		return fakeAuthProvider.login(() => {
			setUser(newUser);
			callback();
		});
	};

	let logout = (callback: VoidFunction) => {
		return fakeAuthProvider.logout(() => {
			setUser(null);
			callback();
		});
	};

	let value = { user, login, logout };
	return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

interface SocketContextType {
	socket: Socket
}

let SocketContext = React.createContext<SocketContextType>(null!)
// Appeler par AuthService quand auth.user change de valeur.
// Creer le socket quand auth.user est defini (On est connecter)
function SocketProvider({ children }: { children: React.ReactNode }) {
	const auth = useAuthService()

	React.useEffect(() => {
		if (!auth.user) return
		function onConnect() {
			console.log('Connected to socket')
			socket.emit('ping', {message: "This is my first ping"}, (response: any)  => {
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
	if(!auth.user) return <>{children}</>;

	const socket = io({
			auth: {
				token: getToken()
			}
		})

	const value = { socket }
	console.log("Socket Creation")
	return <SocketContext.Provider value={value}>{children}</SocketContext.Provider>
}

function useAuthService() {
	return React.useContext(AuthContext);
}
function AuthStatus() {
	let auth = useAuthService();
	let navigate = useNavigate();

	if (!auth.user) {
		return <p>You are not logged in.</p>;
	}

	return (
		<p>
			Welcome {auth.user}!{" "}
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

function RequireAuth({ children }: { children: JSX.Element }) {
	let auth = useAuthService();
	let location = useLocation();

	if (!auth.user) {
		// Redirect them to the /login page, but save the current location they were
		// trying to go to when they were redirected. This allows us to send them
		// along to that page after they login, which is a nicer user experience
		// than dropping them off on the home page.
		return <Navigate to="/login" state={{ from: location }} replace />;
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

//export const AppContext = createContext<any>({});

function App() {

	return (
		<AuthService>
			<SocketProvider>
				<Routes>
					<Route element={<Header />}>
						<Route path="/" element={
							<RequireAuth>
								<div>Game</div>
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
						<Route path="/login" element={<LoginPage />} />
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

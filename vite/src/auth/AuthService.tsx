import React, { useEffect } from "react";
import { IUser, allRoutes } from "../App";
import { AuthProvider } from "../auth";
import { LoginData } from "../component/LoginForm";
import { delAccessToken, delRefreshToken, getAccessToken, saveToken } from "../token/token";
import axios from "axios";
import { RegisterData } from "../component/RegisterForm";
import { userToken } from "../types";
import { useLocation, useNavigate } from "react-router-dom";
import apiClient from "./interceptor.axios";
import { Socket, io } from "socket.io-client";

//0.Definit l'interface pour le type de contexte passe au provider
interface AuthContextType {
	user: IUser | null;
	register: (user: RegisterData) => Promise<void>;
	login: (user: LoginData) => Promise<void>;
	logout: (callback: VoidFunction) => void;
	socket: Socket | null;
	customEmit: (eventname: string, data: any, callback?: (response: any) => void) => Socket | null;
}

//1.Definit la value passe pour tous les enfants du AuthContext.Provider
let AuthContext = React.createContext<AuthContextType>(null!);

//2.Definit la value passe pour tous les enfants du AuthContext.Provider
//3.Renvoie la balise AuthContext.Provider
export function AuthService({ children }: { children: React.ReactNode }) {
	let [user, setUser] = React.useState<any | null>(null);
	const navigate = useNavigate();

	const getUser = async () => {
		try {
			const response = await apiClient.get('/api/users/me');
			if (response.status === 200) {
				setUser(response.data);
			}
		} catch (error) {
			console.log("Not connected", error);
			//navigate("/login", { replace: true });
		}
	}

	useEffect(() => {
		if (!user && !allRoutes.find((el) => el.path === location.pathname)?.public) {
			if (getAccessToken())
				getUser()
			else {
				console.log("Not connected, no token");
				// navigate("/login", { replace: true });
			}
		}
	}, [])

	let register = async (registerData: RegisterData): Promise<void> => {
		return new Promise((resolve, reject) => {
			apiClient
				.post("/api/users/register", registerData)
				.then(async (response) => {
					const userData = response.data as userToken;
					saveToken(userData);
					await getUser()
					resolve();
				})
				.catch((error) => {
					console.log(error);
					reject(error);
				});
		})
	};

	let login = async (loginData: LoginData): Promise<void> => {
		return new Promise((resolve, reject) => {
			apiClient
				.post("/api/users/login", loginData)
				.then(async (response) => {
					const userData = response.data as userToken;
					console.log(userData);
					saveToken(userData);
					await getUser()
					resolve();
				})
				.catch((error) => {
					console.log('login catch', error);
					reject(error);
				});
		})
	};

	let logout = (callback: VoidFunction) => {
		setUser(null);
		delAccessToken();
		delRefreshToken();
	};

	const socket = React.useRef<Socket | null>(null);

	function customEmit(eventname: string, data: any, callback?: (res: any) => void): Socket | null {
		if (!socket.current) return null;
		return socket.current.emit(eventname, {...data, _access_token: getAccessToken()}, callback)
	}

	const onConnect = React.useCallback(() => {
		console.log('Connected to socket')
		customEmit('ping', { message: "This is my first ping" }, (response: any) => {
			console.log(response)
		})
	}, [socket.current])

	React.useEffect(() => {

		if (!user) return;

		if (!socket.current) {
			socket.current = io({
				auth: {
					token: getAccessToken()
				}
			})
			console.log("Socket Creation")
	
		}

		function onMessage(data: any) {
			console.log('Receiving a message')
			console.log(data)
		}

		socket.current.on('connect', onConnect);
		socket.current.on('message', onMessage)
		return () => {
			if (!socket.current) return;
			socket.current.off('connect', onConnect);
			socket.current.off('message', onMessage);
			if (socket.current.connected)
				socket.current.disconnect();
		}
	}, [user])
	let value = { user, register, login, logout, customEmit, socket: socket.current};
	return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuthService() {
	return React.useContext(AuthContext);
}

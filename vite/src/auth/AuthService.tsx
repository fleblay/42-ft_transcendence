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
			axios
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
			axios
				.post("/api/users/login", loginData)
				.then(async (response) => {
					const userData = response.data as userToken;
					console.log(userData);
					delAccessToken();
					delRefreshToken();
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

	let value = { user, register, login, logout };
	return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuthService() {
	return React.useContext(AuthContext);
}

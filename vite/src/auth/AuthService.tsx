import React, { useEffect } from "react";
import { allRoutes } from "../App";
import { LoginData } from "../component/LoginForm";
import { delAccessToken, delRefreshToken, getAccessToken } from "../token/token";
import axios from "axios";
import { RegisterData } from "../component/RegisterForm";
import { plainUser, userToken } from "../types";
import apiClient from "./interceptor.axios";
import { useNavigate } from "react-router-dom";

//0.Definit l'interface pour le type de contexte passe au provider
interface AuthContextType {
	user: plainUser | null;
	register: (user: RegisterData) => Promise<void>;
	login: (user: LoginData) => Promise<void>;
	logout: () => void;
	getUser: () => Promise<void>;
}

//1.Definit la value passe pour tous les enfants du AuthContext.Provider
let AuthContext = React.createContext<AuthContextType>(null!);

//2.Definit la value passe pour tous les enfants du AuthContext.Provider
//3.Renvoie la balise AuthContext.Provider
export function AuthService({ children }: { children: React.ReactNode }) {
	let [user, setUser] = React.useState<any | null>(null);
	const nav = useNavigate();

	const getUser = async () => {
		try {
			const response = await apiClient.get('/api/users/me');
			if (response.status === 200) {
				setUser(response.data);
				console.log("AuthService : me is :", response.data)
			}
		} catch (error) {
			console.log("Not connected", error);
			//navigate("/login", { replace: true });
		}
	}

	useEffect(() => {
		if (!user && !allRoutes.find((el) => el.path === location.pathname)?.public) {
			getUser()
		}
	}, [])

	let register = async (registerData: RegisterData): Promise<void> => {
		return new Promise((resolve, reject) => {
			axios
				.post("/api/auth/register", registerData)
				.then(async (response) => {
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
				.post("/api/auth/login", loginData)
				.then(async (response) => {
					console.log('login response', response);
					if (response.data.needDfa) {
						nav("/dfa", { replace: true });
						reject("needDfa");
					}
					await getUser()
					resolve();
				})
				.catch((error) => {
					console.log('login catch', error);
					reject(error);
				});
		})
	};


	let logout = async (): Promise<void> => {
		return new Promise((resolve, reject) => {
			apiClient
				.get("/api/auth/logout")
				.then(async (response) => {
					setUser(null);
					delAccessToken();
					delRefreshToken();
					resolve()
				})
				.catch((error) => {
					console.log('logout catch', error);
					reject(error);
				});
		})
	};
	let value = { user, register, login, logout, getUser };
	return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}


export function useAuthService() {
	return React.useContext(AuthContext);
}

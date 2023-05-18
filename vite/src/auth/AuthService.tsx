import React, { useContext, useEffect } from "react";
import { allRoutes } from "../App";
import { LoginData } from "../component/LoginForm";
import { delAccessToken, getAccessToken } from "../token/token";
import axios from "axios";
import { RegisterData } from "../component/RegisterForm";
import { plainUser, userToken } from "../types";
import apiClient from "./interceptor.axios";
import { useNavigate, useLocation } from "react-router-dom";
import { ErrorProviderContext } from "../ErrorProvider/ErrorProvider";

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
	let [user, setUser] = React.useState<plainUser | null>(null);
	const nav = useNavigate();
	const location = useLocation();
	const { setError } = useContext(ErrorProviderContext);

	const getUser = async () => {
		try {
			// @ts-ignore
			const response = await apiClient({
				method: 'get',
				url: '/api/users/me',
				noRedirect: allRoutes.find(el => el.path === window.location.pathname)?.public
			})
			if (response.status === 200) {
				setUser(response.data);
				console.log("AuthService : me is :", response.data)
				if (allRoutes.find(el => el.path === window.location.pathname)?.public) {
					setError({ status: 200, message: 'Already logged in' })
					nav('/game', { replace: true })
				}
			}
		} catch (error) {
			console.log("Not connected", error);
		}
	}

	useEffect(() => {
		if (!user) {
			getUser()
		}
	}, [])

	let register = async (registerData: RegisterData): Promise<void> => {
		return new Promise((resolve, reject) => {
			axios
				.post("/api/auth/register", registerData)
				.then(async () => {
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
				.then(async ({ data }) => {
					if (data.needDfa) {
						nav("/dfa", { replace: true });
						reject("needDfa");
					}
					else {
						const { from } = location.state || {}
						console.log('im login, redirect to', from?.pathname);
						nav(from?.pathname || '/', { replace: true })
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

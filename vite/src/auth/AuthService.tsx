import React from "react";
import { IUser, allRoutes } from "../App";
import { AuthProvider } from "../auth";
import { LoginData } from "../component/LoginForm";
import { delAccessToken, delRefreshToken, getAccessToken, saveToken } from "../token/token";
import axios from "axios";
import { RegisterData } from "../component/RegisterForm";
import { userToken } from "../types";
import { useLocation, useNavigate } from "react-router-dom";
import apiClient from "./interceptor.axios";

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
	let [user, setUser] = React.useState< any | null>(null);
	const navigate = useNavigate();

	const getUser = async (name :string ) => {
		console.log("call by ", name);
		console.log(name," : Start getting user")
		apiClient.get('/api/users/me')
			.then( (response) => {
				if (!user)
				{
					console.log(name, ': user is :', user)
					console.log(name, ": response data ", response.data)
					return (setUser(response.data));
				
			}}).then(() => {
				console.log(name, "finish seting user")
				console.log(name, ": user is ", user)
			})
			.catch((error) => {
				console.log("Not connected");
				navigate("/login", { replace: true });

			})
	}

	if (!user && !allRoutes.find((el) => el.path === location.pathname)?.public) {
		if (getAccessToken())
			getUser("AuthService")
		else
			navigate("/login", { replace: true });
	}



	let register = async (registerData: RegisterData): Promise<void> => {
		return new Promise((resolve, reject) => {
			apiClient
				.post("/api/users/register", registerData)
				.then(async (response) => {
					const userData = response.data as userToken;
					saveToken(userData);
					await getUser("register")
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
					await getUser("login")
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

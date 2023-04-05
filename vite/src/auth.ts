import axios from "axios";
import { saveToken } from "./token/token";
import { LoginData } from "./component/LoginForm";
import { IUser } from "./App";

const AuthProvider = {
	isAuthenticated: false,
	login(loginData: LoginData): void {

	},
	logout(callback: VoidFunction) {
		AuthProvider.isAuthenticated = false;
		setTimeout(callback, 100);
	},
};

export { AuthProvider };
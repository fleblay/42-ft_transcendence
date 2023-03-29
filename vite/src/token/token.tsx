import { userToken } from "../types";

export function saveToken(token: userToken) {
	localStorage.setItem("access_token", token.access_token);
}

export function getToken() {
	return localStorage.getItem("access_token");
}

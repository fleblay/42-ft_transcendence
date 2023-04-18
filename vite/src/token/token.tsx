import { userToken } from "../types";
import jwt_decode from "jwt-decode";
import { DecodedToken } from "../types";


export function saveToken(token: userToken) {
	localStorage.setItem("access_token", token.access_token);
	if (token.refresh_token)
		localStorage.setItem("refresh_token", token.refresh_token);
}

export function getAccessToken() {
	return localStorage.getItem("access_token");
}

export function getRefreshToken() {
	return localStorage.getItem("refresh_token");
}


export function delAccessToken() {
	localStorage.removeItem('access_token');
}

export function delRefreshToken() {
	localStorage.removeItem('refresh_token');
}

export function getIdByToken()
{
	console.log("getIdByToken");
	const token = getAccessToken();
	if (token) {
		jwt_decode(token);
		console.log("token: " + token)
		const decodedToken = jwt_decode(token) as DecodedToken;
		console.log("decodedToken", decodedToken);
		return decodedToken.sub;
	}
	return null;
}
import { userToken } from "../types";
import jwt_decode from "jwt-decode";
import { DecodedToken } from "../types";

export function saveToken(token: userToken) {
	localStorage.setItem("access_token", token.access_token);
	if (token.refresh_token)
		localStorage.setItem("refresh_token", token.refresh_token);
}

//TODO : Ecrire un cookie provider qui permettra de les lires plus simplement
//TODO : Gestion des cookies et du local storage pour le register et l'auth
export function getAccessToken() {
	const cookieArray = document.cookie.split(';').map((val)=> {
		const splited_token = val.split('=')
		return ({key: splited_token[0]?.trim(), value: splited_token[1]?.trim()})})
	const access_token_42 = cookieArray.find((cookie)=> cookie.key == "42API_access_token")?.value
	console.log("Cookie 42 access token is [", access_token_42, "]")
	//return localStorage.getItem("access_token") || access_token_42;
	return localStorage.getItem("access_token")
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

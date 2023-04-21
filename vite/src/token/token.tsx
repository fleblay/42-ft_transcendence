import { userToken } from "../types";
import jwt_decode from "jwt-decode";
import { DecodedToken } from "../types";

function getCookieArray(): { key: string, value: string }[] {
	const cookieArray = document.cookie.split('; ').map((val: string) => {
		const splited_token = val.split('=')
		if (splited_token.length == 2)
			return ({
				key: splited_token[0],
				value: splited_token[1]
			})
		else
			return null
	}).filter(elem => elem)
	return cookieArray as {key: string, value: string}[]
}

function getCookieValue(key: string) : string | null {
	const foundCookie = getCookieArray().find((cookie: {key: string, value: string}) => cookie.key == key)
	return (foundCookie ? foundCookie.value : null)
}

function removeCookie(key: string) : void {
	document.cookie = `${key}=; expires = Thu, 01 Jan 1970 00:00:00 GMT`
	}

export function saveToken(token: userToken) {
	localStorage.setItem("access_token", token.access_token);
	if (token.refresh_token)
		localStorage.setItem("refresh_token", token.refresh_token);
}

export function getAccessToken() {
	//console.log('Begin getAccessToken')
	const access_token_42 = getCookieValue("42API_access_token")
	const access_token = localStorage.getItem("access_token")
	if (access_token_42)
	{
		//console.log("Using 42 API acess token : ", access_token_42)
		return access_token_42
	}
	else if (access_token)
	{
		//console.log("Using normal acess token : ", access_token)
		return access_token
	}
	else
	{
		//console.log("Both token are falsy")
		return null
	}
}

export function getRefreshToken() {
	const refresh_token_42 = getCookieValue("42API_refresh_token")
	//return localStorage.getItem("refresh_token");
	return localStorage.getItem("refresh_token") || refresh_token_42;
}

export function delAccessToken() {
	localStorage.removeItem('access_token');
	removeCookie('42API_access_token')
}

export function delRefreshToken() {
	localStorage.removeItem('refresh_token');
	removeCookie('42API_refresh_token')
}

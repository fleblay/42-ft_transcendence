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

export function getCookieValue(key: string) : string | null {
	const foundCookie = getCookieArray().find((cookie: {key: string, value: string}) => cookie.key == key)
	return (foundCookie ? foundCookie.value : null)
}

function removeCookie(key: string) : void {
	document.cookie = `${key}=; expires = Thu, 01 Jan 1970 00:00:00 GMT`
	}

export function getAccessToken() {
	//console.log('Begin getAccessToken')
	return getCookieValue("access_token")
}

export function getDfaToken() {
	return getCookieValue("dfa_token")
}

export function delAccessToken() {
	removeCookie('access_token')
}

export function delDfaToken() {
	removeCookie('dfa_token')
}

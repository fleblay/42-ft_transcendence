import { userSession } from "../types";

export function saveToken(token : string) {

  localStorage.setItem("token", JSON.stringify(token));
}

export function getToken() {
	const token = localStorage.getItem("token");
	
	if (token) {
		return JSON.parse(token);
  }
}
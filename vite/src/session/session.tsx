import { userSession } from "../types";

export function saveSession(user: userSession) {

  localStorage.setItem("user", JSON.stringify(user));
}

export function getSession() {
	const user = localStorage.getItem("user");
	
	if (user) {
		return JSON.parse(user);
  }
}
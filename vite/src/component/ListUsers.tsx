import { useState} from "react";
import apiClient from '../auth/interceptor.axios'

type Games = {
	date: string,
	id: string,
	score: number[]
}

type User = {
	avatar: string,
	email: string,
	gameIds: string[],
	id: number,
	username: string,
	states: string[],
	userConnected: boolean
	savedGames: Games[]
	wonGames: Games[]

	totalScore: number
	password?: string
}

type UserState = {
  states : string[],
  gameIds : string[],
}


export function ListUsers() {

	const [info, setInfo] = useState<string>("No info yet...")
	const [userList, setUserList] = useState<JSX.Element[]>([])

	function handleClick(): void {
			apiClient
			.get("/api/users/all")
			.then((response) => {
				console.log("ressponse from all: ", response)
				setInfo("Successfully retrieve infos :")
				let partialUserList = response.data.map((elem : User) => {
					let {password, ...userInfo} = elem
					return userInfo
					})
				return(partialUserList)
				})
			.then(async (partialUserList: User[]) => {
				let partialUserList2 : User[] = await Promise.all(partialUserList.map(async (e: User) => {
					const userStatus = (await apiClient .get(`/api/game/userstate/${e.id}`)).data as UserState
					const userConnected = (await apiClient .get(`/api/users/connected/${e.id}`)).data as boolean
					const totalScore = e.wonGames.reduce((acc, curr) => {
						return acc + Math.max(...curr.score)
						}, 0)
					console.log("This is connected status", userConnected)
					return {...e, ...userStatus, userConnected, totalScore}
					}))
				return(partialUserList2)
				})
			.then((partialUserList2) =>{
				setUserList(partialUserList2.map((elem) =>{
					return (
						<li>{elem.id}
							<ul style={{listStyleType: "none"}}>
							<li>{elem.username}</li>
							<li>{elem.email}</li>
							<li>Total score : {elem.totalScore}</li>
							<li>{(elem.states.join('-') == "" ? "No status": elem.states.join('-'))}</li>
							<li>{(elem.gameIds.join('-') == "" ? "No game": elem.gameIds.join('-'))}</li>
							<li>{(elem.userConnected) ? "En ligne": "Offline"}</li>
							</ul>
						</li>
					)
					}))
				})
			.catch((error) => {
				console.log(error)
				if (error?.response?.status === 502)
					setInfo("Backend not ready yet. Try again in a few seconds")
				else
					setInfo("Error")
			})
	}

	return (
		<div>
			<button onClick={handleClick}>Update Users list</button>
			<p>{info}</p>
			<ul style={{listStyleType: "none"}}>
				{...userList}
			</ul>
		</div>
	);
}

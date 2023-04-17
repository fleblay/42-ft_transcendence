import { useState} from "react";
import apiClient from '../auth/interceptor.axios'

type User = {
	email: string,
	id: number,
	username: string,
	password?: string
	state?: string,
	gameId?: string
	isConnected?: boolean
}

type UserStatus = {
	state: string,
	gameId: string
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
					const userStatus = (await apiClient .get(`/api/game/userstate/${e.id}`)).data as UserStatus
					const isConnected = (await apiClient .get(`/api/users/connected/${e.id}`)).data as boolean
					console.log("This is connected status", isConnected)
					return {...e, ...userStatus, isConnected}
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
							<li>{elem.state} {elem.gameId}</li>
							<li>{(elem.isConnected) ? "En ligne": "Offline"}</li>
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

export function FakeGames() {

	const [info, setInfo] = useState<string>("No info yet")

	async function handleClick2() : Promise<void> {
		let fakeArray = []
		for(let i = 0; i < 10; i++) {
			fakeArray.push(
			apiClient.get("/api/game/fake")
			)
		}
		try {
		await Promise.all(fakeArray)
		setInfo("Successfully added 10 fake games to history")
		} catch (e) {
			console.log(e)
			setInfo("Error. More info in console")
		}
	}
	return (
	<div>
		<button onClick={handleClick2}>Generate Fake Game Info * 10</button>
		<p>{info}</p>
	</div>
	)
}


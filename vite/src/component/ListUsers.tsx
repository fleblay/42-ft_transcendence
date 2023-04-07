import { useState} from "react";
import apiClient from '../auth/interceptor.axios'

type User = {
	email: string,
	id: number,
	username: string,
	password?: string
	state?: string,
	gameId?: string
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
				console.log(response)
				setInfo("Successfully retrieve infos :")
				let partialUserList = response.data.map((elem : User) => {
					let {password, ...userInfo} = elem
					return userInfo
					})
				return(partialUserList)
				})
			.then(async (partialUserList: User[]) => {
				let partialUserList2 : User[] = await Promise.all(partialUserList.map(async (e: User) => {
					const userStatus = (await apiClient .get(`/api/game/userinfo/${e.id}`)).data as UserStatus
					console.log("This is user status", userStatus)
					return {...e, ...userStatus}
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
							<li>{elem.state}</li>
							<li>{elem.gameId}</li>
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


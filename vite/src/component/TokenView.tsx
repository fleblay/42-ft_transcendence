import { useState } from "react";
import apiClient from '../auth/interceptor.axios'
import { Button } from "@mui/material";
import { useEffect } from "react";

type Token = {
	id: number,
	refreshToken: string,
	userId: number
}

export function AllRefreshToken() {
	const [tokenList, setMyJson] = useState<JSX.Element[]>([])

	function handleClick(): void {
		apiClient
			.get("/api/auth/allTokens")
			.then((response) => {
				let tokenList = response.data.map((elem: Token) => {
					return (<li>token id : {elem.id} 
							<ul style={{listStyleType: "none"}}>

							<li> token : {elem.refreshToken} </li>
							<li> userId : {elem.userId} </li>
							</ul>
							</li>
					)
				})
				setMyJson(tokenList);
			})
	}

	return (
		<div>
			<Button variant="contained" onClick={handleClick}>Get all refresh token</Button>
			{(tokenList) ? <div> {...tokenList} </div> : <div> No token yet </div>}
		</div>
	)

}
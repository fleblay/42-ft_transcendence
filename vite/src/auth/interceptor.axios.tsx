import axios, { AxiosHeaders } from 'axios';
import jwt_decode from "jwt-decode";
import { getAccessToken, saveToken, getRefreshToken } from '../token/token';

type DecodeToken = {
	_id: string;
	email: string;
	iat: number;
	exp: number;
};

const apiClient = axios.create({});

apiClient.interceptors.request.use(
	(config) => {

		const token = localStorage.getItem('access_token') as string;
		console.log("token :", token);
		if (token) {
			const decode = jwt_decode(token) as DecodeToken;
			console.log("decode token :");
			//console.log(decode);
			console.log('exp     ', decode.exp);
			console.log('date.now', Math.floor((Date.now() / 1000)));

			if (decode.exp - (Date.now() / 1000) < 10) {
				console.log("token expired");
				axios.get('/api/auth/refresh', { headers: { 'X-Refresh-Token': getRefreshToken() }}).then((res) => {
					console.log(res);
					console.log("delete and save token");
					localStorage.removeItem('access_token');
					localStorage.removeItem('refresh_token');
					saveToken(res.data);
				}).catch((err) => {
					console.log("delete token");
					localStorage.removeItem('access_token');
					localStorage.removeItem('refresh_token');
					console.log(err);
				}
				);
				const access_token = getAccessToken()
				config.headers.Authorization = `Bearer ${access_token}`;
			}
			else {
				const access_token = getAccessToken()
				config.headers.Authorization = `Bearer ${access_token}`;
			}
		}
		else {
			console.log("no token");
		}

		return config
	}
);

export default apiClient;
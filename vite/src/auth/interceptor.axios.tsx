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
	async (config) => {
		const token = getAccessToken()
		console.log("token :", token);
		if (token) {
			const decode = jwt_decode(token) as DecodeToken;

			if (decode.exp - (Date.now() / 1000) < 10) {
				console.log("token expired");
				const response = await axios.get('/api/auth/refresh', { headers: { 'X-Refresh-Token': getRefreshToken() } });
				if (response.status === 200) {
					console.log("Access token refreshed");
					localStorage.removeItem('access_token');
					localStorage.removeItem('refresh_token');
					saveToken(response.data);
				}
				else {
					console.log("Error refreshing access token", response.status, response.statusText);
					localStorage.removeItem('access_token');
					localStorage.removeItem('refresh_token');
				}
			}
			const access_token = getAccessToken()
			config.headers.Authorization = `Bearer ${access_token}`;
		}
		else {
			console.log("no token");
		}

		return config
	}
);

export default apiClient;
import axios, { AxiosHeaders } from 'axios';
import { getAccessToken, delAccessToken } from '../token/token';
import { MyError } from '../component/Error';
import { useContext, useEffect, useMemo } from 'react';
import { ErrorProviderContext } from '../ErrorProvider/ErrorProvider';
import { useNavigate } from 'react-router-dom';


let isResfreshing = false;
let subscribers = [] as any;

function onRefreshed() {
	subscribers.map((cb: any) => cb())
}

function subscribeTokenRefresh(cb: any) {
	subscribers.push(cb);
}

const apiClient = axios.create({
	baseURL: import.meta.env.BASE_URL ? import.meta.env.BASE_URL : "https://transcendence.jremy.dev:443",
	});


function InterceptorAxios({ children }: { children: JSX.Element }) {

	const { error, setError } = useContext(ErrorProviderContext);
	const navigate = useNavigate();
	useEffect(() => {

		apiClient.interceptors.request.use(
			async (config) => {
				const access_token = getAccessToken()
				if (access_token) {
					config.headers.Authorization = `Bearer ${access_token}`;
				}
				return config;
			}
		);

		apiClient.interceptors.response.use(
			(response: any) => {
				return response;
			},
			async (error) => {
				const { config, response: { status, data: { message } } } = error;
				const originalRequest = config;
				if (status === 498) {
					if (!isResfreshing) {
						isResfreshing = true;
						return new Promise((resolve, reject) => {
							axios.get('/api/auth/refresh')
								.then((response) => {
									if (response.status === 200) {
										resolve(axios(originalRequest));
										onRefreshed();
									}
								})
								.catch((error) => {
									delAccessToken()
									navigate("/login", { replace: true });
									reject(error);
								})
								.finally(() => {
									isResfreshing = false;
								});
						});
					}
					const retryOriginalRequest = new Promise((resolve) => {
						subscribeTokenRefresh(() => {
							resolve(axios(originalRequest));
						});
					}
					);
					return retryOriginalRequest;

				}
				else {
					if (!error.response.config.noError)
						setError({ message, status });
					if (error.response.config.noRedirect)
						return Promise.reject(error)
					if (status === 400)
						return Promise.reject(error)
					else if (status === 401)
						navigate("/login", { replace: true });
					else if (config.url.includes("/chat"))
						navigate("/chat", { replace: true })
					else
						navigate("/", { replace: true });
					return Promise.reject(error)
				}
			}
		);


		const interceptor = apiClient.interceptors.response.use();

		return () => apiClient.interceptors.response.eject(interceptor);

	}, [])
	return children;

}
export default apiClient;
export { InterceptorAxios }

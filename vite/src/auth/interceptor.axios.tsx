import axios, { AxiosHeaders } from 'axios';
import { getAccessToken, getRefreshToken, delAccessToken, delRefreshToken } from '../token/token';
import { MyError } from '../component/Error';
import { useContext, useEffect, useMemo } from 'react';
import { ErrorProviderContext } from '../ErrorProvider/ErrorProvider';
import { useNavigate } from 'react-router-dom';


let isResfreshing = false;
let subscribers = [] as any;

function onRefreshed() {
	subscribers.map((cb: any) => cb())}

function subscribeTokenRefresh(cb: any) {
	subscribers.push(cb);
}

const apiClient = axios.create({});



function InterceptorAxios({ children }: { children : JSX.Element}) {

	const { error, setError } = useContext(ErrorProviderContext);
	const navigate = useNavigate();
	useEffect(() => {

		apiClient.interceptors.request.use(
			async (config) => {
				const access_token = getAccessToken()
				if (access_token) {
					config.headers.Authorization = `Bearer ${access_token}`;
				}
				else {
					console.log("no token");
				}
				return config;
			}
		);

		apiClient.interceptors.response.use(
			(response : any) => {
				return response;
			},
			async (error) => {
				console.log("error in interceptor", error);
				const { config, response: { status, data: {message} } } = error;
				const originalRequest = config;
				if (status === 498) {
					if (!isResfreshing) {
						isResfreshing = true;
						return new Promise((resolve, reject) => {
							axios.get('/api/auth/refresh')
								.then((response) => {
									if (response.status === 200) {
										console.log("Access token refreshed");
										resolve(axios(originalRequest));
										onRefreshed();
									}
								})
								.catch((error) => {
									console.log("Error refreshing access token", error);
									delAccessToken()
									delRefreshToken()
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
					console.log("error in interceptor", error);
					setError({ message, status });
					if (status === 400)
						return error;
					else if (status === 401)
						navigate("/login", { replace: true });
					else if (config.url.includes("/chat"))
						navigate("/chat", { replace: true })
					else
						navigate("/", { replace: true });
					return error;
				}
				return error;
			}
		);


        const interceptor = apiClient.interceptors.response.use();

        return () => apiClient.interceptors.response.eject(interceptor);

    }, [])
    return children;

}
export default apiClient;
export { InterceptorAxios}

/* const apiClient = axios.create({});

apiClient.interceptors.request.use(
	async (config) => {
		const access_token = getAccessToken()
		if (access_token) {
			config.headers.Authorization = `Bearer ${access_token}`;
		}
		else {
			console.log("no token");
		}
		return config;
	}
);


apiClient.interceptors.response.use(
	(response) => {
		return response;
	},
	async (error) => {
		const {setError} = useContext(ErrorProviderContext);
		const { config, response: { status , message} } = error;
		const originalRequest = config;
		if (status === 498)
		{
			if (!isResfreshing) {
				isResfreshing = true;
				return new Promise((resolve, reject) => {
					axios.get('/api/auth/refresh')
						.then((response) => {
							if (response.status === 200) {
								console.log("Access token refreshed");
								resolve(axios(originalRequest));
								onRefreshed();
							}
						})
						.catch((error) => {
							console.log("Error refreshing access token", error);
							delAccessToken()
							delRefreshToken()
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
		else
		{
			error = { message, status};
			console.log("error in interceptor", error);
			setError(error);
			return Promise.reject(error);
		}
	}
);




export default apiClient;
 */

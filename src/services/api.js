import axios from 'axios';

const api = axios.create({
    baseURL: process.env.REACT_APP_API_URL
});

let tokenInterceptor = null;

export const setupApiAuth = async (getToken) => {
    // Remove existing interceptor if it exists
    if (tokenInterceptor !== null) {
        api.interceptors.request.eject(tokenInterceptor);
    }

    // Add new interceptor
    tokenInterceptor = api.interceptors.request.use(
        async (config) => {
            try {
                // Try to get the raw ID token which is typically not encrypted
                const claims = await getToken({
                    authorizationParams: {
                        scope: 'openid profile email',
                        audience: process.env.REACT_APP_AUTH0_AUDIENCE
                    },
                    detailedResponse: true  // Get the full token response
                });
                
                const token = claims.__raw || claims.access_token;
                
                // Debug token format
                console.log('Token parts:', token.split('.').length);
                console.log('Token structure:', {
                    header: token.split('.')[0],
                    payload: token.split('.')[1],
                    // Don't log the full token for security
                });
                
                config.headers.Authorization = `Bearer ${token}`;
            } catch (error) {
                console.error('Error getting access token:', error);
            }
            return config;
        },
        (error) => {
            return Promise.reject(error);
        }
    );
};

export default api; 
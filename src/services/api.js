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

export const postLogin = async (email, auth0Id) => {
    return api.post('/users/post-login', {
        email,
        auth0_id: auth0Id
    });
};

export const createDevice = async (name) => {
    return api.post('/devices', { name });
};

export const deleteDevice = async (deviceId) => {
    return api.delete(`/devices/${deviceId}`);
};

export default api; 
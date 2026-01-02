import axios from 'axios';

// Create axios instance with base URL
const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
    headers: {
        'Content-Type': 'application/json'
    },
    timeout: 10000 // 10 second timeout
});

/**
 * Request interceptor
 * Attaches JWT token to every request if available
 * Automatically detects doctor routes and uses appropriate token
 */
api.interceptors.request.use(
    (config) => {
        // If Authorization header is already set (manually), don't override it
        if (config.headers.Authorization) {
            return config;
        }

        // Check if this is a doctor API request (starts with /doctor)
        const url = config.url || '';
        const isDoctorRequest = url.startsWith('/doctor') || url.startsWith('/doctor/');

        // Get appropriate token based on request type
        let token = null;
        if (isDoctorRequest) {
            token = localStorage.getItem('medicare_doctor_token');
        } else {
            token = localStorage.getItem('medicare_token');
        }

        // If token exists, add to Authorization header
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }

        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

/**
 * Response interceptor
 * Handles common response scenarios and errors
 */
api.interceptors.response.use(
    (response) => {
        // Return the response data directly
        return response;
    },
    (error) => {
        // Handle specific error cases
        if (error.response) {
            // Server responded with error status
            const { status, data } = error.response;
            const requestUrl = error.config?.url || '';

            // Handle unauthorized (token expired or invalid)
            if (status === 401) {
                // Check if this was a doctor request
                const isDoctorRequest = requestUrl.startsWith('/doctor') || requestUrl.startsWith('/doctor/');

                if (isDoctorRequest) {
                    // Clear doctor auth data
                    localStorage.removeItem('medicare_doctor_token');
                    localStorage.removeItem('medicare_doctor');
                } else {
                    // Clear patient auth data
                    localStorage.removeItem('medicare_token');
                    localStorage.removeItem('medicare_user');
                }

                // Redirect to login if not already there
                if (window.location.pathname !== '/login' && window.location.pathname !== '/register') {
                    window.location.href = '/login';
                }
            }

            // Return error message from server
            return Promise.reject({
                message: data.message || 'An error occurred',
                status
            });
        } else if (error.request) {
            // Request made but no response received
            return Promise.reject({
                message: 'Unable to connect to server. Please check your connection.',
                status: 0
            });
        } else {
            // Something went wrong setting up the request
            return Promise.reject({
                message: error.message || 'An unexpected error occurred',
                status: -1
            });
        }
    }
);

export default api;

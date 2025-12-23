import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from '../utils/api';

// Create Auth Context
const AuthContext = createContext(null);

/**
 * Auth Provider Component
 * Manages authentication state and provides auth methods
 */
export const AuthProvider = ({ children }) => {
    // State
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(localStorage.getItem('medicare_token'));
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    /**
     * Load user data from stored token on mount
     */
    const loadUser = useCallback(async () => {
        const storedToken = localStorage.getItem('medicare_token');

        if (!storedToken) {
            setLoading(false);
            return;
        }

        try {
            const response = await api.get('/auth/me');

            if (response.data.success) {
                setUser(response.data.user);
                setToken(storedToken);
            } else {
                // Clear invalid token
                localStorage.removeItem('medicare_token');
                localStorage.removeItem('medicare_user');
                setToken(null);
                setUser(null);
            }
        } catch (err) {
            // Clear auth data on error
            localStorage.removeItem('medicare_token');
            localStorage.removeItem('medicare_user');
            setToken(null);
            setUser(null);
            console.error('Failed to load user:', err.message);
        } finally {
            setLoading(false);
        }
    }, []);

    // Load user on mount
    useEffect(() => {
        loadUser();
    }, [loadUser]);

    /**
     * Register new user
     * @param {object} userData - { name, email, mobile, password }
     * @returns {Promise<object>} - Response with success status
     */
    const register = async (userData) => {
        setError(null);
        setLoading(true);

        try {
            const response = await api.post('/auth/register', userData);

            if (response.data.success) {
                // Store token and user
                localStorage.setItem('medicare_token', response.data.token);
                localStorage.setItem('medicare_user', JSON.stringify(response.data.user));

                setToken(response.data.token);
                setUser(response.data.user);

                return { success: true, message: response.data.message };
            } else {
                throw new Error(response.data.message || 'Registration failed');
            }
        } catch (err) {
            const errorMessage = err.message || 'Registration failed. Please try again.';
            setError(errorMessage);
            return { success: false, message: errorMessage };
        } finally {
            setLoading(false);
        }
    };

    /**
     * Login user
     * @param {object} credentials - { email, password }
     * @returns {Promise<object>} - Response with success status
     */
    const login = async (credentials) => {
        setError(null);
        setLoading(true);

        try {
            const response = await api.post('/auth/login', credentials);

            if (response.data.success) {
                // Store token and user
                localStorage.setItem('medicare_token', response.data.token);
                localStorage.setItem('medicare_user', JSON.stringify(response.data.user));

                setToken(response.data.token);
                setUser(response.data.user);

                return { success: true, message: response.data.message };
            } else {
                throw new Error(response.data.message || 'Login failed');
            }
        } catch (err) {
            const errorMessage = err.message || 'Login failed. Please try again.';
            setError(errorMessage);
            return { success: false, message: errorMessage };
        } finally {
            setLoading(false);
        }
    };

    /**
     * Logout user
     * Clears all auth state and localStorage
     */
    const logout = () => {
        localStorage.removeItem('medicare_token');
        localStorage.removeItem('medicare_user');
        setToken(null);
        setUser(null);
        setError(null);
    };

    /**
     * Update user profile
     * @param {object} profileData - { dob, mobile }
     * @returns {Promise<object>} - Response with success status
     */
    const updateProfile = async (profileData) => {
        setLoading(true);

        try {
            const response = await api.put('/auth/profile', profileData);

            if (response.data.success) {
                // Update user in state and localStorage
                setUser(response.data.user);
                localStorage.setItem('medicare_user', JSON.stringify(response.data.user));

                return { success: true, message: response.data.message };
            } else {
                throw new Error(response.data.message || 'Update failed');
            }
        } catch (err) {
            const errorMessage = err.message || 'Failed to update profile. Please try again.';
            return { success: false, message: errorMessage };
        } finally {
            setLoading(false);
        }
    };

    /**
     * Clear error state
     */
    const clearError = () => {
        setError(null);
    };

    // Context value
    const value = {
        user,
        token,
        loading,
        error,
        isAuthenticated: !!token && !!user,
        register,
        login,
        logout,
        updateProfile,
        clearError,
        loadUser
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};

/**
 * Custom hook to use auth context
 * @returns {object} - Auth context value
 */
export const useAuth = () => {
    const context = useContext(AuthContext);

    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }

    return context;
};

export default AuthContext;


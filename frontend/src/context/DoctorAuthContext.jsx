import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from '../utils/api';

// Create Doctor Auth Context
const DoctorAuthContext = createContext(null);

/**
 * Doctor Auth Provider Component
 * Manages doctor authentication state and provides auth methods
 */
export const DoctorAuthProvider = ({ children }) => {
    // State
    const [doctor, setDoctor] = useState(null);
    const [token, setToken] = useState(localStorage.getItem('medicare_doctor_token'));
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    /**
     * Load doctor data from stored token on mount
     */
    const loadDoctor = useCallback(async () => {
        const storedToken = localStorage.getItem('medicare_doctor_token');

        if (!storedToken) {
            setLoading(false);
            return;
        }

        try {
            // The api interceptor will auto-detect /doctor/ routes and use doctor token
            const response = await api.get('/doctor/auth/me');

            if (response.data.success) {
                setDoctor(response.data.doctor);
                setToken(storedToken);
            } else {
                // Clear invalid token
                localStorage.removeItem('medicare_doctor_token');
                localStorage.removeItem('medicare_doctor');
                setToken(null);
                setDoctor(null);
            }
        } catch (err) {
            // Clear auth data on error
            localStorage.removeItem('medicare_doctor_token');
            localStorage.removeItem('medicare_doctor');
            setToken(null);
            setDoctor(null);
            console.error('Failed to load doctor:', err.message);
        } finally {
            setLoading(false);
        }
    }, []);

    // Load doctor on mount
    useEffect(() => {
        loadDoctor();
    }, [loadDoctor]);

    /**
     * Login doctor
     * @param {object} credentials - { email, password }
     * @returns {Promise<object>} - Response with success status
     */
    const login = async (credentials) => {
        setError(null);
        setLoading(true);

        try {
            const response = await api.post('/doctor/auth/login', credentials);

            if (response.data.success) {
                // Store token and doctor
                localStorage.setItem('medicare_doctor_token', response.data.token);
                localStorage.setItem('medicare_doctor', JSON.stringify(response.data.doctor));

                setToken(response.data.token);
                setDoctor(response.data.doctor);

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
     * Logout doctor
     * Clears all doctor auth state and localStorage
     */
    const logout = () => {
        localStorage.removeItem('medicare_doctor_token');
        localStorage.removeItem('medicare_doctor');
        setToken(null);
        setDoctor(null);
        setError(null);
    };

    /**
     * Update doctor profile
     * @param {object} profileData - { mobile, about, hospital, fees }
     * @returns {Promise<object>} - Response with success status
     */
    const updateProfile = async (profileData) => {
        setLoading(true);

        try {
            const response = await api.put('/doctor/auth/profile', profileData);

            if (response.data.success) {
                // Update doctor in state and localStorage
                setDoctor(response.data.doctor);
                localStorage.setItem('medicare_doctor', JSON.stringify(response.data.doctor));

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
     * Change doctor password
     * @param {object} passwordData - { currentPassword, newPassword }
     * @returns {Promise<object>} - Response with success status
     */
    const changePassword = async (passwordData) => {
        setLoading(true);

        try {
            const response = await api.put('/doctor/auth/password', passwordData);

            if (response.data.success) {
                // Update token if returned
                if (response.data.token) {
                    localStorage.setItem('medicare_doctor_token', response.data.token);
                    setToken(response.data.token);
                }

                return { success: true, message: response.data.message };
            } else {
                throw new Error(response.data.message || 'Password change failed');
            }
        } catch (err) {
            const errorMessage = err.message || 'Failed to change password. Please try again.';
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
        doctor,
        token,
        loading,
        error,
        isAuthenticated: !!token && !!doctor,
        login,
        logout,
        updateProfile,
        changePassword,
        clearError,
        loadDoctor
    };

    return (
        <DoctorAuthContext.Provider value={value}>
            {children}
        </DoctorAuthContext.Provider>
    );
};

/**
 * Custom hook to use doctor auth context
 * @returns {object} - Doctor auth context value
 */
export const useDoctorAuth = () => {
    const context = useContext(DoctorAuthContext);

    if (!context) {
        throw new Error('useDoctorAuth must be used within a DoctorAuthProvider');
    }

    return context;
};

export default DoctorAuthContext;

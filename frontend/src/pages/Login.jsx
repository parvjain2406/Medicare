import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useDoctorAuth } from '../context/DoctorAuthContext';
import './Login.css';

import Landing from './Landing';

/**
 * Login Page Component
 * Handles both patient and doctor authentication with toggle
 */
const Login = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { login: patientLogin, isAuthenticated: isPatientAuth, loading: patientLoading, error: patientError, clearError: clearPatientError } = useAuth();
    const { login: doctorLogin, isAuthenticated: isDoctorAuth, loading: doctorLoading, error: doctorError, clearError: clearDoctorError } = useDoctorAuth();

    // Login mode state (patient or doctor)
    const [isDoctor, setIsDoctor] = useState(location.state?.isDoctor || false);

    // Form state
    const [formData, setFormData] = useState({
        email: '',
        password: ''
    });

    // Validation state
    const [validationErrors, setValidationErrors] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitError, setSubmitError] = useState('');

    // Redirect if already authenticated
    useEffect(() => {
        if (isPatientAuth && !isDoctor) {
            const from = location.state?.from?.pathname || '/dashboard';
            navigate(from, { replace: true });
        }
    }, [isPatientAuth, isDoctor, navigate, location]);

    useEffect(() => {
        if (isDoctorAuth && isDoctor) {
            navigate('/doctor/dashboard', { replace: true });
        }
    }, [isDoctorAuth, isDoctor, navigate]);

    // Clear errors on mount and mode switch
    useEffect(() => {
        if (isDoctor) {
            clearDoctorError?.();
        } else {
            clearPatientError?.();
        }
        setSubmitError('');
    }, [isDoctor, clearPatientError, clearDoctorError]);

    /**
     * Handle input change
     */
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));

        // Clear validation error for this field
        if (validationErrors[name]) {
            setValidationErrors(prev => ({
                ...prev,
                [name]: ''
            }));
        }

        // Clear submit error
        if (submitError) {
            setSubmitError('');
        }
    };

    /**
     * Toggle between patient and doctor login
     */
    const toggleLoginMode = () => {
        setIsDoctor(!isDoctor);
        setFormData({ email: '', password: '' });
        setValidationErrors({});
        setSubmitError('');
    };

    /**
     * Validate form data
     * @returns {boolean} - True if valid
     */
    const validateForm = () => {
        const errors = {};

        // Email validation
        if (!formData.email.trim()) {
            errors.email = 'Email is required';
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
            errors.email = 'Please enter a valid email address';
        }

        // Password validation
        if (!formData.password) {
            errors.password = 'Password is required';
        }

        setValidationErrors(errors);
        return Object.keys(errors).length === 0;
    };

    /**
     * Handle form submission
     */
    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitError('');

        // Validate form
        if (!validateForm()) {
            return;
        }

        setIsSubmitting(true);

        // Call appropriate login function
        const loginFn = isDoctor ? doctorLogin : patientLogin;
        const result = await loginFn({
            email: formData.email.trim().toLowerCase(),
            password: formData.password
        });

        setIsSubmitting(false);

        if (!result.success) {
            setSubmitError(result.message);
        }
        // If success, useEffect will handle redirect
    };

    const loading = isDoctor ? doctorLoading : patientLoading;
    const error = isDoctor ? doctorError : patientError;

    return (
        <div className="login-wrapper">
            <div className="login-background-layer">
                <Landing disableRedirects={true} isBackground={true} />
            </div>

            <div className="auth-container glass-overlay">
                <div className="auth-card glass-card">
                    <div className="auth-header">
                        <div className="logo">
                            <span className="logo-icon">🏥</span>
                            <h1>MediCare</h1>
                        </div>
                        <h2>{isDoctor ? "Doctor's Portal" : 'Welcome Back'}</h2>
                        <p>
                            {isDoctor
                                ? 'Sign in to manage your appointments'
                                : 'Sign in to access your healthcare dashboard'}
                        </p>
                    </div>

                    {/* Login Mode Indicator */}
                    <div className={`login-mode-indicator ${isDoctor ? 'doctor-mode' : 'patient-mode'}`}>
                        <span className="mode-icon">{isDoctor ? '👨‍⚕️' : '👤'}</span>
                        <span className="mode-text">{isDoctor ? 'Doctor Login' : 'Patient Login'}</span>
                    </div>

                    <form onSubmit={handleSubmit} className="auth-form">
                        {/* Submit Error */}
                        {(submitError || error) && (
                            <div className="error-alert">
                                <span className="error-icon">⚠️</span>
                                {submitError || error}
                            </div>
                        )}

                        {/* Email Field */}
                        <div className="form-group">
                            <label htmlFor="email">Email Address</label>
                            <input
                                type="email"
                                id="email"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                placeholder={isDoctor ? 'e.g., doctor.name@medicare.ac.in' : 'Enter your email'}
                                className={validationErrors.email ? 'error' : ''}
                                disabled={isSubmitting || loading}
                                autoComplete="email"
                            />
                            {validationErrors.email && (
                                <span className="field-error">{validationErrors.email}</span>
                            )}
                        </div>

                        {/* Password Field */}
                        <div className="form-group">
                            <label htmlFor="password">Password</label>
                            <input
                                type="password"
                                id="password"
                                name="password"
                                value={formData.password}
                                onChange={handleChange}
                                placeholder={isDoctor ? 'Default: 123456' : 'Enter your password'}
                                className={validationErrors.password ? 'error' : ''}
                                disabled={isSubmitting || loading}
                                autoComplete="current-password"
                            />
                            {validationErrors.password && (
                                <span className="field-error">{validationErrors.password}</span>
                            )}
                        </div>

                        {/* Submit Button */}
                        <button
                            type="submit"
                            className={`auth-button ${isDoctor ? 'doctor-button' : ''}`}
                            disabled={isSubmitting || loading}
                        >
                            {(isSubmitting || loading) ? (
                                <>
                                    <span className="button-spinner"></span>
                                    Signing In...
                                </>
                            ) : (
                                `Sign In as ${isDoctor ? 'Doctor' : 'Patient'}`
                            )}
                        </button>
                    </form>

                    {/* Toggle Login Mode */}
                    <div className="login-toggle-section">
                        <div className="toggle-divider">
                            <span>or</span>
                        </div>
                        <button
                            type="button"
                            className={`toggle-login-btn ${isDoctor ? 'toggle-patient' : 'toggle-doctor'}`}
                            onClick={toggleLoginMode}
                        >
                            {isDoctor ? (
                                <>
                                    <span>👤</span> Switch to Patient Login
                                </>
                            ) : (
                                <>
                                    <span>👨‍⚕️</span> Doctor's Login
                                </>
                            )}
                        </button>
                    </div>

                    {/* Footer - Only show for patient */}
                    {!isDoctor && (
                        <div className="auth-footer">
                            <p>
                                Don't have an account?{' '}
                                <Link to="/register" className="auth-link">
                                    Create Account
                                </Link>
                            </p>
                        </div>
                    )}

                    {/* Doctor info note */}
                    {isDoctor && (
                        <div className="doctor-login-note">
                            <p>
                                <strong>👨‍⚕️ For Doctors:</strong> Use your @medicare.ac.in email
                                <br />
                                <small>Contact admin if you don't have credentials</small>
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Login;

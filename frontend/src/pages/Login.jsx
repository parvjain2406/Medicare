import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

/**
 * Login Page Component
 * Handles user authentication with validation
 */
const Login = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { login, isAuthenticated, loading, error, clearError } = useAuth();

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
        if (isAuthenticated) {
            const from = location.state?.from?.pathname || '/';
            navigate(from, { replace: true });
        }
    }, [isAuthenticated, navigate, location]);

    // Clear errors on mount
    useEffect(() => {
        clearError();
        setSubmitError('');
    }, [clearError]);

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

        // Call login function
        const result = await login({
            email: formData.email.trim().toLowerCase(),
            password: formData.password
        });

        setIsSubmitting(false);

        if (!result.success) {
            setSubmitError(result.message);
        }
        // If success, useEffect will handle redirect
    };

    return (
        <div className="auth-container">
            <div className="auth-card">
                <div className="auth-header">
                    <div className="logo">
                        <span className="logo-icon">🏥</span>
                        <h1>MediCare</h1>
                    </div>
                    <h2>Welcome Back</h2>
                    <p>Sign in to access your healthcare dashboard</p>
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
                            placeholder="Enter your email"
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
                            placeholder="Enter your password"
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
                        className="auth-button"
                        disabled={isSubmitting || loading}
                    >
                        {(isSubmitting || loading) ? (
                            <>
                                <span className="button-spinner"></span>
                                Signing In...
                            </>
                        ) : (
                            'Sign In'
                        )}
                    </button>
                </form>

                <div className="auth-footer">
                    <p>
                        Don't have an account?{' '}
                        <Link to="/register" className="auth-link">
                            Create Account
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Login;

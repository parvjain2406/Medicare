import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

/**
 * Register Page Component
 * Handles new user registration with validation
 */
const Register = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { register, isAuthenticated, loading, error, clearError } = useAuth();

    // Country codes list
    const countryCodes = [
        { code: '+91', country: 'India', flag: '🇮🇳' },
        { code: '+1', country: 'USA/Canada', flag: '🇺🇸' },
        { code: '+44', country: 'UK', flag: '🇬🇧' },
        { code: '+61', country: 'Australia', flag: '🇦🇺' },
        { code: '+971', country: 'UAE', flag: '🇦🇪' },
        { code: '+966', country: 'Saudi Arabia', flag: '🇸🇦' },
        { code: '+65', country: 'Singapore', flag: '🇸🇬' },
        { code: '+60', country: 'Malaysia', flag: '🇲🇾' },
        { code: '+49', country: 'Germany', flag: '🇩🇪' },
        { code: '+33', country: 'France', flag: '🇫🇷' },
        { code: '+81', country: 'Japan', flag: '🇯🇵' },
        { code: '+86', country: 'China', flag: '🇨🇳' },
        { code: '+82', country: 'South Korea', flag: '🇰🇷' },
        { code: '+7', country: 'Russia', flag: '🇷🇺' },
        { code: '+55', country: 'Brazil', flag: '🇧🇷' }
    ];

    // Form state
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        mobile: '',
        countryCode: '+91',
        password: '',
        confirmPassword: ''
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

        // Name validation
        if (!formData.name.trim()) {
            errors.name = 'Name is required';
        } else if (formData.name.trim().length < 2) {
            errors.name = 'Name must be at least 2 characters';
        }

        // Email validation
        if (!formData.email.trim()) {
            errors.email = 'Email is required';
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
            errors.email = 'Please enter a valid email address';
        }

        // Mobile validation (optional)
        if (formData.mobile && !/^[0-9]{10,15}$/.test(formData.mobile)) {
            errors.mobile = 'Please enter a valid mobile number (10-15 digits)';
        }

        // Password validation
        if (!formData.password) {
            errors.password = 'Password is required';
        } else if (formData.password.length < 6) {
            errors.password = 'Password must be at least 6 characters';
        }

        // Confirm password validation
        if (!formData.confirmPassword) {
            errors.confirmPassword = 'Please confirm your password';
        } else if (formData.password !== formData.confirmPassword) {
            errors.confirmPassword = 'Passwords do not match';
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

        // Call register function - combine country code with mobile
        const fullMobile = formData.mobile.trim()
            ? `${formData.countryCode}${formData.mobile.trim()}`
            : '';
        const result = await register({
            name: formData.name.trim(),
            email: formData.email.trim().toLowerCase(),
            mobile: fullMobile,
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
                    <h2>Create Account</h2>
                    <p>Join MediCare to manage your healthcare needs</p>
                </div>

                <form onSubmit={handleSubmit} className="auth-form">
                    {/* Submit Error */}
                    {(submitError || error) && (
                        <div className="error-alert">
                            <span className="error-icon">⚠️</span>
                            {submitError || error}
                        </div>
                    )}

                    {/* Name Field */}
                    <div className="form-group">
                        <label htmlFor="name">Full Name *</label>
                        <input
                            type="text"
                            id="name"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            placeholder="Enter your full name"
                            className={validationErrors.name ? 'error' : ''}
                            disabled={isSubmitting || loading}
                        />
                        {validationErrors.name && (
                            <span className="field-error">{validationErrors.name}</span>
                        )}
                    </div>

                    {/* Email Field */}
                    <div className="form-group">
                        <label htmlFor="email">Email Address *</label>
                        <input
                            type="email"
                            id="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            placeholder="Enter your email"
                            className={validationErrors.email ? 'error' : ''}
                            disabled={isSubmitting || loading}
                        />
                        {validationErrors.email && (
                            <span className="field-error">{validationErrors.email}</span>
                        )}
                    </div>

                    {/* Mobile Field with Country Code */}
                    <div className="form-group">
                        <label htmlFor="mobile">Mobile Number (Optional)</label>
                        <div className="mobile-input-group">
                            <select
                                className="country-code-select"
                                value={formData.countryCode}
                                onChange={(e) => setFormData(prev => ({ ...prev, countryCode: e.target.value }))}
                                disabled={isSubmitting || loading}
                            >
                                {countryCodes.map(cc => (
                                    <option key={cc.code} value={cc.code}>
                                        {cc.flag} {cc.code}
                                    </option>
                                ))}
                            </select>
                            <input
                                type="tel"
                                id="mobile"
                                name="mobile"
                                value={formData.mobile}
                                onChange={handleChange}
                                placeholder="Enter mobile number"
                                className={validationErrors.mobile ? 'error' : ''}
                                disabled={isSubmitting || loading}
                            />
                        </div>
                        {validationErrors.mobile && (
                            <span className="field-error">{validationErrors.mobile}</span>
                        )}
                    </div>

                    {/* Password Field */}
                    <div className="form-group">
                        <label htmlFor="password">Password *</label>
                        <input
                            type="password"
                            id="password"
                            name="password"
                            value={formData.password}
                            onChange={handleChange}
                            placeholder="Create a password (min 6 characters)"
                            className={validationErrors.password ? 'error' : ''}
                            disabled={isSubmitting || loading}
                        />
                        {validationErrors.password && (
                            <span className="field-error">{validationErrors.password}</span>
                        )}
                    </div>

                    {/* Confirm Password Field */}
                    <div className="form-group">
                        <label htmlFor="confirmPassword">Confirm Password *</label>
                        <input
                            type="password"
                            id="confirmPassword"
                            name="confirmPassword"
                            value={formData.confirmPassword}
                            onChange={handleChange}
                            placeholder="Confirm your password"
                            className={validationErrors.confirmPassword ? 'error' : ''}
                            disabled={isSubmitting || loading}
                        />
                        {validationErrors.confirmPassword && (
                            <span className="field-error">{validationErrors.confirmPassword}</span>
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
                                Creating Account...
                            </>
                        ) : (
                            'Create Account'
                        )}
                    </button>
                </form>

                <div className="auth-footer">
                    <p>
                        Already have an account?{' '}
                        <Link to="/login" className="auth-link">
                            Sign In
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Register;

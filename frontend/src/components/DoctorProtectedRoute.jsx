import { Navigate, useLocation } from 'react-router-dom';
import { useDoctorAuth } from '../context/DoctorAuthContext';

/**
 * Doctor Protected Route Component
 * Redirects unauthenticated doctors to login page
 * Shows loading state while checking authentication
 */
const DoctorProtectedRoute = ({ children }) => {
    const { isAuthenticated, loading } = useDoctorAuth();
    const location = useLocation();

    // Show loading spinner while checking auth status
    if (loading) {
        return (
            <div className="loading-container">
                <div className="loading-spinner"></div>
                <p>Loading...</p>
            </div>
        );
    }

    // Redirect to login if not authenticated
    if (!isAuthenticated) {
        // Save the attempted URL for redirecting after login
        return <Navigate to="/login" state={{ from: location, isDoctor: true }} replace />;
    }

    // Render protected content
    return children;
};

export default DoctorProtectedRoute;

import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import ProfileModal from '../components/ProfileModal';

/**
 * Home Page Component
 * Protected dashboard showing user information
 */
const Home = () => {
    const { user, logout, loading } = useAuth();
    const navigate = useNavigate();
    const [isProfileOpen, setIsProfileOpen] = useState(false);

    /**
     * Handle logout
     */
    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    // Show loading if user data not fully loaded
    if (loading) {
        return (
            <div className="loading-container">
                <div className="loading-spinner"></div>
                <p>Loading...</p>
            </div>
        );
    }

    return (
        <div className="home-container">
            {/* Header */}
            <header className="home-header">
                <div className="header-content">
                    <div className="logo">
                        <span className="logo-icon">🏥</span>
                        <h1>MediCare</h1>
                    </div>
                    <nav className="header-nav">
                        <span className="user-greeting">
                            Welcome, <strong>{user?.name || 'User'}</strong>
                        </span>
                        <button
                            onClick={() => setIsProfileOpen(true)}
                            className="profile-button"
                            title="View Profile"
                        >
                            <span>👤</span>
                        </button>
                        <button onClick={handleLogout} className="logout-button">
                            <span>🚪</span> Logout
                        </button>
                    </nav>
                </div>
            </header>

            {/* Main Content */}
            <main className="home-main">
                <div className="dashboard-container">
                    {/* Welcome Section */}
                    <section className="welcome-section">
                        <h2>Welcome to MediCare Dashboard</h2>
                        <p>Manage your healthcare journey with ease</p>
                    </section>

                    {/* Medical Services Hero */}
                    <section className="medical-hero">
                        <h3>World-Class Medical Services</h3>
                        <p className="hero-subtitle">Experience the future of healthcare with our cutting-edge facilities</p>
                        <div className="medical-images-grid">
                            <div className="medical-image-card">
                                <img
                                    src="/src/assets/images/mri_machine.png"
                                    alt="Modern MRI Machine"
                                    className="medical-img"
                                />
                                <div className="image-overlay">
                                    <h4>Advanced Imaging</h4>
                                    <p>State-of-the-art MRI & CT scanning</p>
                                </div>
                            </div>
                            <div className="medical-image-card">
                                <img
                                    src="/src/assets/images/medical_lab.png"
                                    alt="Medical Laboratory"
                                    className="medical-img"
                                />
                                <div className="image-overlay">
                                    <h4>Diagnostic Labs</h4>
                                    <p>Precise testing & quick results</p>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* Quick Actions */}
                    <section className="quick-actions">
                        <h3>Quick Actions</h3>
                        <div className="actions-grid">
                            <div className="action-card" onClick={() => navigate('/appointment')}>
                                <span className="action-icon">📋</span>
                                <h4>Appointments</h4>
                                <p>View or book appointments</p>
                            </div>
                            <div className="action-card" onClick={() => navigate('/doctors')}>
                                <span className="action-icon">👨‍⚕️</span>
                                <h4>Find Doctors</h4>
                                <p>Browse our specialist doctors</p>
                            </div>
                            <div className="action-card" onClick={() => navigate('/beds')}>
                                <span className="action-icon">🛏️</span>
                                <h4>Bed Availability</h4>
                                <p>Check & book hospital beds</p>
                            </div>
                            <div className="action-card" onClick={() => navigate('/records')}>
                                <span className="action-icon">📊</span>
                                <h4>Medical Records</h4>
                                <p>View your health history</p>
                            </div>
                            <div className="action-card" onClick={() => navigate('/prescriptions')}>
                                <span className="action-icon">💊</span>
                                <h4>Prescriptions</h4>
                                <p>Manage your medications</p>
                            </div>
                        </div>
                    </section>

                    {/* MediCare Model of Care */}
                    <section className="model-of-care">
                        <h3>MediCare Model of Care</h3>
                        <p className="model-subtitle">Our commitment to providing exceptional healthcare</p>

                        <div className="care-wheel-container">
                            {/* Top Feature */}
                            <div className="care-feature feature-top">
                                <h4>Exceptional Clinical Talent</h4>
                                <p>Highly qualified specialists</p>
                            </div>

                            {/* Left Features */}
                            <div className="care-feature feature-left-top">
                                <h4>Trust-based Compassionate Care</h4>
                                <p>Patient-first approach</p>
                            </div>
                            <div className="care-feature feature-left-bottom">
                                <h4>Caring Systems & Processes</h4>
                                <p>Streamlined healthcare</p>
                            </div>

                            {/* Center Image */}
                            <div className="care-center">
                                <div className="care-circle">
                                    <div className="circle-content">
                                        <span className="care-icon">🏥</span>
                                        <span className="care-label">MediCare</span>
                                    </div>
                                </div>
                                <div className="orbit-ring"></div>
                                <div className="dot dot-1"></div>
                                <div className="dot dot-2"></div>
                                <div className="dot dot-3"></div>
                                <div className="dot dot-4"></div>
                                <div className="dot dot-5"></div>
                                <div className="dot dot-6"></div>
                            </div>

                            {/* Right Features */}
                            <div className="care-feature feature-right-top">
                                <h4>World-class Infrastructure</h4>
                                <p>Modern medical facilities</p>
                            </div>
                            <div className="care-feature feature-right-bottom">
                                <h4>Latest High-end Technology</h4>
                                <p>Advanced medical equipment</p>
                            </div>

                            {/* Bottom Feature */}
                            <div className="care-feature feature-bottom">
                                <h4>24/7 Patient Support</h4>
                                <p>Round-the-clock assistance</p>
                            </div>
                        </div>
                    </section>

                    {/* About Us Section */}
                    <section className="about-us-section">
                        <div className="about-header">
                            <span className="about-icon">🏥</span>
                            <h3>About MediCare Hospital</h3>
                        </div>
                        <div className="about-content">
                            <div className="about-text">
                                <h4>Our Vision</h4>
                                <p>
                                    To be the leading healthcare provider in India, delivering exceptional
                                    medical care with compassion, innovation, and excellence. We envision
                                    a healthier tomorrow where quality healthcare is accessible to all.
                                </p>
                                <h4>Our Mission</h4>
                                <p>
                                    At MediCare Hospital, we are committed to providing world-class healthcare
                                    services with a patient-first approach. Our team of highly qualified doctors
                                    and medical professionals work tirelessly to ensure the best possible outcomes
                                    for every patient who walks through our doors.
                                </p>
                            </div>
                            <div className="about-stats">
                                <div className="stat-card">
                                    <span className="stat-number">50+</span>
                                    <span className="stat-label">Expert Doctors</span>
                                </div>
                                <div className="stat-card">
                                    <span className="stat-number">10K+</span>
                                    <span className="stat-label">Happy Patients</span>
                                </div>
                                <div className="stat-card">
                                    <span className="stat-number">15+</span>
                                    <span className="stat-label">Specializations</span>
                                </div>
                                <div className="stat-card">
                                    <span className="stat-number">24/7</span>
                                    <span className="stat-label">Emergency Care</span>
                                </div>
                            </div>
                        </div>
                    </section>
                </div>
            </main>

            {/* Footer */}
            <footer className="home-footer">
                <p>© 2024 MediCare Hospital Management System. All rights reserved.</p>
            </footer>

            {/* Profile Modal */}
            <ProfileModal
                isOpen={isProfileOpen}
                onClose={() => setIsProfileOpen(false)}
            />
        </div>
    );
};

export default Home;

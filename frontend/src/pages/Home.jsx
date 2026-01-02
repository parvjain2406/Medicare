import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
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

    // Animation variants
    const fadeInUp = {
        hidden: { opacity: 0, y: 30 },
        visible: { opacity: 1, y: 0 }
    };

    const fadeInLeft = {
        hidden: { opacity: 0, x: -40 },
        visible: { opacity: 1, x: 0 }
    };

    const fadeInRight = {
        hidden: { opacity: 0, x: 40 },
        visible: { opacity: 1, x: 0 }
    };

    const staggerContainer = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: { staggerChildren: 0.1, delayChildren: 0.1 }
        }
    };

    const scaleIn = {
        hidden: { opacity: 0, scale: 0.9 },
        visible: { opacity: 1, scale: 1 }
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
            <motion.header
                className="home-header"
                initial={{ y: -80, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.5, ease: "easeOut" }}
            >
                <div className="header-content">
                    <motion.div
                        className="logo"
                        whileHover={{ scale: 1.05 }}
                        transition={{ type: "spring", stiffness: 300 }}
                    >
                        <motion.span
                            className="logo-icon"
                            animate={{ rotate: [0, 10, -10, 0] }}
                            transition={{ duration: 2, repeat: Infinity, repeatDelay: 4 }}
                        >
                            🏥
                        </motion.span>
                        <h1>MediCare</h1>
                    </motion.div>
                    <nav className="header-nav">
                        <span className="user-greeting">
                            Welcome, <strong>{user?.name || 'User'}</strong>
                        </span>
                        <motion.button
                            onClick={() => setIsProfileOpen(true)}
                            className="profile-button"
                            title="View Profile"
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.95 }}
                        >
                            <span>👤</span>
                        </motion.button>
                        <motion.button
                            onClick={handleLogout}
                            className="logout-button"
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                        >
                            <span>🚪</span> Logout
                        </motion.button>
                    </nav>
                </div>
            </motion.header>

            {/* Main Content */}
            <main className="home-main">
                <div className="dashboard-container">
                    {/* Welcome Section */}
                    <motion.section
                        className="welcome-section"
                        initial="hidden"
                        animate="visible"
                        variants={fadeInUp}
                        transition={{ duration: 0.6 }}
                    >
                        <motion.h2
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.5, delay: 0.2 }}
                        >
                            Welcome to MediCare Dashboard
                        </motion.h2>
                        <motion.p
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ duration: 0.5, delay: 0.4 }}
                        >
                            Manage your healthcare journey with ease
                        </motion.p>
                    </motion.section>

                    {/* Medical Services Hero */}
                    <motion.section
                        className="medical-hero"
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true, margin: "-50px" }}
                        variants={staggerContainer}
                    >
                        <motion.h3 variants={fadeInUp}>World-Class Medical Services</motion.h3>
                        <motion.p className="hero-subtitle" variants={fadeInUp}>
                            Experience the future of healthcare with our cutting-edge facilities
                        </motion.p>
                        <motion.div
                            className="medical-images-grid"
                            variants={staggerContainer}
                        >
                            <motion.div
                                className="medical-image-card"
                                variants={fadeInLeft}
                                whileHover={{
                                    scale: 1.03,
                                    boxShadow: "0 20px 40px rgba(0,0,0,0.2)"
                                }}
                                transition={{ duration: 0.3 }}
                            >
                                <img
                                    src="/src/assets/images/mri_machine.png"
                                    alt="Modern MRI Machine"
                                    className="medical-img"
                                />
                                <div className="image-overlay">
                                    <h4>Advanced Imaging</h4>
                                    <p>State-of-the-art MRI & CT scanning</p>
                                </div>
                            </motion.div>
                            <motion.div
                                className="medical-image-card"
                                variants={fadeInRight}
                                whileHover={{
                                    scale: 1.03,
                                    boxShadow: "0 20px 40px rgba(0,0,0,0.2)"
                                }}
                                transition={{ duration: 0.3 }}
                            >
                                <img
                                    src="/src/assets/images/medical_lab.png"
                                    alt="Medical Laboratory"
                                    className="medical-img"
                                />
                                <div className="image-overlay">
                                    <h4>Diagnostic Labs</h4>
                                    <p>Precise testing & quick results</p>
                                </div>
                            </motion.div>
                        </motion.div>
                    </motion.section>

                    {/* Quick Actions */}
                    <motion.section
                        className="quick-actions"
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true, margin: "-50px" }}
                        variants={staggerContainer}
                    >
                        <motion.h3 variants={fadeInUp}>Quick Actions</motion.h3>
                        <motion.div className="actions-grid" variants={staggerContainer}>
                            <motion.div
                                className="action-card"
                                onClick={() => navigate('/appointment')}
                                variants={scaleIn}
                                whileHover={{ y: -8, boxShadow: "0 15px 35px rgba(0,0,0,0.15)" }}
                                whileTap={{ scale: 0.98 }}
                            >
                                <motion.span
                                    className="action-icon"
                                    animate={{ y: [0, -5, 0] }}
                                    transition={{ duration: 2, repeat: Infinity, repeatDelay: 1 }}
                                >
                                    📋
                                </motion.span>
                                <h4>Appointments</h4>
                                <p>View or book appointments</p>
                            </motion.div>
                            <motion.div
                                className="action-card"
                                onClick={() => navigate('/doctors')}
                                variants={scaleIn}
                                whileHover={{ y: -8, boxShadow: "0 15px 35px rgba(0,0,0,0.15)" }}
                                whileTap={{ scale: 0.98 }}
                            >
                                <motion.span
                                    className="action-icon"
                                    animate={{ scale: [1, 1.1, 1] }}
                                    transition={{ duration: 2, repeat: Infinity, repeatDelay: 1 }}
                                >
                                    👨‍⚕️
                                </motion.span>
                                <h4>Find Doctors</h4>
                                <p>Browse our specialist doctors</p>
                            </motion.div>
                            <motion.div
                                className="action-card"
                                onClick={() => navigate('/beds')}
                                variants={scaleIn}
                                whileHover={{ y: -8, boxShadow: "0 15px 35px rgba(0,0,0,0.15)" }}
                                whileTap={{ scale: 0.98 }}
                            >
                                <motion.span
                                    className="action-icon"
                                    animate={{ rotate: [0, 5, -5, 0] }}
                                    transition={{ duration: 3, repeat: Infinity, repeatDelay: 2 }}
                                >
                                    🛏️
                                </motion.span>
                                <h4>Bed Availability</h4>
                                <p>Check & book hospital beds</p>
                            </motion.div>
                            <motion.div
                                className="action-card"
                                onClick={() => navigate('/records')}
                                variants={scaleIn}
                                whileHover={{ y: -8, boxShadow: "0 15px 35px rgba(0,0,0,0.15)" }}
                                whileTap={{ scale: 0.98 }}
                            >
                                <motion.span
                                    className="action-icon"
                                    animate={{ y: [0, -3, 0] }}
                                    transition={{ duration: 1.5, repeat: Infinity, repeatDelay: 2 }}
                                >
                                    📊
                                </motion.span>
                                <h4>Medical Records</h4>
                                <p>View your health history</p>
                            </motion.div>
                            <motion.div
                                className="action-card"
                                onClick={() => navigate('/prescriptions')}
                                variants={scaleIn}
                                whileHover={{ y: -8, boxShadow: "0 15px 35px rgba(0,0,0,0.15)" }}
                                whileTap={{ scale: 0.98 }}
                            >
                                <motion.span
                                    className="action-icon"
                                    animate={{ rotate: [0, 10, -10, 0] }}
                                    transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
                                >
                                    💊
                                </motion.span>
                                <h4>Prescriptions</h4>
                                <p>Manage your medications</p>
                            </motion.div>
                        </motion.div>
                    </motion.section>

                    {/* MediCare Model of Care */}
                    <motion.section
                        className="model-of-care"
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true, margin: "-50px" }}
                        variants={fadeInUp}
                        transition={{ duration: 0.6 }}
                    >
                        <motion.h3 variants={fadeInUp}>MediCare Model of Care</motion.h3>
                        <motion.p className="model-subtitle" variants={fadeInUp}>
                            Our commitment to providing exceptional healthcare
                        </motion.p>

                        <div className="care-wheel-container">
                            {/* Top Feature */}
                            <motion.div
                                className="care-feature feature-top"
                                initial={{ opacity: 0, y: -20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: 0.1, duration: 0.5 }}
                            >
                                <h4>Exceptional Clinical Talent</h4>
                                <p>Highly qualified specialists</p>
                            </motion.div>

                            {/* Left Features */}
                            <motion.div
                                className="care-feature feature-left-top"
                                initial={{ opacity: 0, x: -30 }}
                                whileInView={{ opacity: 1, x: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: 0.2, duration: 0.5 }}
                            >
                                <h4>Trust-based Compassionate Care</h4>
                                <p>Patient-first approach</p>
                            </motion.div>
                            <motion.div
                                className="care-feature feature-left-bottom"
                                initial={{ opacity: 0, x: -30 }}
                                whileInView={{ opacity: 1, x: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: 0.3, duration: 0.5 }}
                            >
                                <h4>Caring Systems & Processes</h4>
                                <p>Streamlined healthcare</p>
                            </motion.div>

                            {/* Center Image */}
                            <motion.div
                                className="care-center"
                                initial={{ opacity: 0, scale: 0.5 }}
                                whileInView={{ opacity: 1, scale: 1 }}
                                viewport={{ once: true }}
                                transition={{ delay: 0.4, duration: 0.6, type: "spring" }}
                            >
                                <div className="care-circle">
                                    <div className="circle-content">
                                        <motion.span
                                            className="care-icon"
                                            animate={{ scale: [1, 1.1, 1] }}
                                            transition={{ duration: 2, repeat: Infinity }}
                                        >
                                            🏥
                                        </motion.span>
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
                            </motion.div>

                            {/* Right Features */}
                            <motion.div
                                className="care-feature feature-right-top"
                                initial={{ opacity: 0, x: 30 }}
                                whileInView={{ opacity: 1, x: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: 0.5, duration: 0.5 }}
                            >
                                <h4>World-class Infrastructure</h4>
                                <p>Modern medical facilities</p>
                            </motion.div>
                            <motion.div
                                className="care-feature feature-right-bottom"
                                initial={{ opacity: 0, x: 30 }}
                                whileInView={{ opacity: 1, x: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: 0.6, duration: 0.5 }}
                            >
                                <h4>Latest High-end Technology</h4>
                                <p>Advanced medical equipment</p>
                            </motion.div>

                            {/* Bottom Feature */}
                            <motion.div
                                className="care-feature feature-bottom"
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: 0.7, duration: 0.5 }}
                            >
                                <h4>24/7 Patient Support</h4>
                                <p>Round-the-clock assistance</p>
                            </motion.div>
                        </div>
                    </motion.section>

                    {/* About Us Section */}
                    <motion.section
                        className="about-us-section"
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true, margin: "-50px" }}
                        variants={staggerContainer}
                    >
                        <motion.div className="about-header" variants={fadeInUp}>
                            <motion.span
                                className="about-icon"
                                animate={{ rotate: [0, 360] }}
                                transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                            >
                                🏥
                            </motion.span>
                            <h3>About MediCare Hospital</h3>
                        </motion.div>
                        <div className="about-content">
                            <motion.div className="about-text" variants={fadeInLeft}>
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
                            </motion.div>
                            <motion.div
                                className="about-stats"
                                variants={staggerContainer}
                            >
                                <motion.div
                                    className="stat-card"
                                    variants={scaleIn}
                                    whileHover={{ scale: 1.05, y: -5 }}
                                >
                                    <motion.span
                                        className="stat-number"
                                        initial={{ opacity: 0 }}
                                        whileInView={{ opacity: 1 }}
                                        viewport={{ once: true }}
                                    >
                                        50+
                                    </motion.span>
                                    <span className="stat-label">Expert Doctors</span>
                                </motion.div>
                                <motion.div
                                    className="stat-card"
                                    variants={scaleIn}
                                    whileHover={{ scale: 1.05, y: -5 }}
                                >
                                    <motion.span
                                        className="stat-number"
                                        initial={{ opacity: 0 }}
                                        whileInView={{ opacity: 1 }}
                                        viewport={{ once: true }}
                                    >
                                        10K+
                                    </motion.span>
                                    <span className="stat-label">Happy Patients</span>
                                </motion.div>
                                <motion.div
                                    className="stat-card"
                                    variants={scaleIn}
                                    whileHover={{ scale: 1.05, y: -5 }}
                                >
                                    <motion.span
                                        className="stat-number"
                                        initial={{ opacity: 0 }}
                                        whileInView={{ opacity: 1 }}
                                        viewport={{ once: true }}
                                    >
                                        15+
                                    </motion.span>
                                    <span className="stat-label">Specializations</span>
                                </motion.div>
                                <motion.div
                                    className="stat-card"
                                    variants={scaleIn}
                                    whileHover={{ scale: 1.05, y: -5 }}
                                >
                                    <motion.span
                                        className="stat-number"
                                        initial={{ opacity: 0 }}
                                        whileInView={{ opacity: 1 }}
                                        viewport={{ once: true }}
                                    >
                                        24/7
                                    </motion.span>
                                    <span className="stat-label">Emergency Care</span>
                                </motion.div>
                            </motion.div>
                        </div>
                    </motion.section>
                </div>
            </main>

            {/* Footer */}
            <motion.footer
                className="home-footer"
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5 }}
            >
                <p>© 2024 MediCare Hospital Management System. All rights reserved.</p>
            </motion.footer>

            {/* Profile Modal */}
            <ProfileModal
                isOpen={isProfileOpen}
                onClose={() => setIsProfileOpen(false)}
            />
        </div>
    );
};

export default Home;


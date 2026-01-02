import React, { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useDoctorAuth } from '../context/DoctorAuthContext';
import { motion } from 'framer-motion';
import { ArrowRight, Star, Shield, Heart } from 'lucide-react';
import './Landing.css';

import hospitalImage from '../assets/images/hospital_high_level.png';

const Landing = ({ disableRedirects = false, isBackground = false }) => {
    const { isAuthenticated: isPatientAuth } = useAuth();
    const { isAuthenticated: isDoctorAuth } = useDoctorAuth();
    const navigate = useNavigate();

    useEffect(() => {
        if (disableRedirects) return;

        if (isDoctorAuth) {
            navigate('/doctor/dashboard');
        } else if (isPatientAuth) {
            navigate('/dashboard');
        }
    }, [isPatientAuth, isDoctorAuth, navigate, disableRedirects]);

    // Animation variants
    const fadeInUp = {
        hidden: { opacity: 0, y: 40 },
        visible: { opacity: 1, y: 0 }
    };

    const fadeInLeft = {
        hidden: { opacity: 0, x: -60 },
        visible: { opacity: 1, x: 0 }
    };

    const fadeInRight = {
        hidden: { opacity: 0, x: 60 },
        visible: { opacity: 1, x: 0 }
    };

    const staggerContainer = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: { staggerChildren: 0.2, delayChildren: 0.1 }
        }
    };

    const scaleIn = {
        hidden: { opacity: 0, scale: 0.8 },
        visible: { opacity: 1, scale: 1 }
    };

    return (
        <div className={`landing-container ${isBackground ? 'landing-background' : ''}`}>
            {/* Navigation - Hide in background mode */}
            {!isBackground && (
                <motion.nav
                    className="landing-nav"
                    initial={{ y: -100, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ duration: 0.6, ease: "easeOut" }}
                >
                    <Link to="/" className="nav-logo">
                        <motion.span
                            animate={{ rotate: [0, 10, -10, 0] }}
                            transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
                        >
                            🏥
                        </motion.span>
                        MediCare
                    </Link>
                    <div className="nav-links">
                        <Link to="/login" className="btn btn-ghost">Log In</Link>
                        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                            <Link to="/register" className="btn btn-primary">Get Started</Link>
                        </motion.div>
                    </div>
                </motion.nav>
            )}

            {/* Hero Section */}
            <header className="hero-section">
                <motion.div
                    className="hero-content"
                    initial="hidden"
                    animate="visible"
                    variants={staggerContainer}
                >
                    <motion.h1
                        variants={fadeInLeft}
                        transition={{ duration: 0.8, ease: "easeOut" }}
                    >
                        Exceptional Care <br />
                        <motion.span
                            initial={{ opacity: 0, scale: 0.5 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: 0.5, duration: 0.6, type: "spring", stiffness: 100 }}
                        >
                            for Life.
                        </motion.span>
                    </motion.h1>
                    <motion.p
                        variants={fadeInUp}
                        transition={{ duration: 0.8, delay: 0.3 }}
                    >
                        Experience the pinnacle of medical excellence.
                        We combine cutting-edge technology with compassionate care
                        to define the future of healthcare management.
                    </motion.p>

                    <motion.div
                        variants={fadeInUp}
                        transition={{ duration: 0.6, delay: 0.5 }}
                    >
                        <motion.div
                            whileHover={{ scale: 1.05, x: 5 }}
                            whileTap={{ scale: 0.95 }}
                        >
                            <Link to="/register" className="btn btn-primary hero-cta">
                                Start Your Journey <ArrowRight size={20} style={{ marginLeft: '8px' }} />
                            </Link>
                        </motion.div>
                    </motion.div>
                </motion.div>

                <motion.div
                    className="hero-image"
                    initial="hidden"
                    animate="visible"
                    variants={fadeInRight}
                    transition={{ duration: 1, delay: 0.4, ease: "easeOut" }}
                >
                    <motion.div
                        className="hero-card"
                        whileHover={{
                            scale: 1.02,
                            rotateY: -5,
                            boxShadow: "0 40px 80px -15px rgba(0, 0, 0, 0.25)"
                        }}
                        transition={{ duration: 0.4 }}
                        style={{ transformStyle: "preserve-3d" }}
                    >
                        <img
                            src={hospitalImage}
                            alt="Modern Hospital Exterior View"
                            onError={(e) => {
                                e.target.onerror = null;
                                e.target.src = 'https://images.unsplash.com/photo-1586773860418-d37222d8fce3?auto=format&fit=crop&q=80&w=2000';
                            }}
                        />
                    </motion.div>
                </motion.div>
            </header>

            {/* Features Preview */}
            <motion.section
                className="features-grid"
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: "-100px" }}
                variants={staggerContainer}
            >
                <motion.div
                    className="feature-card"
                    variants={scaleIn}
                    transition={{ duration: 0.5 }}
                    whileHover={{
                        y: -10,
                        borderLeftColor: "#3b82f6",
                        transition: { duration: 0.2 }
                    }}
                >
                    <motion.span
                        className="feature-icon"
                        animate={{ rotate: [0, 15, -15, 0] }}
                        transition={{ duration: 3, repeat: Infinity, repeatDelay: 2 }}
                    >
                        <Star size={32} color="#f59e0b" />
                    </motion.span>
                    <h3>Premium Access</h3>
                    <p>Priority scheduling with the region's top medical specialists.</p>
                </motion.div>

                <motion.div
                    className="feature-card"
                    variants={scaleIn}
                    transition={{ duration: 0.5 }}
                    whileHover={{
                        y: -10,
                        borderLeftColor: "#3b82f6",
                        transition: { duration: 0.2 }
                    }}
                >
                    <motion.span
                        className="feature-icon"
                        animate={{ scale: [1, 1.1, 1] }}
                        transition={{ duration: 2, repeat: Infinity, repeatDelay: 1 }}
                    >
                        <Shield size={32} color="#10b981" />
                    </motion.span>
                    <h3>Secure Intelligence</h3>
                    <p>State-of-the-art encryption for your complete medical history.</p>
                </motion.div>

                <motion.div
                    className="feature-card"
                    variants={scaleIn}
                    transition={{ duration: 0.5 }}
                    whileHover={{
                        y: -10,
                        borderLeftColor: "#3b82f6",
                        transition: { duration: 0.2 }
                    }}
                >
                    <motion.span
                        className="feature-icon"
                        animate={{ scale: [1, 1.2, 1] }}
                        transition={{ duration: 1.5, repeat: Infinity }}
                    >
                        <Heart size={32} color="#ef4444" />
                    </motion.span>
                    <h3>Concierge Care</h3>
                    <p>24/7 dedicated support team for all your healthcare needs.</p>
                </motion.div>
            </motion.section>
        </div>
    );
};

export default Landing;


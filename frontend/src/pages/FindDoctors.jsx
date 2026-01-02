import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';

/**
 * Find Doctors Page
 * Searchable grid of doctors with filtering by specialization
 */
const FindDoctors = () => {
    const navigate = useNavigate();
    const [doctors, setDoctors] = useState([]);
    const [specializations, setSpecializations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedSpecialization, setSelectedSpecialization] = useState('All');

    // Fetch doctors and specializations
    useEffect(() => {
        fetchDoctors();
        fetchSpecializations();
    }, []);

    // Fetch when filters change
    useEffect(() => {
        fetchDoctors();
    }, [selectedSpecialization, searchTerm]);

    const fetchDoctors = async () => {
        try {
            setLoading(true);
            const params = new URLSearchParams();
            if (selectedSpecialization !== 'All') {
                params.append('specialization', selectedSpecialization);
            }
            if (searchTerm) {
                params.append('search', searchTerm);
            }
            const response = await api.get(`/doctors?${params.toString()}`);
            if (response.data.success) {
                setDoctors(response.data.data);
            }
        } catch (error) {
            console.error('Error fetching doctors:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchSpecializations = async () => {
        try {
            const response = await api.get('/doctors/specializations');
            if (response.data.success) {
                setSpecializations(response.data.data);
            }
        } catch (error) {
            console.error('Error fetching specializations:', error);
        }
    };

    const handleBookAppointment = (doctorId) => {
        navigate(`/appointment?doctor=${doctorId}`);
    };

    const getRatingStars = (rating) => {
        const stars = [];
        const fullStars = Math.floor(rating);
        const hasHalf = rating % 1 >= 0.5;

        for (let i = 0; i < fullStars; i++) {
            stars.push('⭐');
        }
        if (hasHalf) stars.push('✨');
        return stars.join('');
    };

    return (
        <div className="page-container">
            {/* Header */}
            <header className="page-header">
                <button className="back-button" onClick={() => navigate('/')}>
                    ← Back to Dashboard
                </button>
                <h1>👨‍⚕️ Find Doctors</h1>
                <p>Browse our specialist doctors and book appointments</p>
            </header>

            {/* Filters */}
            <div className="filters-container">
                <div className="search-box">
                    <span className="search-icon">🔍</span>
                    <input
                        type="text"
                        placeholder="Search by doctor name or hospital..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <div className="filter-select">
                    <select
                        value={selectedSpecialization}
                        onChange={(e) => setSelectedSpecialization(e.target.value)}
                    >
                        <option value="All">All Specializations</option>
                        {specializations.map((spec) => (
                            <option key={spec} value={spec}>{spec}</option>
                        ))}
                    </select>
                </div>
            </div>

            {/* Results Info */}
            <div className="results-info">
                {loading ? (
                    <span>Loading doctors...</span>
                ) : (
                    <span>{doctors.length} doctor{doctors.length !== 1 ? 's' : ''} found</span>
                )}
            </div>

            {/* Doctors Grid */}
            {loading ? (
                <div className="loading-state">
                    <div className="loading-spinner"></div>
                    <p>Loading doctors...</p>
                </div>
            ) : doctors.length === 0 ? (
                <div className="empty-state">
                    <span className="empty-icon">🔍</span>
                    <h3>No doctors found</h3>
                    <p>Try adjusting your search or filter criteria</p>
                </div>
            ) : (
                <div className="doctors-grid">
                    {doctors.map((doctor) => (
                        <div key={doctor._id} className="doctor-card">
                            <div className="doctor-avatar">
                                {doctor.image ? (
                                    <img src={doctor.image} alt={doctor.name} />
                                ) : (
                                    <span>{doctor.name.split(' ').map(n => n[0]).join('').slice(0, 2)}</span>
                                )}
                            </div>
                            <div className="doctor-info">
                                <h3>{doctor.name}</h3>
                                <span className="specialization-badge">{doctor.specialization}</span>
                                <p className="qualifications">{doctor.qualifications}</p>
                                <div className="doctor-meta">
                                    <span>📅 {doctor.experience} years experience</span>
                                </div>
                                <div className="doctor-rating">
                                    <span className="stars">{getRatingStars(doctor.rating)}</span>
                                    <span className="rating-value">
                                        {doctor.rating.toFixed(1)} <span style={{ fontSize: '0.8em', color: '#64748b' }}>({doctor.numReviews || 0} reviews)</span>
                                    </span>
                                </div>
                                <div className="doctor-footer">
                                    <span className="fees">₹{doctor.fees}</span>
                                    <button
                                        className="book-btn"
                                        onClick={() => handleBookAppointment(doctor._id)}
                                    >
                                        Book Appointment
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default FindDoctors;

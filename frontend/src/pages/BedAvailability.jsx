import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';

/**
 * Bed Availability Page
 * View real-time bed availability and book beds
 */
const BedAvailability = () => {
    const navigate = useNavigate();
    const [availability, setAvailability] = useState([]);
    const [selectedWard, setSelectedWard] = useState(null);
    const [availableBeds, setAvailableBeds] = useState([]);
    const [myBookings, setMyBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [bedsLoading, setBedsLoading] = useState(false);
    const [showBookingForm, setShowBookingForm] = useState(false);
    const [selectedBed, setSelectedBed] = useState(null);
    const [activeTab, setActiveTab] = useState('availability');

    // Booking form state
    const [formData, setFormData] = useState({
        admissionDate: '',
        expectedDischarge: '',
        reason: '',
        emergencyName: '',
        emergencyPhone: '',
        emergencyRelation: ''
    });
    const [submitStatus, setSubmitStatus] = useState({ type: '', message: '' });
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        fetchAvailability();
        fetchMyBookings();
    }, []);

    useEffect(() => {
        if (selectedWard) {
            fetchAvailableBeds(selectedWard);
        }
    }, [selectedWard]);

    const fetchAvailability = async () => {
        try {
            setLoading(true);
            const response = await api.get('/beds/availability');
            if (response.data.success) {
                setAvailability(response.data.data);
            }
        } catch (error) {
            console.error('Error fetching availability:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchAvailableBeds = async (wardType) => {
        try {
            setBedsLoading(true);
            const response = await api.get(`/beds/available/${wardType}`);
            if (response.data.success) {
                setAvailableBeds(response.data.data);
            }
        } catch (error) {
            console.error('Error fetching beds:', error);
        } finally {
            setBedsLoading(false);
        }
    };

    const fetchMyBookings = async () => {
        try {
            const response = await api.get('/beds/my-bookings');
            if (response.data.success) {
                setMyBookings(response.data.data);
            }
        } catch (error) {
            console.error('Error fetching bookings:', error);
        }
    };

    const handleBookBed = (bed) => {
        setSelectedBed(bed);
        setShowBookingForm(true);
        setSubmitStatus({ type: '', message: '' });
    };

    const handleSubmitBooking = async (e) => {
        e.preventDefault();

        if (!formData.admissionDate || !formData.expectedDischarge || !formData.reason) {
            setSubmitStatus({ type: 'error', message: 'Please fill all required fields' });
            return;
        }

        setSubmitting(true);
        try {
            const response = await api.post('/beds/book', {
                bedId: selectedBed._id,
                admissionDate: formData.admissionDate,
                expectedDischarge: formData.expectedDischarge,
                reason: formData.reason,
                emergencyContact: {
                    name: formData.emergencyName,
                    phone: formData.emergencyPhone,
                    relation: formData.emergencyRelation
                }
            });

            if (response.data.success) {
                setSubmitStatus({ type: 'success', message: 'Bed booked successfully!' });
                setShowBookingForm(false);
                setSelectedBed(null);
                setFormData({
                    admissionDate: '',
                    expectedDischarge: '',
                    reason: '',
                    emergencyName: '',
                    emergencyPhone: '',
                    emergencyRelation: ''
                });
                fetchAvailability();
                fetchMyBookings();
                if (selectedWard) fetchAvailableBeds(selectedWard);
                setActiveTab('my-bookings');
            }
        } catch (error) {
            setSubmitStatus({
                type: 'error',
                message: error.message || 'Failed to book bed'
            });
        } finally {
            setSubmitting(false);
        }
    };

    const handleCancelBooking = async (bookingId) => {
        if (!window.confirm('Are you sure you want to cancel this booking?')) return;

        try {
            const response = await api.delete(`/beds/booking/${bookingId}`);
            if (response.data.success) {
                fetchMyBookings();
                fetchAvailability();
            }
        } catch (error) {
            alert(error.message || 'Failed to cancel booking');
        }
    };

    const getMinDate = () => new Date().toISOString().split('T')[0];

    const getWardIcon = (wardType) => {
        const icons = {
            'General': '🛏️',
            'ICU': '🏥',
            'Emergency': '🚨',
            'Pediatric': '👶',
            'Maternity': '🤱'
        };
        return icons[wardType] || '🛏️';
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'Confirmed': return 'status-scheduled';
            case 'Admitted': return 'status-active';
            case 'Discharged': return 'status-completed';
            case 'Cancelled': return 'status-cancelled';
            default: return '';
        }
    };

    return (
        <div className="page-container">
            {/* Header */}
            <header className="page-header">
                <button className="back-button" onClick={() => navigate('/')}>
                    ← Back to Dashboard
                </button>
                <h1>🛏️ Bed Availability</h1>
                <p>Check real-time bed availability and book for critical cases</p>
            </header>

            {/* Tabs */}
            <div className="appointments-tabs">
                <button
                    className={`tab-btn ${activeTab === 'availability' ? 'active' : ''}`}
                    onClick={() => setActiveTab('availability')}
                >
                    🏥 Ward Availability
                </button>
                <button
                    className={`tab-btn ${activeTab === 'my-bookings' ? 'active' : ''}`}
                    onClick={() => setActiveTab('my-bookings')}
                >
                    📋 My Bookings
                    {myBookings.filter(b => b.status === 'Confirmed' || b.status === 'Admitted').length > 0 && (
                        <span className="tab-badge">
                            {myBookings.filter(b => b.status === 'Confirmed' || b.status === 'Admitted').length}
                        </span>
                    )}
                </button>
            </div>

            {/* Availability Tab */}
            {activeTab === 'availability' && (
                <>
                    {loading ? (
                        <div className="loading-state">
                            <div className="loading-spinner"></div>
                            <p>Loading bed availability...</p>
                        </div>
                    ) : (
                        <>
                            {/* Ward Cards */}
                            <div className="ward-grid">
                                {availability.map((ward) => (
                                    <div
                                        key={ward.wardType}
                                        className={`ward-card ${selectedWard === ward.wardType ? 'selected' : ''}`}
                                        onClick={() => setSelectedWard(ward.wardType)}
                                    >
                                        <div className="ward-header">
                                            <span className="ward-icon">{getWardIcon(ward.wardType)}</span>
                                            <h3>{ward.wardType} Ward</h3>
                                        </div>
                                        <div className="ward-stats">
                                            <div className="stat available">
                                                <span className="stat-num">{ward.available}</span>
                                                <span className="stat-lbl">Available</span>
                                            </div>
                                            <div className="stat occupied">
                                                <span className="stat-num">{ward.booked || (ward.occupied + ward.reserved)}</span>
                                                <span className="stat-lbl">Booked</span>
                                            </div>
                                            {ward.maintenance > 0 && (
                                                <div className="stat maintenance">
                                                    <span className="stat-num">{ward.maintenance}</span>
                                                    <span className="stat-lbl">Maintenance</span>
                                                </div>
                                            )}
                                            <div className="stat total">
                                                <span className="stat-num">{ward.total}</span>
                                                <span className="stat-lbl">Total</span>
                                            </div>
                                        </div>
                                        <div className="ward-footer">
                                            <div className="occupancy-bar">
                                                <div
                                                    className="occupancy-fill"
                                                    style={{ width: `${ward.occupancyRate}%` }}
                                                ></div>
                                            </div>
                                            <span className="occupancy-rate">{Math.round(ward.occupancyRate)}% occupied</span>
                                        </div>
                                        <div className="ward-price">
                                            ₹{ward.pricePerDay?.avg || 0}/day
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Available Beds in Selected Ward */}
                            {selectedWard && (
                                <div className="beds-section">
                                    <h3>Available Beds in {selectedWard} Ward</h3>
                                    {bedsLoading ? (
                                        <div className="loading-state">Loading beds...</div>
                                    ) : availableBeds.length === 0 ? (
                                        <div className="empty-state">
                                            <span className="empty-icon">😔</span>
                                            <h4>No beds available</h4>
                                            <p>All beds in {selectedWard} Ward are currently occupied</p>
                                        </div>
                                    ) : (
                                        <div className="beds-grid">
                                            {availableBeds.map((bed) => (
                                                <div key={bed._id} className="bed-card">
                                                    <div className="bed-header">
                                                        <span className="bed-number">{bed.bedNumber}</span>
                                                        <span className="bed-floor">Floor {bed.floor}</span>
                                                    </div>
                                                    <div className="bed-features">
                                                        {bed.features?.slice(0, 3).map((f, i) => (
                                                            <span key={i} className="feature-tag">{f}</span>
                                                        ))}
                                                    </div>
                                                    <div className="bed-footer">
                                                        <span className="bed-price">₹{bed.pricePerDay}/day</span>
                                                        <button
                                                            className="book-btn"
                                                            onClick={() => handleBookBed(bed)}
                                                        >
                                                            Book Now
                                                        </button>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            )}
                        </>
                    )}
                </>
            )}

            {/* My Bookings Tab */}
            {activeTab === 'my-bookings' && (
                <div className="appointments-section">
                    {myBookings.length === 0 ? (
                        <div className="empty-state">
                            <span className="empty-icon">🛏️</span>
                            <h3>No bed bookings</h3>
                            <p>You haven't booked any beds yet</p>
                            <button
                                className="book-now-btn"
                                onClick={() => setActiveTab('availability')}
                            >
                                View Available Beds
                            </button>
                        </div>
                    ) : (
                        <div className="appointments-list">
                            {myBookings.map((booking) => (
                                <div key={booking._id} className="appointment-card">
                                    <div className="appointment-date-block">
                                        <span className="date-day">
                                            {new Date(booking.admissionDate).getDate()}
                                        </span>
                                        <span className="date-month">
                                            {new Date(booking.admissionDate).toLocaleDateString('en-IN', { month: 'short' })}
                                        </span>
                                    </div>
                                    <div className="appointment-details">
                                        <div className="appointment-header">
                                            <h3>{booking.wardType} Ward - {booking.bedNumber}</h3>
                                            <span className={`status-badge ${getStatusColor(booking.status)}`}>
                                                {booking.status}
                                            </span>
                                        </div>
                                        <p className="appointment-specialty">
                                            Floor {booking.bed?.floor} • ₹{booking.bed?.pricePerDay}/day
                                        </p>
                                        <div className="appointment-info-grid">
                                            <div className="info-item">
                                                <span className="info-icon">📅</span>
                                                <span>Admission: {new Date(booking.admissionDate).toLocaleDateString('en-IN')}</span>
                                            </div>
                                            <div className="info-item">
                                                <span className="info-icon">📆</span>
                                                <span>Discharge: {new Date(booking.expectedDischarge).toLocaleDateString('en-IN')}</span>
                                            </div>
                                            <div className="info-item">
                                                <span className="info-icon">💰</span>
                                                <span>Est. Total: ₹{booking.totalAmount}</span>
                                            </div>
                                        </div>
                                        <div className="appointment-reason">
                                            <strong>Reason:</strong> {booking.reason}
                                        </div>
                                        {booking.status === 'Confirmed' && (
                                            <button
                                                className="cancel-btn"
                                                onClick={() => handleCancelBooking(booking._id)}
                                            >
                                                ❌ Cancel Booking
                                            </button>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {/* Booking Modal */}
            {showBookingForm && selectedBed && (
                <div className="modal-overlay" onClick={() => setShowBookingForm(false)}>
                    <div className="booking-modal" onClick={e => e.stopPropagation()}>
                        <div className="modal-header">
                            <h3>🛏️ Book Bed - {selectedBed.bedNumber}</h3>
                            <button className="close-btn" onClick={() => setShowBookingForm(false)}>×</button>
                        </div>

                        <div className="bed-preview">
                            <div className="preview-info">
                                <span className="preview-ward">{selectedWard} Ward</span>
                                <span className="preview-floor">Floor {selectedBed.floor}</span>
                            </div>
                            <span className="preview-price">₹{selectedBed.pricePerDay}/day</span>
                        </div>

                        <form onSubmit={handleSubmitBooking} className="modal-form">
                            <div className="form-row">
                                <div className="form-group">
                                    <label>Admission Date *</label>
                                    <input
                                        type="date"
                                        value={formData.admissionDate}
                                        onChange={e => setFormData({ ...formData, admissionDate: e.target.value })}
                                        min={getMinDate()}
                                        required
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Expected Discharge *</label>
                                    <input
                                        type="date"
                                        value={formData.expectedDischarge}
                                        onChange={e => setFormData({ ...formData, expectedDischarge: e.target.value })}
                                        min={formData.admissionDate || getMinDate()}
                                        required
                                    />
                                </div>
                            </div>

                            <div className="form-group">
                                <label>Reason for Admission *</label>
                                <textarea
                                    value={formData.reason}
                                    onChange={e => setFormData({ ...formData, reason: e.target.value })}
                                    placeholder="Describe the medical condition or reason..."
                                    rows={3}
                                    required
                                />
                            </div>

                            <h4 className="section-title">Emergency Contact</h4>
                            <div className="form-row">
                                <div className="form-group">
                                    <label>Name</label>
                                    <input
                                        type="text"
                                        value={formData.emergencyName}
                                        onChange={e => setFormData({ ...formData, emergencyName: e.target.value })}
                                        placeholder="Contact name"
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Phone</label>
                                    <input
                                        type="tel"
                                        value={formData.emergencyPhone}
                                        onChange={e => setFormData({ ...formData, emergencyPhone: e.target.value })}
                                        placeholder="Contact phone"
                                    />
                                </div>
                            </div>
                            <div className="form-group">
                                <label>Relation</label>
                                <input
                                    type="text"
                                    value={formData.emergencyRelation}
                                    onChange={e => setFormData({ ...formData, emergencyRelation: e.target.value })}
                                    placeholder="e.g., Spouse, Parent, Sibling"
                                />
                            </div>

                            {submitStatus.message && (
                                <div className={`status-message ${submitStatus.type}`}>
                                    {submitStatus.type === 'success' ? '✅' : '⚠️'} {submitStatus.message}
                                </div>
                            )}

                            <button type="submit" className="submit-btn" disabled={submitting}>
                                {submitting ? 'Booking...' : '✅ Confirm Booking'}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default BedAvailability;

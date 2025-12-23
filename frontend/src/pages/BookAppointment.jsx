import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import api from '../utils/api';

/**
 * Appointments Page
 * View booked appointments and book new ones
 */
const BookAppointment = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const preselectedDoctorId = searchParams.get('doctor');

    // Tab state
    const [activeTab, setActiveTab] = useState(preselectedDoctorId ? 'book' : 'my-appointments');

    // My appointments state
    const [appointments, setAppointments] = useState([]);
    const [appointmentsLoading, setAppointmentsLoading] = useState(true);
    const [filterStatus, setFilterStatus] = useState('All');

    // Booking form state
    const [doctors, setDoctors] = useState([]);
    const [selectedDoctor, setSelectedDoctor] = useState(preselectedDoctorId || '');
    const [selectedDate, setSelectedDate] = useState('');
    const [availableSlots, setAvailableSlots] = useState([]);
    const [selectedSlot, setSelectedSlot] = useState('');
    const [reason, setReason] = useState('');
    const [loading, setLoading] = useState(false);
    const [slotsLoading, setSlotsLoading] = useState(false);
    const [submitStatus, setSubmitStatus] = useState({ type: '', message: '' });
    const [doctorDetails, setDoctorDetails] = useState(null);

    // Fetch appointments on load
    useEffect(() => {
        fetchAppointments();
        fetchDoctors();
    }, []);

    // Refetch when filter changes
    useEffect(() => {
        fetchAppointments();
    }, [filterStatus]);

    // Fetch doctor details when selected
    useEffect(() => {
        if (selectedDoctor) {
            fetchDoctorDetails(selectedDoctor);
        } else {
            setDoctorDetails(null);
        }
    }, [selectedDoctor]);

    // Fetch available slots when doctor and date are selected
    useEffect(() => {
        if (selectedDoctor && selectedDate) {
            fetchAvailableSlots();
        } else {
            setAvailableSlots([]);
            setSelectedSlot('');
        }
    }, [selectedDoctor, selectedDate]);

    const fetchAppointments = async () => {
        try {
            setAppointmentsLoading(true);
            const params = new URLSearchParams();
            if (filterStatus !== 'All') params.append('status', filterStatus);

            const response = await api.get(`/appointments?${params.toString()}`);
            if (response.data.success) {
                setAppointments(response.data.data);
            }
        } catch (error) {
            console.error('Error fetching appointments:', error);
        } finally {
            setAppointmentsLoading(false);
        }
    };

    const fetchDoctors = async () => {
        try {
            const response = await api.get('/doctors');
            if (response.data.success) {
                setDoctors(response.data.data);
            }
        } catch (error) {
            console.error('Error fetching doctors:', error);
        }
    };

    const fetchDoctorDetails = async (doctorId) => {
        try {
            const response = await api.get(`/doctors/${doctorId}`);
            if (response.data.success) {
                setDoctorDetails(response.data.data);
            }
        } catch (error) {
            console.error('Error fetching doctor details:', error);
        }
    };

    const fetchAvailableSlots = async () => {
        try {
            setSlotsLoading(true);
            const response = await api.get(`/appointments/slots/${selectedDoctor}/${selectedDate}`);
            if (response.data.success) {
                setAvailableSlots(response.data.data.availableSlots);
            }
        } catch (error) {
            console.error('Error fetching slots:', error);
            setAvailableSlots([]);
        } finally {
            setSlotsLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!selectedDoctor || !selectedDate || !selectedSlot || !reason.trim()) {
            setSubmitStatus({ type: 'error', message: 'Please fill in all fields' });
            return;
        }

        setLoading(true);
        setSubmitStatus({ type: '', message: '' });

        try {
            const response = await api.post('/appointments', {
                doctorId: selectedDoctor,
                date: selectedDate,
                timeSlot: selectedSlot,
                reason: reason.trim()
            });

            if (response.data.success) {
                setSubmitStatus({
                    type: 'success',
                    message: 'Appointment booked successfully!'
                });
                // Reset form and switch to appointments tab
                setSelectedDoctor('');
                setSelectedDate('');
                setSelectedSlot('');
                setReason('');
                setDoctorDetails(null);
                // Refresh appointments list
                fetchAppointments();
                // Switch to my appointments tab after 1 second
                setTimeout(() => {
                    setActiveTab('my-appointments');
                    setSubmitStatus({ type: '', message: '' });
                }, 1500);
            }
        } catch (error) {
            setSubmitStatus({
                type: 'error',
                message: error.message || 'Failed to book appointment. Please try again.'
            });
        } finally {
            setLoading(false);
        }
    };

    const handleCancelAppointment = async (appointmentId) => {
        if (!window.confirm('Are you sure you want to cancel this appointment?')) return;

        try {
            const response = await api.delete(`/appointments/${appointmentId}`);
            if (response.data.success) {
                fetchAppointments();
            }
        } catch (error) {
            console.error('Error canceling appointment:', error);
            alert('Failed to cancel appointment');
        }
    };

    // Get minimum date (today)
    const getMinDate = () => {
        const today = new Date();
        return today.toISOString().split('T')[0];
    };

    // Get maximum date (3 months from today)
    const getMaxDate = () => {
        const maxDate = new Date();
        maxDate.setMonth(maxDate.getMonth() + 3);
        return maxDate.toISOString().split('T')[0];
    };

    // Check if selected date is valid for doctor's availability
    const isDateAvailable = () => {
        if (!doctorDetails || !selectedDate) return true;
        const dayOfWeek = new Date(selectedDate).toLocaleDateString('en-US', { weekday: 'short' });
        return doctorDetails.availability.days.includes(dayOfWeek);
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-IN', {
            weekday: 'short',
            day: 'numeric',
            month: 'short',
            year: 'numeric'
        });
    };

    const getStatusClass = (status) => {
        switch (status) {
            case 'Scheduled': return 'status-scheduled';
            case 'Completed': return 'status-completed';
            case 'Cancelled': return 'status-cancelled';
            default: return '';
        }
    };

    const isUpcoming = (date) => {
        return new Date(date) >= new Date(new Date().setHours(0, 0, 0, 0));
    };

    return (
        <div className="page-container">
            {/* Header */}
            <header className="page-header">
                <button className="back-button" onClick={() => navigate('/')}>
                    ← Back to Dashboard
                </button>
                <h1>📋 Appointments</h1>
                <p>View your scheduled appointments or book a new one</p>
            </header>

            {/* Tabs */}
            <div className="appointments-tabs">
                <button
                    className={`tab-btn ${activeTab === 'my-appointments' ? 'active' : ''}`}
                    onClick={() => setActiveTab('my-appointments')}
                >
                    📅 My Appointments
                    {appointments.filter(a => a.status === 'Scheduled').length > 0 && (
                        <span className="tab-badge">
                            {appointments.filter(a => a.status === 'Scheduled').length}
                        </span>
                    )}
                </button>
                <button
                    className={`tab-btn ${activeTab === 'book' ? 'active' : ''}`}
                    onClick={() => setActiveTab('book')}
                >
                    ➕ Book New Appointment
                </button>
            </div>

            {/* My Appointments Tab */}
            {activeTab === 'my-appointments' && (
                <div className="appointments-section">
                    {/* Filter */}
                    <div className="appointments-filter">
                        <label>Filter by status:</label>
                        <select
                            value={filterStatus}
                            onChange={(e) => setFilterStatus(e.target.value)}
                        >
                            <option value="All">All Appointments</option>
                            <option value="Scheduled">Scheduled</option>
                            <option value="Completed">Completed</option>
                            <option value="Cancelled">Cancelled</option>
                        </select>
                    </div>

                    {/* Appointments List */}
                    {appointmentsLoading ? (
                        <div className="loading-state">
                            <div className="loading-spinner"></div>
                            <p>Loading your appointments...</p>
                        </div>
                    ) : appointments.length === 0 ? (
                        <div className="empty-state">
                            <span className="empty-icon">📅</span>
                            <h3>No appointments found</h3>
                            <p>Book your first appointment to get started</p>
                            <button
                                className="book-now-btn"
                                onClick={() => setActiveTab('book')}
                            >
                                ➕ Book Appointment
                            </button>
                        </div>
                    ) : (
                        <div className="appointments-list">
                            {appointments.map((appointment) => (
                                <div
                                    key={appointment._id}
                                    className={`appointment-card ${isUpcoming(appointment.date) ? 'upcoming' : 'past'}`}
                                >
                                    <div className="appointment-date-block">
                                        <span className="date-day">
                                            {new Date(appointment.date).getDate()}
                                        </span>
                                        <span className="date-month">
                                            {new Date(appointment.date).toLocaleDateString('en-IN', { month: 'short' })}
                                        </span>
                                        <span className="date-year">
                                            {new Date(appointment.date).getFullYear()}
                                        </span>
                                    </div>
                                    <div className="appointment-details">
                                        <div className="appointment-header">
                                            <h3>{appointment.doctor?.name || 'Doctor'}</h3>
                                            <span className={`status-badge ${getStatusClass(appointment.status)}`}>
                                                {appointment.status}
                                            </span>
                                        </div>
                                        <p className="appointment-specialty">
                                            {appointment.doctor?.specialization}
                                        </p>
                                        <div className="appointment-info-grid">
                                            <div className="info-item">
                                                <span className="info-icon">⏰</span>
                                                <span>{appointment.timeSlot}</span>
                                            </div>
                                            <div className="info-item">
                                                <span className="info-icon">💰</span>
                                                <span>₹{appointment.doctor?.fees}</span>
                                            </div>
                                        </div>
                                        <div className="appointment-reason">
                                            <strong>Reason:</strong> {appointment.reason}
                                        </div>
                                        {appointment.status === 'Scheduled' && isUpcoming(appointment.date) && (
                                            <button
                                                className="cancel-btn"
                                                onClick={() => handleCancelAppointment(appointment._id)}
                                            >
                                                ❌ Cancel Appointment
                                            </button>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {/* Book Appointment Tab */}
            {activeTab === 'book' && (
                <div className="booking-container">
                    {/* Booking Form */}
                    <form onSubmit={handleSubmit} className="booking-form">
                        {/* Doctor Selection */}
                        <div className="form-group">
                            <label>👨‍⚕️ Select Doctor *</label>
                            <select
                                value={selectedDoctor}
                                onChange={(e) => {
                                    setSelectedDoctor(e.target.value);
                                    setSelectedSlot('');
                                }}
                                required
                            >
                                <option value="">Choose a doctor...</option>
                                {doctors.map((doctor) => (
                                    <option key={doctor._id} value={doctor._id}>
                                        {doctor.name} - {doctor.specialization} (₹{doctor.fees})
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Doctor Details Card */}
                        {doctorDetails && (
                            <div className="doctor-preview-card">
                                <div className="preview-avatar">
                                    {doctorDetails.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                                </div>
                                <div className="preview-info">
                                    <h4>{doctorDetails.name}</h4>
                                    <p>{doctorDetails.specialization} • {doctorDetails.experience} years exp.</p>
                                    <p className="preview-available">
                                        Available: {doctorDetails.availability.days.join(', ')}
                                    </p>
                                </div>
                                <div className="preview-fees">
                                    ₹{doctorDetails.fees}
                                </div>
                            </div>
                        )}

                        {/* Date Selection */}
                        <div className="form-group">
                            <label>📅 Select Date *</label>
                            <input
                                type="date"
                                value={selectedDate}
                                onChange={(e) => {
                                    setSelectedDate(e.target.value);
                                    setSelectedSlot('');
                                }}
                                min={getMinDate()}
                                max={getMaxDate()}
                                required
                            />
                            {selectedDate && !isDateAvailable() && (
                                <span className="field-warning">
                                    ⚠️ Doctor not available on this day. Available: {doctorDetails?.availability.days.join(', ')}
                                </span>
                            )}
                        </div>

                        {/* Time Slot Selection */}
                        <div className="form-group">
                            <label>⏰ Select Time Slot *</label>
                            {slotsLoading ? (
                                <div className="slots-loading">Loading available slots...</div>
                            ) : availableSlots.length === 0 ? (
                                <div className="no-slots">
                                    {selectedDoctor && selectedDate
                                        ? 'No slots available for this date'
                                        : 'Select doctor and date to see available slots'}
                                </div>
                            ) : (
                                <div className="slots-grid">
                                    {availableSlots.map((slot) => (
                                        <button
                                            key={slot}
                                            type="button"
                                            className={`slot-btn ${selectedSlot === slot ? 'selected' : ''}`}
                                            onClick={() => setSelectedSlot(slot)}
                                        >
                                            {slot}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Reason */}
                        <div className="form-group">
                            <label>📝 Reason for Visit *</label>
                            <textarea
                                value={reason}
                                onChange={(e) => setReason(e.target.value)}
                                placeholder="Briefly describe your symptoms or reason for visit..."
                                rows={4}
                                maxLength={500}
                                required
                            />
                            <span className="char-count">{reason.length}/500</span>
                        </div>

                        {/* Status Message */}
                        {submitStatus.message && (
                            <div className={`status-message ${submitStatus.type}`}>
                                {submitStatus.type === 'success' ? '✅' : '⚠️'} {submitStatus.message}
                            </div>
                        )}

                        {/* Submit Button */}
                        <button
                            type="submit"
                            className="submit-btn"
                            disabled={loading || !selectedSlot}
                        >
                            {loading ? (
                                <>
                                    <span className="button-spinner"></span>
                                    Booking...
                                </>
                            ) : (
                                '📅 Confirm Appointment'
                            )}
                        </button>
                    </form>

                    {/* Appointment Summary */}
                    {selectedDoctor && selectedDate && selectedSlot && (
                        <div className="booking-summary">
                            <h3>📋 Appointment Summary</h3>
                            <div className="summary-item">
                                <span className="summary-label">Doctor:</span>
                                <span className="summary-value">{doctorDetails?.name}</span>
                            </div>
                            <div className="summary-item">
                                <span className="summary-label">Specialization:</span>
                                <span className="summary-value">{doctorDetails?.specialization}</span>
                            </div>
                            <div className="summary-item">
                                <span className="summary-label">Experience:</span>
                                <span className="summary-value">{doctorDetails?.experience} years</span>
                            </div>
                            <div className="summary-item">
                                <span className="summary-label">Date:</span>
                                <span className="summary-value">
                                    {new Date(selectedDate + 'T00:00:00').toLocaleDateString('en-IN', {
                                        weekday: 'long',
                                        year: 'numeric',
                                        month: 'long',
                                        day: 'numeric'
                                    })}
                                </span>
                            </div>
                            <div className="summary-item">
                                <span className="summary-label">Time:</span>
                                <span className="summary-value">{selectedSlot}</span>
                            </div>
                            <div className="summary-item total">
                                <span className="summary-label">Consultation Fee:</span>
                                <span className="summary-value">₹{doctorDetails?.fees}</span>
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default BookAppointment;

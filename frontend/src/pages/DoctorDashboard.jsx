import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDoctorAuth } from '../context/DoctorAuthContext';
import api from '../utils/api';
import DoctorProfileModal from '../components/DoctorProfileModal';

/**
 * Doctor Dashboard Component
 * Main interface for doctors to manage appointments and prescriptions
 */
const DoctorDashboard = () => {
    const navigate = useNavigate();
    const { doctor, logout, token, loading: authLoading } = useDoctorAuth();
    const [isProfileOpen, setIsProfileOpen] = useState(false);

    // Tab state
    const [activeTab, setActiveTab] = useState('pending');

    // Appointments state
    const [appointments, setAppointments] = useState([]);
    const [stats, setStats] = useState({
        pending: 0,
        confirmed: 0,
        completed: 0,
        rejected: 0,
        today: 0,
        total: 0
    });
    const [loading, setLoading] = useState(true);

    // Action states
    const [actionLoading, setActionLoading] = useState(null);
    const [actionMessage, setActionMessage] = useState({ type: '', message: '' });

    // Consultation modal state
    const [selectedAppointment, setSelectedAppointment] = useState(null);
    const [isConsultationOpen, setIsConsultationOpen] = useState(false);
    const [prescription, setPrescription] = useState({
        diagnosis: '',
        notes: '',
        medications: [{ name: '', dosage: '', duration: '', instructions: '' }]
    });

    // Rejection modal state
    const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
    const [rejectionReason, setRejectionReason] = useState('');
    const [appointmentToReject, setAppointmentToReject] = useState(null);

    // Fetch appointments and stats
    useEffect(() => {
        if (token) {
            fetchAppointments();
            fetchStats();
        }
    }, [token, activeTab]);

    // Auto-refresh every 10 seconds for real-time updates
    useEffect(() => {
        if (!token) return;

        const interval = setInterval(() => {
            fetchAppointments(true); // silent refresh
            fetchStats();
        }, 10000); // 10 seconds

        return () => clearInterval(interval);
    }, [token, activeTab]);

    const fetchAppointments = async (silent = false) => {
        try {
            if (!silent) setLoading(true);
            let statusFilter = '';
            switch (activeTab) {
                case 'pending':
                    statusFilter = 'Pending';
                    break;
                case 'confirmed':
                    statusFilter = 'Confirmed';
                    break;
                case 'completed':
                    statusFilter = 'Completed';
                    break;
                case 'all':
                default:
                    statusFilter = '';
            }

            const response = await api.get(`/doctor/appointments${statusFilter ? `?status=${statusFilter}` : ''}`);

            if (response.data.success) {
                setAppointments(response.data.data);
            }
        } catch (error) {
            console.error('Error fetching appointments:', error);
        } finally {
            if (!silent) setLoading(false);
        }
    };

    const fetchStats = async () => {
        try {
            const response = await api.get('/doctor/appointments/stats');

            if (response.data.success) {
                setStats(response.data.data);
            }
        } catch (error) {
            console.error('Error fetching stats:', error);
        }
    };

    const handleAccept = async (appointmentId) => {
        try {
            setActionLoading(appointmentId);
            const response = await api.put(
                `/doctor/appointments/${appointmentId}/status`,
                { status: 'Confirmed' }
            );

            if (response.data.success) {
                setActionMessage({ type: 'success', message: 'Appointment confirmed!' });
                fetchAppointments();
                fetchStats();
            }
        } catch (error) {
            setActionMessage({ type: 'error', message: error.message || 'Failed to confirm appointment' });
        } finally {
            setActionLoading(null);
            setTimeout(() => setActionMessage({ type: '', message: '' }), 3000);
        }
    };

    const openRejectModal = (appointment) => {
        setAppointmentToReject(appointment);
        setRejectionReason('');
        setIsRejectModalOpen(true);
    };

    const handleReject = async () => {
        if (!rejectionReason.trim()) {
            setActionMessage({ type: 'error', message: 'Please provide a reason for rejection' });
            return;
        }

        try {
            setActionLoading(appointmentToReject._id);
            const response = await api.put(
                `/doctor/appointments/${appointmentToReject._id}/status`,
                { status: 'Rejected', rejectionReason: rejectionReason.trim() }
            );

            if (response.data.success) {
                setActionMessage({ type: 'success', message: 'Appointment rejected' });
                setIsRejectModalOpen(false);
                setAppointmentToReject(null);
                fetchAppointments();
                fetchStats();
            }
        } catch (error) {
            setActionMessage({ type: 'error', message: error.message || 'Failed to reject appointment' });
        } finally {
            setActionLoading(null);
            setTimeout(() => setActionMessage({ type: '', message: '' }), 3000);
        }
    };

    const openConsultation = (appointment) => {
        setSelectedAppointment(appointment);
        setPrescription({
            diagnosis: '',
            notes: '',
            medications: [{ name: '', dosage: '', duration: '', instructions: '' }]
        });
        setIsConsultationOpen(true);
    };

    const addMedication = () => {
        setPrescription(prev => ({
            ...prev,
            medications: [...prev.medications, { name: '', dosage: '', duration: '', instructions: '' }]
        }));
    };

    const removeMedication = (index) => {
        setPrescription(prev => ({
            ...prev,
            medications: prev.medications.filter((_, i) => i !== index)
        }));
    };

    const updateMedication = (index, field, value) => {
        setPrescription(prev => ({
            ...prev,
            medications: prev.medications.map((med, i) =>
                i === index ? { ...med, [field]: value } : med
            )
        }));
    };

    const handleCompleteAppointment = async () => {
        // Validate prescription
        if (!prescription.diagnosis.trim()) {
            setActionMessage({ type: 'error', message: 'Please provide a diagnosis' });
            return;
        }

        const validMedications = prescription.medications.filter(m => m.name.trim());
        if (validMedications.length === 0) {
            setActionMessage({ type: 'error', message: 'Please add at least one medication' });
            return;
        }

        try {
            setActionLoading(selectedAppointment._id);
            const response = await api.put(
                `/doctor/appointments/${selectedAppointment._id}/complete`,
                {
                    prescription: {
                        ...prescription,
                        medications: validMedications
                    }
                }
            );

            if (response.data.success) {
                setActionMessage({ type: 'success', message: 'Appointment completed and prescription issued!' });
                setIsConsultationOpen(false);
                setSelectedAppointment(null);
                fetchAppointments();
                fetchStats();
            }
        } catch (error) {
            setActionMessage({ type: 'error', message: error.message || 'Failed to complete appointment' });
        } finally {
            setActionLoading(null);
            setTimeout(() => setActionMessage({ type: '', message: '' }), 3000);
        }
    };

    const handleLogout = () => {
        logout();
        navigate('/login');
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
            case 'Pending': return 'status-pending';
            case 'Confirmed': return 'status-confirmed';
            case 'Completed': return 'status-completed';
            case 'Rejected': return 'status-rejected';
            case 'Cancelled': return 'status-cancelled';
            default: return '';
        }
    };

    if (authLoading) {
        return (
            <div className="loading-container">
                <div className="loading-spinner"></div>
                <p>Loading...</p>
            </div>
        );
    }

    return (
        <div className="home-container">
            {/* Header - Same style as patient */}
            <header className="home-header">
                <div className="header-content">
                    <div className="logo">
                        <span className="logo-icon">🏥</span>
                        <h1>MediCare</h1>
                        <span className="doctor-badge">Doctor Portal</span>
                    </div>
                    <nav className="header-nav">
                        <span className="user-greeting">
                            Welcome, <strong>Dr. {doctor?.name?.replace(/^Dr\.\s*/i, '') || 'Doctor'}</strong>
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
                        <h2>Doctor Dashboard</h2>
                        <p>Manage your appointments and patient consultations</p>
                    </section>

                    {/* Stats Cards */}
                    <section className="doctor-stats">
                        <div className="stats-grid">
                            <div className="stat-card stat-pending" onClick={() => setActiveTab('pending')}>
                                <span className="stat-icon">⏳</span>
                                <div className="stat-info">
                                    <span className="stat-number">{stats.pending}</span>
                                    <span className="stat-label">Pending</span>
                                </div>
                            </div>
                            <div className="stat-card stat-confirmed" onClick={() => setActiveTab('confirmed')}>
                                <span className="stat-icon">✅</span>
                                <div className="stat-info">
                                    <span className="stat-number">{stats.confirmed}</span>
                                    <span className="stat-label">Confirmed</span>
                                </div>
                            </div>
                            <div className="stat-card stat-completed" onClick={() => setActiveTab('completed')}>
                                <span className="stat-icon">📋</span>
                                <div className="stat-info">
                                    <span className="stat-number">{stats.completed}</span>
                                    <span className="stat-label">Completed</span>
                                </div>
                            </div>
                            <div className="stat-card stat-today">
                                <span className="stat-icon">📅</span>
                                <div className="stat-info">
                                    <span className="stat-number">{stats.today}</span>
                                    <span className="stat-label">Today</span>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* Action Message */}
                    {actionMessage.message && (
                        <div className={`action-message ${actionMessage.type}`}>
                            {actionMessage.type === 'success' ? '✅' : '⚠️'} {actionMessage.message}
                        </div>
                    )}

                    {/* Tabs */}
                    <div className="appointments-tabs">
                        <button
                            className={`tab-btn ${activeTab === 'pending' ? 'active' : ''}`}
                            onClick={() => setActiveTab('pending')}
                        >
                            ⏳ Pending Requests
                            {stats.pending > 0 && <span className="tab-badge">{stats.pending}</span>}
                        </button>
                        <button
                            className={`tab-btn ${activeTab === 'confirmed' ? 'active' : ''}`}
                            onClick={() => setActiveTab('confirmed')}
                        >
                            ✅ My Schedule
                        </button>
                        <button
                            className={`tab-btn ${activeTab === 'completed' ? 'active' : ''}`}
                            onClick={() => setActiveTab('completed')}
                        >
                            📋 Completed
                        </button>
                        <button
                            className={`tab-btn ${activeTab === 'all' ? 'active' : ''}`}
                            onClick={() => setActiveTab('all')}
                        >
                            📊 All Appointments
                        </button>
                    </div>

                    {/* Appointments List */}
                    <section className="appointments-section">
                        {loading ? (
                            <div className="loading-state">
                                <div className="loading-spinner"></div>
                                <p>Loading appointments...</p>
                            </div>
                        ) : appointments.length === 0 ? (
                            <div className="empty-state">
                                <span className="empty-icon">📅</span>
                                <h3>No {activeTab} appointments</h3>
                                <p>
                                    {activeTab === 'pending'
                                        ? 'No pending appointment requests at the moment'
                                        : `No ${activeTab} appointments found`}
                                </p>
                            </div>
                        ) : (
                            <div className="appointments-list">
                                {appointments.map((appointment) => (
                                    <div key={appointment._id} className="appointment-card doctor-view">
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
                                                <h3>{appointment.patient?.name || 'Patient'}</h3>
                                                <span className={`status-badge ${getStatusClass(appointment.status)}`}>
                                                    {appointment.status}
                                                </span>
                                            </div>
                                            <p className="patient-contact">
                                                📧 {appointment.patient?.email}
                                                {appointment.patient?.mobile && ` • 📱 ${appointment.patient.mobile}`}
                                            </p>
                                            <div className="appointment-info-grid">
                                                <div className="info-item">
                                                    <span className="info-icon">⏰</span>
                                                    <span>{appointment.timeSlot}</span>
                                                </div>
                                                <div className="info-item">
                                                    <span className="info-icon">📅</span>
                                                    <span>{formatDate(appointment.date)}</span>
                                                </div>
                                            </div>
                                            <div className="appointment-reason">
                                                <strong>Reason:</strong> {appointment.reason}
                                            </div>

                                            {/* Action Buttons based on status */}
                                            {appointment.status === 'Pending' && (
                                                <div className="appointment-actions">
                                                    <button
                                                        className="action-btn accept-btn"
                                                        onClick={() => handleAccept(appointment._id)}
                                                        disabled={actionLoading === appointment._id}
                                                    >
                                                        {actionLoading === appointment._id ? (
                                                            <span className="button-spinner"></span>
                                                        ) : (
                                                            '✅ Accept'
                                                        )}
                                                    </button>
                                                    <button
                                                        className="action-btn reject-btn"
                                                        onClick={() => openRejectModal(appointment)}
                                                        disabled={actionLoading === appointment._id}
                                                    >
                                                        ❌ Reject
                                                    </button>
                                                </div>
                                            )}

                                            {appointment.status === 'Confirmed' && (
                                                <div className="appointment-actions">
                                                    <button
                                                        className="action-btn consult-btn"
                                                        onClick={() => openConsultation(appointment)}
                                                    >
                                                        🩺 Start Consultation
                                                    </button>
                                                </div>
                                            )}

                                            {appointment.status === 'Completed' && appointment.prescription && (
                                                <div className="prescription-summary">
                                                    <strong>📋 Diagnosis:</strong> {appointment.prescription.diagnosis}
                                                    <br />
                                                    <strong>💊 Medications:</strong> {appointment.prescription.medications?.length || 0} prescribed
                                                </div>
                                            )}

                                            {appointment.status === 'Rejected' && appointment.rejectionReason && (
                                                <div className="rejection-reason">
                                                    <strong>Reason:</strong> {appointment.rejectionReason}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </section>
                </div>
            </main>

            {/* Footer */}
            <footer className="home-footer">
                <p>© 2024 MediCare Hospital Management System - Doctor Portal</p>
            </footer>

            {/* Rejection Modal */}
            {isRejectModalOpen && (
                <div className="modal-overlay" onClick={() => setIsRejectModalOpen(false)}>
                    <div className="modal-content" onClick={e => e.stopPropagation()}>
                        <div className="modal-header">
                            <h3>Reject Appointment</h3>
                            <button className="modal-close" onClick={() => setIsRejectModalOpen(false)}>×</button>
                        </div>
                        <div className="modal-body">
                            <p>Please provide a reason for rejecting this appointment:</p>
                            <div className="form-group">
                                <label>Patient: {appointmentToReject?.patient?.name}</label>
                                <label>Date: {appointmentToReject && formatDate(appointmentToReject.date)} at {appointmentToReject?.timeSlot}</label>
                            </div>
                            <div className="form-group">
                                <label>Rejection Reason *</label>
                                <textarea
                                    value={rejectionReason}
                                    onChange={(e) => setRejectionReason(e.target.value)}
                                    placeholder="e.g., Schedule conflict, Not available on this date, etc."
                                    rows={3}
                                    required
                                />
                            </div>
                        </div>
                        <div className="modal-footer">
                            <button className="btn-secondary" onClick={() => setIsRejectModalOpen(false)}>
                                Cancel
                            </button>
                            <button
                                className="btn-danger"
                                onClick={handleReject}
                                disabled={actionLoading || !rejectionReason.trim()}
                            >
                                {actionLoading ? 'Rejecting...' : 'Reject Appointment'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Consultation Modal */}
            {isConsultationOpen && selectedAppointment && (
                <div className="modal-overlay" onClick={() => setIsConsultationOpen(false)}>
                    <div className="modal-content consultation-modal" onClick={e => e.stopPropagation()}>
                        <div className="modal-header">
                            <h3>🩺 Consultation - {selectedAppointment.patient?.name}</h3>
                            <button className="modal-close" onClick={() => setIsConsultationOpen(false)}>×</button>
                        </div>
                        <div className="modal-body">
                            {/* Patient Info */}
                            <div className="consultation-info">
                                <div className="info-row">
                                    <span><strong>📅 Date:</strong> {formatDate(selectedAppointment.date)}</span>
                                    <span><strong>⏰ Time:</strong> {selectedAppointment.timeSlot}</span>
                                </div>
                                <div className="info-row">
                                    <span><strong>📝 Reason:</strong> {selectedAppointment.reason}</span>
                                </div>
                            </div>

                            {/* Prescription Form */}
                            <div className="prescription-form">
                                <div className="form-group">
                                    <label>Diagnosis *</label>
                                    <input
                                        type="text"
                                        value={prescription.diagnosis}
                                        onChange={(e) => setPrescription(prev => ({ ...prev, diagnosis: e.target.value }))}
                                        placeholder="Enter diagnosis"
                                    />
                                </div>

                                <div className="medications-section">
                                    <label>Medications *</label>
                                    {prescription.medications.map((med, index) => (
                                        <div key={index} className="medication-row">
                                            <input
                                                type="text"
                                                placeholder="Medicine name"
                                                value={med.name}
                                                onChange={(e) => updateMedication(index, 'name', e.target.value)}
                                            />
                                            <input
                                                type="text"
                                                placeholder="Dosage (e.g., 1-0-1)"
                                                value={med.dosage}
                                                onChange={(e) => updateMedication(index, 'dosage', e.target.value)}
                                            />
                                            <input
                                                type="text"
                                                placeholder="Duration"
                                                value={med.duration}
                                                onChange={(e) => updateMedication(index, 'duration', e.target.value)}
                                            />
                                            <input
                                                type="text"
                                                placeholder="Instructions"
                                                value={med.instructions}
                                                onChange={(e) => updateMedication(index, 'instructions', e.target.value)}
                                            />
                                            {prescription.medications.length > 1 && (
                                                <button
                                                    type="button"
                                                    className="remove-med-btn"
                                                    onClick={() => removeMedication(index)}
                                                >
                                                    ❌
                                                </button>
                                            )}
                                        </div>
                                    ))}
                                    <button type="button" className="add-med-btn" onClick={addMedication}>
                                        ➕ Add Medication
                                    </button>
                                </div>

                                <div className="form-group">
                                    <label>Additional Notes</label>
                                    <textarea
                                        value={prescription.notes}
                                        onChange={(e) => setPrescription(prev => ({ ...prev, notes: e.target.value }))}
                                        placeholder="Any additional notes or instructions for the patient"
                                        rows={3}
                                    />
                                </div>
                            </div>
                        </div>
                        <div className="modal-footer">
                            <button className="btn-secondary" onClick={() => setIsConsultationOpen(false)}>
                                Cancel
                            </button>
                            <button
                                className="btn-primary"
                                onClick={handleCompleteAppointment}
                                disabled={actionLoading === selectedAppointment._id}
                            >
                                {actionLoading === selectedAppointment._id ? (
                                    <>
                                        <span className="button-spinner"></span>
                                        Processing...
                                    </>
                                ) : (
                                    '✅ Complete & Issue Prescription'
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Profile Modal */}
            <DoctorProfileModal
                isOpen={isProfileOpen}
                onClose={() => setIsProfileOpen(false)}
            />
        </div>
    );
};

export default DoctorDashboard;

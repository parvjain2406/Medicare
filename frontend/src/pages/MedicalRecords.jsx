import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';

/**
 * Medical Records Page
 * Shows patient's visit history and medical records
 */
const MedicalRecords = () => {
    const navigate = useNavigate();
    const [records, setRecords] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedStatus, setSelectedStatus] = useState('All');
    const [selectedVisitType, setSelectedVisitType] = useState('All');
    const [expandedRecord, setExpandedRecord] = useState(null);

    const visitTypes = ['All', 'Consultation', 'Follow-up', 'Lab Test', 'Surgery', 'Emergency', 'Routine Checkup'];
    const statuses = ['All', 'Completed', 'Cancelled', 'Pending'];

    useEffect(() => {
        fetchRecords();
    }, [selectedStatus, selectedVisitType]);

    const fetchRecords = async () => {
        try {
            setLoading(true);
            const params = new URLSearchParams();
            if (selectedStatus !== 'All') params.append('status', selectedStatus);
            if (selectedVisitType !== 'All') params.append('visitType', selectedVisitType);

            const response = await api.get(`/records?${params.toString()}`);
            if (response.data.success) {
                setRecords(response.data.data);
            }
        } catch (error) {
            console.error('Error fetching records:', error);
        } finally {
            setLoading(false);
        }
    };

    const getStatusClass = (status) => {
        switch (status) {
            case 'Completed': return 'status-completed';
            case 'Cancelled': return 'status-cancelled';
            case 'Pending': return 'status-pending';
            default: return '';
        }
    };

    const getVisitTypeIcon = (type) => {
        switch (type) {
            case 'Consultation': return '🩺';
            case 'Follow-up': return '🔄';
            case 'Lab Test': return '🧪';
            case 'Surgery': return '🏥';
            case 'Emergency': return '🚨';
            case 'Routine Checkup': return '✅';
            default: return '📋';
        }
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-IN', {
            day: 'numeric',
            month: 'short',
            year: 'numeric'
        });
    };

    return (
        <div className="page-container">
            {/* Header */}
            <header className="page-header">
                <button className="back-button" onClick={() => navigate('/')}>
                    ← Back to Dashboard
                </button>
                <h1>📊 Medical Records</h1>
                <p>View your complete health history and past visits</p>
            </header>

            {/* Filters */}
            <div className="filters-container">
                <div className="filter-select">
                    <label>Visit Type:</label>
                    <select
                        value={selectedVisitType}
                        onChange={(e) => setSelectedVisitType(e.target.value)}
                    >
                        {visitTypes.map((type) => (
                            <option key={type} value={type}>{type}</option>
                        ))}
                    </select>
                </div>
                <div className="filter-select">
                    <label>Status:</label>
                    <select
                        value={selectedStatus}
                        onChange={(e) => setSelectedStatus(e.target.value)}
                    >
                        {statuses.map((status) => (
                            <option key={status} value={status}>{status}</option>
                        ))}
                    </select>
                </div>
            </div>

            {/* Results Info */}
            <div className="results-info">
                {loading ? 'Loading...' : `${records.length} record${records.length !== 1 ? 's' : ''} found`}
            </div>

            {/* Records List */}
            {loading ? (
                <div className="loading-state">
                    <div className="loading-spinner"></div>
                    <p>Loading your medical records...</p>
                </div>
            ) : records.length === 0 ? (
                <div className="empty-state">
                    <span className="empty-icon">📋</span>
                    <h3>No records found</h3>
                    <p>Your medical records will appear here after your visits</p>
                </div>
            ) : (
                <div className="records-list">
                    {records.map((record) => (
                        <div
                            key={record._id}
                            className={`record-card ${expandedRecord === record._id ? 'expanded' : ''}`}
                        >
                            <div
                                className="record-header"
                                onClick={() => setExpandedRecord(
                                    expandedRecord === record._id ? null : record._id
                                )}
                            >
                                <div className="record-main">
                                    <span className="record-icon">{getVisitTypeIcon(record.visitType)}</span>
                                    <div className="record-title">
                                        <h3>{record.diagnosis}</h3>
                                        <p className="record-doctor">
                                            {record.doctor?.name} • {record.doctor?.specialization}
                                        </p>
                                    </div>
                                </div>
                                <div className="record-meta">
                                    <span className={`status-badge ${getStatusClass(record.status)}`}>
                                        {record.status}
                                    </span>
                                    <span className="record-date">{formatDate(record.date)}</span>
                                    <span className="expand-icon">
                                        {expandedRecord === record._id ? '▲' : '▼'}
                                    </span>
                                </div>
                            </div>

                            {/* Expanded Details */}
                            {expandedRecord === record._id && (
                                <div className="record-details">
                                    <div className="detail-grid">
                                        <div className="detail-item">
                                            <span className="detail-label">Visit Type</span>
                                            <span className="detail-value">{record.visitType}</span>
                                        </div>
                                        <div className="detail-item">
                                            <span className="detail-label">Hospital</span>
                                            <span className="detail-value">{record.doctor?.hospital || 'N/A'}</span>
                                        </div>
                                        {record.vitals && (
                                            <>
                                                {record.vitals.bloodPressure && (
                                                    <div className="detail-item">
                                                        <span className="detail-label">Blood Pressure</span>
                                                        <span className="detail-value">{record.vitals.bloodPressure}</span>
                                                    </div>
                                                )}
                                                {record.vitals.temperature && (
                                                    <div className="detail-item">
                                                        <span className="detail-label">Temperature</span>
                                                        <span className="detail-value">{record.vitals.temperature}</span>
                                                    </div>
                                                )}
                                                {record.vitals.pulse && (
                                                    <div className="detail-item">
                                                        <span className="detail-label">Pulse</span>
                                                        <span className="detail-value">{record.vitals.pulse}</span>
                                                    </div>
                                                )}
                                                {record.vitals.weight && (
                                                    <div className="detail-item">
                                                        <span className="detail-label">Weight</span>
                                                        <span className="detail-value">{record.vitals.weight}</span>
                                                    </div>
                                                )}
                                            </>
                                        )}
                                    </div>
                                    {record.symptoms && record.symptoms.length > 0 && (
                                        <div className="symptoms-section">
                                            <span className="detail-label">Symptoms</span>
                                            <div className="symptoms-tags">
                                                {record.symptoms.map((symptom, idx) => (
                                                    <span key={idx} className="symptom-tag">{symptom}</span>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                    {record.notes && (
                                        <div className="notes-section">
                                            <span className="detail-label">Doctor's Notes</span>
                                            <p className="notes-text">{record.notes}</p>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default MedicalRecords;

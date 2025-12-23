import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';

/**
 * Prescriptions Page
 * View medicines prescribed by doctors
 */
const Prescriptions = () => {
    const navigate = useNavigate();
    const [prescriptions, setPrescriptions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filterActive, setFilterActive] = useState('all');
    const [expandedPrescription, setExpandedPrescription] = useState(null);

    useEffect(() => {
        fetchPrescriptions();
    }, [filterActive]);

    const fetchPrescriptions = async () => {
        try {
            setLoading(true);
            const params = new URLSearchParams();
            if (filterActive === 'active') params.append('isActive', 'true');
            if (filterActive === 'past') params.append('isActive', 'false');

            const response = await api.get(`/prescriptions?${params.toString()}`);
            if (response.data.success) {
                setPrescriptions(response.data.data);
            }
        } catch (error) {
            console.error('Error fetching prescriptions:', error);
        } finally {
            setLoading(false);
        }
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-IN', {
            day: 'numeric',
            month: 'short',
            year: 'numeric'
        });
    };

    const isExpired = (validUntil) => {
        if (!validUntil) return false;
        return new Date(validUntil) < new Date();
    };

    // Check if prescription is still active based on validUntil date
    const isPrescriptionActive = (prescription) => {
        if (!prescription.validUntil) return prescription.isActive;
        return new Date(prescription.validUntil) >= new Date();
    };

    return (
        <div className="page-container">
            {/* Header */}
            <header className="page-header">
                <button className="back-button" onClick={() => navigate('/')}>
                    ← Back to Dashboard
                </button>
                <h1>💊 Prescriptions</h1>
                <p>View your prescribed medicines and dosage instructions</p>
            </header>

            {/* Filter Tabs */}
            <div className="filter-tabs">
                <button
                    className={`filter-tab ${filterActive === 'all' ? 'active' : ''}`}
                    onClick={() => setFilterActive('all')}
                >
                    All Prescriptions
                </button>
                <button
                    className={`filter-tab ${filterActive === 'active' ? 'active' : ''}`}
                    onClick={() => setFilterActive('active')}
                >
                    🟢 Active
                </button>
                <button
                    className={`filter-tab ${filterActive === 'past' ? 'active' : ''}`}
                    onClick={() => setFilterActive('past')}
                >
                    📁 Past
                </button>
            </div>

            {/* Results Info */}
            <div className="results-info">
                {loading ? 'Loading...' : `${prescriptions.length} prescription${prescriptions.length !== 1 ? 's' : ''} found`}
            </div>

            {/* Prescriptions List */}
            {loading ? (
                <div className="loading-state">
                    <div className="loading-spinner"></div>
                    <p>Loading your prescriptions...</p>
                </div>
            ) : prescriptions.length === 0 ? (
                <div className="empty-state">
                    <span className="empty-icon">💊</span>
                    <h3>No prescriptions found</h3>
                    <p>Your prescriptions will appear here after your doctor visits</p>
                </div>
            ) : (
                <div className="prescriptions-list">
                    {prescriptions.map((prescription) => (
                        <div
                            key={prescription._id}
                            className={`prescription-card ${expandedPrescription === prescription._id ? 'expanded' : ''} ${isPrescriptionActive(prescription) ? 'active' : 'past'}`}
                        >
                            {/* Prescription Header */}
                            <div
                                className="prescription-header"
                                onClick={() => setExpandedPrescription(
                                    expandedPrescription === prescription._id ? null : prescription._id
                                )}
                            >
                                <div className="prescription-main">
                                    <div className="prescription-status-icon">
                                        {isPrescriptionActive(prescription) ? '🟢' : '⚪'}
                                    </div>
                                    <div className="prescription-title">
                                        <h3>{prescription.diagnosis || 'Prescription'}</h3>
                                        <p className="prescription-doctor">
                                            {prescription.doctor?.name} • {prescription.doctor?.specialization}
                                        </p>
                                    </div>
                                </div>
                                <div className="prescription-meta">
                                    <span className={`status-badge ${isPrescriptionActive(prescription) ? 'status-active' : 'status-past'}`}>
                                        {isPrescriptionActive(prescription) ? 'Active' : 'Expired'}
                                    </span>
                                    <span className="prescription-date">{formatDate(prescription.date)}</span>
                                    <span className="expand-icon">
                                        {expandedPrescription === prescription._id ? '▲' : '▼'}
                                    </span>
                                </div>
                            </div>

                            {/* Medicines Summary */}
                            <div className="medicines-summary">
                                {prescription.medicines.slice(0, 3).map((med, idx) => (
                                    <span key={idx} className="medicine-chip">{med.name}</span>
                                ))}
                                {prescription.medicines.length > 3 && (
                                    <span className="medicine-chip more">
                                        +{prescription.medicines.length - 3} more
                                    </span>
                                )}
                            </div>

                            {/* Expanded Details */}
                            {expandedPrescription === prescription._id && (
                                <div className="prescription-details">
                                    {/* Medicines Table */}
                                    <div className="medicines-table-container">
                                        <table className="medicines-table">
                                            <thead>
                                                <tr>
                                                    <th>Medicine Name</th>
                                                    <th>Dosage</th>
                                                    <th>Duration</th>
                                                    <th>Instructions</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {prescription.medicines.map((medicine, idx) => (
                                                    <tr key={idx}>
                                                        <td>
                                                            <div className="medicine-name">
                                                                <strong>{medicine.name}</strong>
                                                                {medicine.genericName && (
                                                                    <span className="generic-name">({medicine.genericName})</span>
                                                                )}
                                                            </div>
                                                        </td>
                                                        <td>
                                                            <span className="dosage-badge">{medicine.dosage}</span>
                                                        </td>
                                                        <td>{medicine.duration}</td>
                                                        <td className="instructions-cell">
                                                            {medicine.instructions || '-'}
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>

                                    {/* Additional Info */}
                                    <div className="prescription-footer">
                                        {prescription.validUntil && (
                                            <div className="footer-info">
                                                <span className="info-label">Valid Until:</span>
                                                <span className={`info-value ${isExpired(prescription.validUntil) ? 'expired' : ''}`}>
                                                    {formatDate(prescription.validUntil)}
                                                    {isExpired(prescription.validUntil) && ' (Expired)'}
                                                </span>
                                            </div>
                                        )}
                                        {prescription.notes && (
                                            <div className="footer-notes">
                                                <span className="info-label">Doctor's Notes:</span>
                                                <p>{prescription.notes}</p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default Prescriptions;

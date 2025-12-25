import { useState } from 'react';
import { useDoctorAuth } from '../context/DoctorAuthContext';

/**
 * Doctor Profile Modal Component
 * Allows doctors to view and edit their profile
 */
const DoctorProfileModal = ({ isOpen, onClose }) => {
    const { doctor, updateProfile, changePassword, loading } = useDoctorAuth();

    // View mode state
    const [isEditing, setIsEditing] = useState(false);
    const [isChangingPassword, setIsChangingPassword] = useState(false);

    // Form state
    const [formData, setFormData] = useState({
        mobile: doctor?.mobile || '',
        about: doctor?.about || '',
        fees: doctor?.fees || 0
    });

    // Password state
    const [passwordData, setPasswordData] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    });

    // Messages
    const [message, setMessage] = useState({ type: '', text: '' });

    // Reset form when modal opens
    const handleOpen = () => {
        setFormData({
            mobile: doctor?.mobile || '',
            about: doctor?.about || '',
            fees: doctor?.fees || 0
        });
        setIsEditing(false);
        setIsChangingPassword(false);
        setMessage({ type: '', text: '' });
    };

    const handleSaveProfile = async () => {
        setMessage({ type: '', text: '' });

        const result = await updateProfile(formData);

        if (result.success) {
            setMessage({ type: 'success', text: 'Profile updated successfully!' });
            setIsEditing(false);
        } else {
            setMessage({ type: 'error', text: result.message });
        }
    };

    const handleChangePassword = async () => {
        setMessage({ type: '', text: '' });

        // Validate passwords
        if (passwordData.newPassword !== passwordData.confirmPassword) {
            setMessage({ type: 'error', text: 'New passwords do not match' });
            return;
        }

        if (passwordData.newPassword.length < 6) {
            setMessage({ type: 'error', text: 'Password must be at least 6 characters' });
            return;
        }

        const result = await changePassword({
            currentPassword: passwordData.currentPassword,
            newPassword: passwordData.newPassword
        });

        if (result.success) {
            setMessage({ type: 'success', text: 'Password changed successfully!' });
            setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
            setIsChangingPassword(false);
        } else {
            setMessage({ type: 'error', text: result.message });
        }
    };

    if (!isOpen) return null;

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content profile-modal" onClick={e => e.stopPropagation()}>
                <div className="modal-header">
                    <h3>👨‍⚕️ Doctor Profile</h3>
                    <button className="modal-close" onClick={onClose}>×</button>
                </div>

                <div className="modal-body">
                    {/* Message */}
                    {message.text && (
                        <div className={`message ${message.type}`}>
                            {message.type === 'success' ? '✅' : '⚠️'} {message.text}
                        </div>
                    )}

                    {/* Profile View / Edit Mode */}
                    {!isChangingPassword ? (
                        <>
                            {/* Profile Info */}
                            <div className="profile-section">
                                <div className="profile-avatar">
                                    {doctor?.name?.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
                                </div>
                                <div className="profile-name">
                                    <h4>{doctor?.name}</h4>
                                    <span className="profile-role">{doctor?.specialization}</span>
                                </div>
                            </div>

                            <div className="profile-details">
                                <div className="detail-row">
                                    <span className="detail-label">📧 Email</span>
                                    <span className="detail-value">{doctor?.email}</span>
                                </div>

                                <div className="detail-row">
                                    <span className="detail-label">🎓 Qualifications</span>
                                    <span className="detail-value">{doctor?.qualifications}</span>
                                </div>

                                <div className="detail-row">
                                    <span className="detail-label">⏱️ Experience</span>
                                    <span className="detail-value">{doctor?.experience} years</span>
                                </div>

                                <div className="detail-row">
                                    <span className="detail-label">⭐ Rating</span>
                                    <span className="detail-value">{doctor?.rating}/5</span>
                                </div>

                                {/* Editable Fields */}
                                {isEditing ? (
                                    <>
                                        <div className="form-group">
                                            <label>📱 Mobile</label>
                                            <input
                                                type="text"
                                                value={formData.mobile}
                                                onChange={(e) => setFormData(prev => ({ ...prev, mobile: e.target.value }))}
                                                placeholder="Enter mobile number"
                                            />
                                        </div>

                                        <div className="detail-row">
                                            <span className="detail-label">🏥 Hospital</span>
                                            <span className="detail-value">Medicare Hospital (Fixed)</span>
                                        </div>

                                        <div className="form-group">
                                            <label>💰 Consultation Fees (₹)</label>
                                            <input
                                                type="number"
                                                value={formData.fees}
                                                onChange={(e) => setFormData(prev => ({ ...prev, fees: parseInt(e.target.value) || 0 }))}
                                                min="0"
                                            />
                                        </div>

                                        <div className="form-group">
                                            <label>📝 About</label>
                                            <textarea
                                                value={formData.about}
                                                onChange={(e) => setFormData(prev => ({ ...prev, about: e.target.value }))}
                                                placeholder="Tell patients about yourself..."
                                                rows={3}
                                            />
                                        </div>
                                    </>
                                ) : (
                                    <>
                                        <div className="detail-row">
                                            <span className="detail-label">📱 Mobile</span>
                                            <span className="detail-value">{doctor?.mobile || 'Not set'}</span>
                                        </div>

                                        <div className="detail-row">
                                            <span className="detail-label">🏥 Hospital</span>
                                            <span className="detail-value">{doctor?.hospital}</span>
                                        </div>

                                        <div className="detail-row">
                                            <span className="detail-label">💰 Fees</span>
                                            <span className="detail-value">₹{doctor?.fees}</span>
                                        </div>

                                        {doctor?.about && (
                                            <div className="detail-row about-section">
                                                <span className="detail-label">📝 About</span>
                                                <p className="detail-value about-text">{doctor?.about}</p>
                                            </div>
                                        )}
                                    </>
                                )}
                            </div>
                        </>
                    ) : (
                        /* Change Password Mode */
                        <div className="password-section">
                            <h4>🔒 Change Password</h4>
                            <p className="password-note">
                                For security, please change from the default password.
                            </p>

                            <div className="form-group">
                                <label>Current Password</label>
                                <input
                                    type="password"
                                    value={passwordData.currentPassword}
                                    onChange={(e) => setPasswordData(prev => ({ ...prev, currentPassword: e.target.value }))}
                                    placeholder="Enter current password"
                                />
                            </div>

                            <div className="form-group">
                                <label>New Password</label>
                                <input
                                    type="password"
                                    value={passwordData.newPassword}
                                    onChange={(e) => setPasswordData(prev => ({ ...prev, newPassword: e.target.value }))}
                                    placeholder="Enter new password (min 6 characters)"
                                />
                            </div>

                            <div className="form-group">
                                <label>Confirm New Password</label>
                                <input
                                    type="password"
                                    value={passwordData.confirmPassword}
                                    onChange={(e) => setPasswordData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                                    placeholder="Confirm new password"
                                />
                            </div>
                        </div>
                    )}
                </div>

                <div className="modal-footer">
                    {!isChangingPassword ? (
                        <>
                            {isEditing ? (
                                <>
                                    <button className="btn-secondary" onClick={() => setIsEditing(false)}>
                                        Cancel
                                    </button>
                                    <button
                                        className="btn-primary"
                                        onClick={handleSaveProfile}
                                        disabled={loading}
                                    >
                                        {loading ? 'Saving...' : '💾 Save Changes'}
                                    </button>
                                </>
                            ) : (
                                <>
                                    <button className="btn-secondary" onClick={() => setIsChangingPassword(true)}>
                                        🔒 Change Password
                                    </button>
                                    <button className="btn-primary" onClick={() => setIsEditing(true)}>
                                        ✏️ Edit Profile
                                    </button>
                                </>
                            )}
                        </>
                    ) : (
                        <>
                            <button className="btn-secondary" onClick={() => setIsChangingPassword(false)}>
                                Cancel
                            </button>
                            <button
                                className="btn-primary"
                                onClick={handleChangePassword}
                                disabled={loading || !passwordData.currentPassword || !passwordData.newPassword}
                            >
                                {loading ? 'Changing...' : '🔒 Update Password'}
                            </button>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

export default DoctorProfileModal;

import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';

/**
 * Modern Calendar Date Picker Component
 * Beautiful UI with Year -> Month -> Date flow
 */
const DatePicker = ({ value, onChange, onClose }) => {
    const [step, setStep] = useState('year');
    const [selectedYear, setSelectedYear] = useState(null);
    const [selectedMonth, setSelectedMonth] = useState(null);
    const [selectedDay, setSelectedDay] = useState(null);

    const currentYear = new Date().getFullYear();
    // Show years in ranges of 20
    const [yearRangeStart, setYearRangeStart] = useState(currentYear - 19);

    const months = [
        { short: 'Jan', full: 'January' },
        { short: 'Feb', full: 'February' },
        { short: 'Mar', full: 'March' },
        { short: 'Apr', full: 'April' },
        { short: 'May', full: 'May' },
        { short: 'Jun', full: 'June' },
        { short: 'Jul', full: 'July' },
        { short: 'Aug', full: 'August' },
        { short: 'Sep', full: 'September' },
        { short: 'Oct', full: 'October' },
        { short: 'Nov', full: 'November' },
        { short: 'Dec', full: 'December' }
    ];

    const weekDays = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

    const getDaysInMonth = (year, month) => new Date(year, month + 1, 0).getDate();
    const getFirstDayOfMonth = (year, month) => new Date(year, month, 1).getDay();

    // Initialize from value
    useEffect(() => {
        if (value) {
            // Append T00:00:00 to force local timezone parsing
            const date = new Date(value + 'T00:00:00');
            setSelectedYear(date.getFullYear());
            setSelectedMonth(date.getMonth());
            setSelectedDay(date.getDate());
            setYearRangeStart(Math.floor(date.getFullYear() / 20) * 20);
        } else {
            setYearRangeStart(currentYear - 19);
        }
    }, [value, currentYear]);

    const handleYearSelect = (year) => {
        setSelectedYear(year);
        setStep('month');
    };

    const handleMonthSelect = (monthIndex) => {
        setSelectedMonth(monthIndex);
        setStep('date');
    };

    const handleDateSelect = (day) => {
        setSelectedDay(day);
        // Format date string directly to avoid timezone conversion issues
        const year = selectedYear;
        const month = String(selectedMonth + 1).padStart(2, '0');
        const dayStr = String(day).padStart(2, '0');
        const dateString = `${year}-${month}-${dayStr}`;
        onChange(dateString);
        onClose();
    };

    const goBack = () => {
        if (step === 'month') setStep('year');
        else if (step === 'date') setStep('month');
    };

    const yearRange = Array.from({ length: 20 }, (_, i) => yearRangeStart + i).filter(y => y <= currentYear);

    const renderCalendarGrid = () => {
        const daysInMonth = getDaysInMonth(selectedYear, selectedMonth);
        const firstDay = getFirstDayOfMonth(selectedYear, selectedMonth);
        const days = [];

        // Empty cells for days before the 1st
        for (let i = 0; i < firstDay; i++) {
            days.push(<div key={`empty-${i}`} className="calendar-day empty"></div>);
        }

        // Actual days
        for (let day = 1; day <= daysInMonth; day++) {
            const isSelected = selectedDay === day;
            const isToday = new Date().getDate() === day &&
                new Date().getMonth() === selectedMonth &&
                new Date().getFullYear() === selectedYear;
            days.push(
                <button
                    key={day}
                    className={`calendar-day ${isSelected ? 'selected' : ''} ${isToday ? 'today' : ''}`}
                    onClick={() => handleDateSelect(day)}
                >
                    {day}
                </button>
            );
        }

        return days;
    };

    return (
        <div className="dp-overlay" onClick={onClose}>
            <div className="dp-container" onClick={(e) => e.stopPropagation()}>
                {/* Header */}
                <div className="dp-header">
                    <div className="dp-nav">
                        {step !== 'year' && (
                            <button className="dp-nav-btn" onClick={goBack}>
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M15 18l-6-6 6-6" />
                                </svg>
                            </button>
                        )}
                        <div className="dp-title">
                            {step === 'year' && '🎂 Select Birth Year'}
                            {step === 'month' && `📅 Select Month (${selectedYear})`}
                            {step === 'date' && `${months[selectedMonth].full} ${selectedYear}`}
                        </div>
                        <button className="dp-close-btn" onClick={onClose}>
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M18 6L6 18M6 6l12 12" />
                            </svg>
                        </button>
                    </div>
                    {/* Progress indicator */}
                    <div className="dp-progress">
                        <div className={`dp-progress-step ${step === 'year' ? 'active' : (selectedYear ? 'done' : '')}`}>
                            <span className="step-num">1</span>
                            <span className="step-text">Year</span>
                        </div>
                        <div className="dp-progress-line"></div>
                        <div className={`dp-progress-step ${step === 'month' ? 'active' : (selectedMonth !== null ? 'done' : '')}`}>
                            <span className="step-num">2</span>
                            <span className="step-text">Month</span>
                        </div>
                        <div className="dp-progress-line"></div>
                        <div className={`dp-progress-step ${step === 'date' ? 'active' : ''}`}>
                            <span className="step-num">3</span>
                            <span className="step-text">Day</span>
                        </div>
                    </div>
                </div>

                {/* Body */}
                <div className="dp-body">
                    {/* Year Selection */}
                    {step === 'year' && (
                        <div className="dp-year-section">
                            <div className="dp-year-nav">
                                <button
                                    className="dp-range-btn"
                                    onClick={() => setYearRangeStart(prev => Math.max(1920, prev - 20))}
                                    disabled={yearRangeStart <= 1920}
                                >
                                    ← Earlier
                                </button>
                                <span className="dp-range-label">{yearRangeStart} - {Math.min(yearRangeStart + 19, currentYear)}</span>
                                <button
                                    className="dp-range-btn"
                                    onClick={() => setYearRangeStart(prev => Math.min(currentYear - 19, prev + 20))}
                                    disabled={yearRangeStart + 20 > currentYear}
                                >
                                    Later →
                                </button>
                            </div>
                            <div className="dp-year-grid">
                                {yearRange.map((year) => (
                                    <button
                                        key={year}
                                        className={`dp-year-btn ${selectedYear === year ? 'selected' : ''}`}
                                        onClick={() => handleYearSelect(year)}
                                    >
                                        {year}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Month Selection */}
                    {step === 'month' && (
                        <div className="dp-month-grid">
                            {months.map((month, index) => (
                                <button
                                    key={month.short}
                                    className={`dp-month-btn ${selectedMonth === index ? 'selected' : ''}`}
                                    onClick={() => handleMonthSelect(index)}
                                >
                                    <span className="month-icon">
                                        {['❄️', '💝', '🌸', '🌷', '🌺', '☀️', '🌴', '🌻', '🍂', '🎃', '🍁', '🎄'][index]}
                                    </span>
                                    <span className="month-name">{month.full}</span>
                                </button>
                            ))}
                        </div>
                    )}

                    {/* Date Selection (Calendar) */}
                    {step === 'date' && (
                        <div className="dp-calendar">
                            <div className="calendar-weekdays">
                                {weekDays.map((day) => (
                                    <div key={day} className="calendar-weekday">{day}</div>
                                ))}
                            </div>
                            <div className="calendar-grid">
                                {renderCalendarGrid()}
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer with selection preview */}
                {(selectedYear || selectedMonth !== null) && (
                    <div className="dp-footer">
                        <div className="dp-preview">
                            <span className="preview-label">Selected:</span>
                            <span className="preview-value">
                                {selectedDay && selectedMonth !== null && selectedYear
                                    ? `${months[selectedMonth].full} ${selectedDay}, ${selectedYear}`
                                    : selectedMonth !== null && selectedYear
                                        ? `${months[selectedMonth].full} ${selectedYear}`
                                        : selectedYear || 'Not selected'}
                            </span>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

/**
 * Profile Modal Component
 * Shows user details and allows updating DOB and mobile
 */
const ProfileModal = ({ isOpen, onClose }) => {
    const { user, updateProfile } = useAuth();

    // Country codes list
    const countryCodes = [
        { code: '+91', country: 'India', flag: '🇮🇳' },
        { code: '+1', country: 'USA/Canada', flag: '🇺🇸' },
        { code: '+44', country: 'UK', flag: '🇬🇧' },
        { code: '+61', country: 'Australia', flag: '🇦🇺' },
        { code: '+971', country: 'UAE', flag: '🇦🇪' },
        { code: '+966', country: 'Saudi Arabia', flag: '🇸🇦' },
        { code: '+65', country: 'Singapore', flag: '🇸🇬' },
        { code: '+60', country: 'Malaysia', flag: '🇲🇾' },
        { code: '+49', country: 'Germany', flag: '🇩🇪' },
        { code: '+33', country: 'France', flag: '🇫🇷' },
        { code: '+81', country: 'Japan', flag: '🇯🇵' },
        { code: '+86', country: 'China', flag: '🇨🇳' },
        { code: '+82', country: 'South Korea', flag: '🇰🇷' },
        { code: '+7', country: 'Russia', flag: '🇷🇺' },
        { code: '+55', country: 'Brazil', flag: '🇧🇷' }
    ];

    const [formData, setFormData] = useState({
        dob: '',
        mobile: '',
        countryCode: '+91'
    });
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [saving, setSaving] = useState(false);
    const [saveStatus, setSaveStatus] = useState({ type: '', message: '' });

    // Initialize form with user data when modal opens or user changes
    useEffect(() => {
        if (user && isOpen) {
            // Extract country code from mobile if exists
            let mobile = user.mobile || '';
            let countryCode = '+91';

            // Check if mobile starts with a known country code
            const foundCode = countryCodes.find(cc => mobile.startsWith(cc.code));
            if (foundCode) {
                countryCode = foundCode.code;
                mobile = mobile.slice(foundCode.code.length);
            }

            setFormData({
                dob: user.dob ? new Date(user.dob).toISOString().split('T')[0] : '',
                mobile: mobile,
                countryCode: countryCode
            });
            setSaveStatus({ type: '', message: '' });
        }
    }, [user, isOpen]);

    const handleMobileChange = (e) => {
        const value = e.target.value.replace(/[^0-9]/g, '');
        setFormData(prev => ({ ...prev, mobile: value }));
    };

    const handleDobChange = (dateString) => {
        console.log('DOB Changed to:', dateString);
        setFormData(prev => ({ ...prev, dob: dateString }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        setSaveStatus({ type: '', message: '' });

        // Combine country code with mobile number
        const fullMobile = formData.mobile.trim()
            ? `${formData.countryCode}${formData.mobile.trim()}`
            : '';

        console.log('Submitting profile update:', { dob: formData.dob, mobile: fullMobile });

        try {
            const result = await updateProfile({
                dob: formData.dob || null,
                mobile: fullMobile
            });

            console.log('Update result:', result);

            if (result.success) {
                setSaveStatus({ type: 'success', message: 'Profile updated successfully!' });
            } else {
                setSaveStatus({ type: 'error', message: result.message || 'Failed to update profile' });
            }
        } catch (error) {
            console.error('Update error:', error);
            setSaveStatus({ type: 'error', message: 'An error occurred while saving' });
        } finally {
            setSaving(false);
        }
    };

    const formatDisplayDate = (dateString) => {
        if (!dateString) return 'Click to select your birthday';
        const date = new Date(dateString + 'T00:00:00');
        return date.toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    if (!isOpen) return null;

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-container profile-modal" onClick={(e) => e.stopPropagation()}>
                {/* Modal Header */}
                <div className="modal-header">
                    <div className="modal-avatar">
                        {user?.name?.charAt(0).toUpperCase() || 'U'}
                    </div>
                    <div className="modal-title-area">
                        <h2>{user?.name || 'User'}</h2>
                        <span className="modal-role-badge">{user?.role || 'Patient'}</span>
                    </div>
                    <button className="modal-close" onClick={onClose}>×</button>
                </div>

                {/* Modal Body */}
                <div className="modal-body">
                    {/* Read-only Info */}
                    <div className="profile-section">
                        <h3>Personal Information</h3>
                        <div className="profile-info-grid">
                            <div className="profile-info-item">
                                <span className="profile-label">📧 Email</span>
                                <span className="profile-value">{user?.email || 'N/A'}</span>
                            </div>
                            <div className="profile-info-item">
                                <span className="profile-label">👤 Role</span>
                                <span className="profile-value capitalize">{user?.role || 'Patient'}</span>
                            </div>
                            <div className="profile-info-item">
                                <span className="profile-label">📅 Member Since</span>
                                <span className="profile-value">
                                    {user?.createdAt
                                        ? new Date(user.createdAt).toLocaleDateString('en-US', {
                                            year: 'numeric',
                                            month: 'long',
                                            day: 'numeric'
                                        })
                                        : 'N/A'}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Editable Info */}
                    <div className="profile-section">
                        <h3>Update Profile</h3>
                        <form onSubmit={handleSubmit} className="profile-form">
                            {/* DOB Field */}
                            <div className="form-group">
                                <label>🎂 Date of Birth</label>
                                <div
                                    className={`dob-input-trigger ${formData.dob ? 'has-value' : ''}`}
                                    onClick={() => setShowDatePicker(true)}
                                >
                                    <span className={formData.dob ? 'dob-value' : 'dob-placeholder'}>
                                        {formatDisplayDate(formData.dob)}
                                    </span>
                                    <span className="dob-icon">📅</span>
                                </div>
                            </div>

                            {/* Mobile Field with Country Code */}
                            <div className="form-group">
                                <label>📱 Mobile Number</label>
                                <div className="mobile-input-group">
                                    <select
                                        className="country-code-select"
                                        value={formData.countryCode}
                                        onChange={(e) => setFormData(prev => ({ ...prev, countryCode: e.target.value }))}
                                    >
                                        {countryCodes.map(cc => (
                                            <option key={cc.code} value={cc.code}>
                                                {cc.flag} {cc.code}
                                            </option>
                                        ))}
                                    </select>
                                    <input
                                        type="tel"
                                        placeholder="Enter mobile number"
                                        value={formData.mobile}
                                        onChange={handleMobileChange}
                                        maxLength={15}
                                    />
                                </div>
                            </div>

                            {/* Status Message */}
                            {saveStatus.message && (
                                <div className={`save-status ${saveStatus.type}`}>
                                    {saveStatus.type === 'success' ? '✅' : '⚠️'} {saveStatus.message}
                                </div>
                            )}

                            {/* Actions */}
                            <div className="modal-actions">
                                <button type="button" className="btn-secondary" onClick={onClose}>
                                    Cancel
                                </button>
                                <button type="submit" className="btn-primary" disabled={saving}>
                                    {saving ? (
                                        <>
                                            <span className="button-spinner"></span>
                                            Saving...
                                        </>
                                    ) : (
                                        '💾 Save Changes'
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>

                {/* Date Picker Modal */}
                {showDatePicker && (
                    <DatePicker
                        value={formData.dob}
                        onChange={handleDobChange}
                        onClose={() => setShowDatePicker(false)}
                    />
                )}
            </div>
        </div>
    );
};

export default ProfileModal;

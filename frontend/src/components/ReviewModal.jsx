import React, { useState } from 'react';
import './ReviewModal.css';
import api from '../utils/api';

const ReviewModal = ({ isOpen, onClose, doctorName, appointmentId, doctorId, onSubmitSuccess }) => {
    const [rating, setRating] = useState(0);
    const [hoverRating, setHoverRating] = useState(0);
    const [reviewText, setReviewText] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState('');

    if (!isOpen) return null;

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        setError('');

        try {
            const response = await api.post('/reviews', {
                rating,
                comment: reviewText,
                appointmentId,
                doctorId
            });

            if (response.data.success) {
                if (onSubmitSuccess) onSubmitSuccess();
                onClose();
                // Reset form
                setRating(0);
                setReviewText('');
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to submit review');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="review-modal-overlay" onClick={onClose}>
            <div className="review-modal-content" onClick={e => e.stopPropagation()}>
                <div className="review-header">
                    <h3>Rate Your Experience</h3>
                    <p>How was your consultation with <strong>{doctorName}</strong>?</p>
                </div>

                <form onSubmit={handleSubmit}>
                    {error && <div className="error-message">{error}</div>}

                    <div className="star-rating-container" onMouseLeave={() => setHoverRating(0)}>
                        {[1, 2, 3, 4, 5].map((star) => (
                            <button
                                key={star}
                                type="button"
                                className={`star-btn ${star <= (hoverRating || rating) ? 'active' : ''}`}
                                onMouseEnter={() => setHoverRating(star)}
                                onClick={() => setRating(star)}
                            >
                                ★
                            </button>
                        ))}
                    </div>

                    <div className="review-form-group">
                        <label htmlFor="review-text">Share your feedback</label>
                        <textarea
                            id="review-text"
                            className="review-textarea"
                            placeholder="Tell us about your experience..."
                            value={reviewText}
                            onChange={(e) => setReviewText(e.target.value)}
                            rows="4"
                            required
                        />
                    </div>

                    <div className="review-actions">
                        <button
                            type="button"
                            className="btn-review-cancel"
                            onClick={onClose}
                            disabled={isSubmitting}
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="btn-review-submit"
                            disabled={rating === 0 || !reviewText.trim() || isSubmitting}
                        >
                            {isSubmitting ? 'Submitting...' : 'Submit Review'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ReviewModal;

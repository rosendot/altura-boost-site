'use client';

import { useState, useEffect, useRef } from 'react';

interface ReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  jobId: string;
  jobNumber: string;
  gameName: string;
  serviceName: string;
  boosterName: string;
  onReviewSubmitted: () => void;
}

export default function ReviewModal({
  isOpen,
  onClose,
  jobId,
  jobNumber,
  gameName,
  serviceName,
  boosterName,
  onReviewSubmitted,
}: ReviewModalProps) {
  const [rating, setRating] = useState(0);
  const [qualityRating, setQualityRating] = useState(0);
  const [communicationRating, setCommunicationRating] = useState(0);
  const [timelinessRating, setTimelinessRating] = useState(0);
  const [reviewText, setReviewText] = useState('');
  const [deliveryStatus, setDeliveryStatus] = useState<'complete' | 'incomplete' | 'poor_quality'>('complete');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const modalRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (rating === 0) {
      setError('Please provide a rating');
      return;
    }

    setSubmitting(true);
    setError('');

    try {
      const res = await fetch(`/api/jobs/${jobId}/review`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          rating,
          quality_rating: qualityRating || null,
          communication_rating: communicationRating || null,
          timeliness_rating: timelinessRating || null,
          review_text: reviewText.trim() || null,
          delivery_status: deliveryStatus,
        }),
      });

      if (res.ok) {
        onReviewSubmitted();
        onClose();
        // Reset form
        setRating(0);
        setQualityRating(0);
        setCommunicationRating(0);
        setTimelinessRating(0);
        setReviewText('');
        setDeliveryStatus('complete');
      } else {
        const data = await res.json();
        setError(data.error || 'Failed to submit review');
      }
    } catch (err) {
      console.error('Error submitting review:', err);
      setError('Failed to submit review');
    } finally {
      setSubmitting(false);
    }
  };

  // Focus trap and escape key handling
  useEffect(() => {
    if (!isOpen) return;

    // Focus the close button when modal opens
    closeButtonRef.current?.focus();

    // Handle escape key
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    // Focus trap
    const handleTabKey = (e: KeyboardEvent) => {
      if (e.key !== 'Tab' || !modalRef.current) return;

      const focusableElements = modalRef.current.querySelectorAll(
        'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
      );
      const firstElement = focusableElements[0] as HTMLElement;
      const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;

      if (e.shiftKey && document.activeElement === firstElement) {
        e.preventDefault();
        lastElement.focus();
      } else if (!e.shiftKey && document.activeElement === lastElement) {
        e.preventDefault();
        firstElement.focus();
      }
    };

    document.addEventListener('keydown', handleEscape);
    document.addEventListener('keydown', handleTabKey);

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.removeEventListener('keydown', handleTabKey);
    };
  }, [isOpen, onClose]);

  const StarRating = ({
    rating,
    setRating,
    label,
    required = false
  }: {
    rating: number;
    setRating: (rating: number) => void;
    label: string;
    required?: boolean;
  }) => {
    const ratingId = `rating-${label.toLowerCase().replace(/\s+/g, '-')}`;
    const hasError = required && rating === 0;
    return (
      <div className="mb-4">
        <label id={`${ratingId}-label`} className="block text-sm font-medium text-gray-300 mb-2">
          {label} {required && <span className="text-red-500" aria-label="required">*</span>}
        </label>
        <div
          className="flex gap-1"
          role="radiogroup"
          aria-labelledby={`${ratingId}-label`}
          aria-required={required}
          aria-invalid={hasError}
        >
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              onClick={() => setRating(star)}
              role="radio"
              aria-checked={star === rating}
              aria-label={`${star} star${star !== 1 ? 's' : ''}`}
              className={`text-3xl transition ${
                star <= rating ? 'text-yellow-400' : 'text-gray-600'
              } hover:text-yellow-300 focus:outline-none focus:ring-2 focus:ring-primary-500 rounded`}
            >
              <span aria-hidden="true">★</span>
            </button>
          ))}
        </div>
      </div>
    );
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4" role="dialog" aria-modal="true" aria-labelledby="review-modal-title">
      <div ref={modalRef} className="bg-gray-900 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-gray-700">
        <div className="p-6">
          {/* Header */}
          <div className="flex justify-between items-start mb-6">
            <div>
              <h2 id="review-modal-title" className="text-2xl font-bold text-white">Leave a Review</h2>
              <p className="text-gray-400 mt-1">
                Job #{jobNumber} - {gameName} - {serviceName}
              </p>
              <p className="text-gray-500 text-sm">Booster: {boosterName}</p>
            </div>
            <button
              ref={closeButtonRef}
              onClick={onClose}
              aria-label="Close review modal"
              className="text-gray-400 hover:text-white text-2xl focus:outline-none focus:ring-2 focus:ring-primary-500 rounded"
            >
              ×
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit}>
            {/* Delivery Status */}
            <fieldset className="mb-4">
              <legend className="block text-sm font-medium text-gray-300 mb-2">
                Delivery Status <span className="text-red-500" aria-label="required">*</span>
              </legend>
              <div className="flex gap-2" role="group" aria-label="Delivery status options">
                <button
                  type="button"
                  onClick={() => setDeliveryStatus('complete')}
                  role="radio"
                  aria-checked={deliveryStatus === 'complete'}
                  className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition ${
                    deliveryStatus === 'complete'
                      ? 'bg-green-600 text-white'
                      : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                  }`}
                >
                  Complete
                </button>
                <button
                  type="button"
                  onClick={() => setDeliveryStatus('incomplete')}
                  role="radio"
                  aria-checked={deliveryStatus === 'incomplete'}
                  className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition ${
                    deliveryStatus === 'incomplete'
                      ? 'bg-yellow-600 text-white'
                      : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                  }`}
                >
                  Incomplete
                </button>
                <button
                  type="button"
                  onClick={() => setDeliveryStatus('poor_quality')}
                  role="radio"
                  aria-checked={deliveryStatus === 'poor_quality'}
                  className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition ${
                    deliveryStatus === 'poor_quality'
                      ? 'bg-red-600 text-white'
                      : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                  }`}
                >
                  Poor Quality
                </button>
              </div>
            </fieldset>

            <StarRating
              rating={rating}
              setRating={setRating}
              label="Overall Rating"
              required={true}
            />

            <StarRating
              rating={qualityRating}
              setRating={setQualityRating}
              label="Quality (Optional)"
            />

            <StarRating
              rating={communicationRating}
              setRating={setCommunicationRating}
              label="Communication (Optional)"
            />

            <StarRating
              rating={timelinessRating}
              setRating={setTimelinessRating}
              label="Timeliness (Optional)"
            />

            <div className="mb-6">
              <label htmlFor="review-text" className="block text-sm font-medium text-gray-300 mb-2">
                Review (Optional)
              </label>
              <textarea
                id="review-text"
                value={reviewText}
                onChange={(e) => setReviewText(e.target.value)}
                placeholder="Share your experience with this booster..."
                rows={4}
                className="w-full px-4 py-2 bg-gray-800 border border-gray-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 placeholder-gray-500"
              />
            </div>

            {error && (
              <div className="mb-4 p-3 bg-red-900 border border-red-700 rounded-lg text-red-200 text-sm" role="alert" aria-live="polite">
                {error}
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-3">
              <button
                type="button"
                onClick={onClose}
                disabled={submitting}
                className="flex-1 px-4 py-2 bg-gray-800 text-gray-300 rounded-lg hover:bg-gray-700 disabled:opacity-50 transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting || rating === 0}
                className="flex-1 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
              >
                {submitting ? 'Submitting...' : 'Submit Review'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

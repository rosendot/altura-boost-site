'use client';

import { useState } from 'react';

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

  const StarRating = ({
    rating,
    setRating,
    label
  }: {
    rating: number;
    setRating: (rating: number) => void;
    label: string;
  }) => (
    <div className="mb-4">
      <label className="block text-sm font-medium text-gray-300 mb-2">
        {label} {label === 'Overall Rating' && <span className="text-red-500">*</span>}
      </label>
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => setRating(star)}
            className={`text-3xl transition ${
              star <= rating ? 'text-yellow-400' : 'text-gray-600'
            } hover:text-yellow-300`}
          >
            ★
          </button>
        ))}
      </div>
    </div>
  );

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-900 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-gray-700">
        <div className="p-6">
          {/* Header */}
          <div className="flex justify-between items-start mb-6">
            <div>
              <h2 className="text-2xl font-bold text-white">Leave a Review</h2>
              <p className="text-gray-400 mt-1">
                Job #{jobNumber} - {gameName} - {serviceName}
              </p>
              <p className="text-gray-500 text-sm">Booster: {boosterName}</p>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-white text-2xl"
            >
              ×
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit}>
            {/* Delivery Status */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Delivery Status <span className="text-red-500">*</span>
              </label>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setDeliveryStatus('complete')}
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
                  className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition ${
                    deliveryStatus === 'poor_quality'
                      ? 'bg-red-600 text-white'
                      : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                  }`}
                >
                  Poor Quality
                </button>
              </div>
            </div>

            <StarRating
              rating={rating}
              setRating={setRating}
              label="Overall Rating"
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
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Review (Optional)
              </label>
              <textarea
                value={reviewText}
                onChange={(e) => setReviewText(e.target.value)}
                placeholder="Share your experience with this booster..."
                rows={4}
                className="w-full px-4 py-2 bg-gray-800 border border-gray-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 placeholder-gray-500"
              />
            </div>

            {error && (
              <div className="mb-4 p-3 bg-red-900 border border-red-700 rounded-lg text-red-200 text-sm">
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

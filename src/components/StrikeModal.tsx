'use client';

import { useState } from 'react';

interface StrikeModalProps {
  isOpen: boolean;
  onClose: () => void;
  boosterId: string;
  boosterName: string;
  jobId: string;
  jobNumber: string;
  onStrikeIssued: () => void;
}

export default function StrikeModal({
  isOpen,
  onClose,
  boosterId,
  boosterName,
  jobId,
  jobNumber,
  onStrikeIssued,
}: StrikeModalProps) {
  const [reason, setReason] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!reason.trim()) {
      setError('Strike reason is required');
      return;
    }

    setSubmitting(true);
    setError('');

    try {
      const res = await fetch('/api/admin/strikes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          booster_id: boosterId,
          job_id: jobId,
          reason: reason.trim(),
        }),
      });

      if (res.ok) {
        onStrikeIssued();
        onClose();
        setReason('');
      } else {
        const data = await res.json();
        setError(data.error || 'Failed to issue strike');
      }
    } catch (err) {
      console.error('Error issuing strike:', err);
      setError('Failed to issue strike');
    } finally {
      setSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-900 rounded-lg max-w-lg w-full border border-gray-700">
        <div className="p-6">
          {/* Header */}
          <div className="flex justify-between items-start mb-6">
            <div>
              <h2 className="text-2xl font-bold text-white">Issue Strike</h2>
              <p className="text-gray-400 mt-1">
                Booster: {boosterName}
              </p>
              <p className="text-gray-500 text-sm">Job #{jobNumber}</p>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-white text-2xl"
            >
              ×
            </button>
          </div>

          {/* Warning */}
          <div className="mb-4 p-3 bg-red-900 border border-red-700 rounded-lg">
            <p className="text-red-200 text-sm">
              This will issue a strike to the booster. After 3 strikes, the booster will be automatically suspended.
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit}>
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Strike Reason <span className="text-red-500">*</span>
              </label>
              <textarea
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Explain why this strike is being issued..."
                rows={4}
                className="w-full px-4 py-2 bg-gray-800 border border-gray-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 placeholder-gray-500"
                required
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
                disabled={submitting || !reason.trim()}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
              >
                {submitting ? 'Issuing Strike...' : 'Issue Strike'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAccount } from '@/contexts/AccountContext';
import { useToast } from '@/contexts/ToastContext';

export default function AppealsPage() {
  const router = useRouter();
  const { userData, refreshUserData } = useAccount();
  const { showToast } = useToast();
  const [appealText, setAppealText] = useState('');
  const [submittingAppeal, setSubmittingAppeal] = useState(false);
  const [appealError, setAppealError] = useState('');

  // Redirect if not a suspended booster who can appeal
  useEffect(() => {
    if (userData && (userData.role !== 'booster' || !userData.is_suspended || !userData.can_appeal)) {
      router.replace('/account/profile');
    }
  }, [userData, router]);

  const handleSubmitAppeal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!appealText.trim()) {
      setAppealError('Please provide an explanation for your appeal.');
      return;
    }

    setAppealError('');
    setSubmittingAppeal(true);
    try {
      const response = await fetch('/api/appeals/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ appeal_text: appealText }),
      });

      if (response.ok) {
        showToast('Your appeal has been submitted successfully. We will review it and get back to you soon.', 'success');
        setAppealText('');
        // Refresh user data
        await refreshUserData();
      } else {
        const error = await response.json();
        showToast(error.error || 'Failed to submit appeal. Please try again.', 'error');
      }
    } catch (error) {
      console.error('Error submitting appeal:', error);
      showToast('Failed to submit appeal. Please try again.', 'error');
    } finally {
      setSubmittingAppeal(false);
    }
  };

  if (!userData || userData.role !== 'booster' || !userData.is_suspended) {
    return null;
  }

  return (
    <div>
      <h2 className="text-2xl font-bold text-white mb-6">Submit Suspension Appeal</h2>

      {/* Suspension Info */}
      <div className="bg-red-900/20 border-2 border-red-500 rounded-lg p-6 mb-6">
        <div className="flex items-start gap-4">
          <svg className="w-8 h-8 text-red-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <div className="flex-1">
            <h3 className="text-lg font-bold text-red-400 mb-2">Your Account is Suspended</h3>
            <div className="space-y-2">
              {userData.suspension_reason && (
                <div>
                  <p className="text-sm text-gray-400">Reason:</p>
                  <p className="text-white">{userData.suspension_reason}</p>
                </div>
              )}
              {userData.suspended_at && (
                <div>
                  <p className="text-sm text-gray-400">Suspended on:</p>
                  <p className="text-white">
                    {new Date(userData.suspended_at).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </p>
                </div>
              )}
              {userData.strike_count !== undefined && (
                <div>
                  <p className="text-sm text-gray-400">Active Strikes:</p>
                  <p className="text-white font-semibold">{userData.strike_count} strikes</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Appeal Status */}
      {userData.appeal_status && userData.appeal_status !== 'none' && (
        <div className={`border-2 rounded-lg p-6 mb-6 ${
          userData.appeal_status === 'pending'
            ? 'bg-yellow-900/20 border-yellow-500'
            : userData.appeal_status === 'approved'
            ? 'bg-green-900/20 border-green-500'
            : 'bg-red-900/20 border-red-500'
        }`}>
          <h3 className={`text-lg font-bold mb-2 ${
            userData.appeal_status === 'pending'
              ? 'text-yellow-400'
              : userData.appeal_status === 'approved'
              ? 'text-green-400'
              : 'text-red-400'
          }`}>
            Appeal Status: {userData.appeal_status.charAt(0).toUpperCase() + userData.appeal_status.slice(1)}
          </h3>
          <p className="text-gray-300">
            {userData.appeal_status === 'pending' && 'Your appeal is currently under review by our admin team. We will notify you once a decision has been made.'}
            {userData.appeal_status === 'approved' && 'Your appeal has been approved! Your suspension will be lifted shortly.'}
            {userData.appeal_status === 'rejected' && 'Unfortunately, your appeal was not approved. If you have additional information, you may submit a new appeal.'}
          </p>
        </div>
      )}

      {/* Appeal Form */}
      {(!userData.appeal_status || userData.appeal_status === 'none' || userData.appeal_status === 'rejected') && (
        <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Why should your suspension be lifted?</h3>
          <p className="text-sm text-gray-400 mb-4">
            Please provide a detailed explanation of why you believe your suspension should be reconsidered.
            Include any relevant information that might support your case.
          </p>

          <form onSubmit={handleSubmitAppeal}>
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Appeal Explanation <span className="text-red-500">*</span>
              </label>
              <textarea
                value={appealText}
                onChange={(e) => setAppealText(e.target.value)}
                placeholder="Explain why you believe your suspension should be lifted..."
                rows={8}
                className="w-full px-4 py-3 bg-gray-900 border border-gray-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 placeholder-gray-500 resize-none"
                required
                disabled={submittingAppeal}
              />
              {appealError && (
                <p className="text-sm text-red-400 mt-2" role="alert">
                  {appealError}
                </p>
              )}
              <p className="text-xs text-gray-500 mt-2">
                Be honest and respectful in your explanation.
              </p>
            </div>

            <button
              type="submit"
              disabled={submittingAppeal || !appealText.trim()}
              className="w-full px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition font-semibold disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              {submittingAppeal ? 'Submitting Appeal...' : 'Submit Appeal'}
            </button>
          </form>
        </div>
      )}
    </div>
  );
}

'use client';

import { useState } from 'react';
import { useAccount } from '@/contexts/AccountContext';

export default function ProfilePage() {
  const {
    userData,
    editedFullName,
    setEditedFullName,
    editedPhone,
    setEditedPhone,
    showApprovalBanner,
    setShowApprovalBanner,
  } = useAccount();

  // Security state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [updatingPassword, setUpdatingPassword] = useState(false);
  const [passwordError, setPasswordError] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState('');

  const handleUpdatePassword = async () => {
    setPasswordError('');
    setPasswordSuccess('');

    if (!currentPassword || !newPassword || !confirmPassword) {
      setPasswordError('All fields are required');
      return;
    }

    if (newPassword.length < 8) {
      setPasswordError('New password must be at least 8 characters');
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordError('New passwords do not match');
      return;
    }

    setUpdatingPassword(true);

    try {
      const response = await fetch('/api/user/update-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          currentPassword,
          newPassword,
        }),
      });

      if (response.ok) {
        setPasswordSuccess('Password updated successfully!');
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
      } else {
        const error = await response.json();
        setPasswordError(error.error || 'Failed to update password');
      }
    } catch (error) {
      console.error('Error updating password:', error);
      setPasswordError('Failed to update password. Please try again.');
    } finally {
      setUpdatingPassword(false);
    }
  };

  if (!userData) return null;

  return (
    <div>
      <h2 className="text-2xl font-bold text-white mb-6">Profile Information</h2>

      {/* Application Status Alert for Boosters */}
      {userData.role === 'booster' && userData.booster_approval_status === 'pending' && (
        <div className="mb-6 bg-yellow-900/30 border border-yellow-500 rounded-lg p-6">
          <div className="flex items-start gap-4">
            <svg className="w-6 h-6 text-yellow-400 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div className="flex-1">
              <h3 className="text-lg font-bold text-yellow-400 mb-2">Application Pending Review</h3>
              <p className="text-yellow-200 text-sm mb-3">
                Your booster application is currently under review by our admin team. You will receive an email notification once your application has been reviewed.
              </p>
              <p className="text-yellow-200/80 text-xs">
                You will gain access to the Booster Hub once your application is approved.
              </p>
            </div>
          </div>
        </div>
      )}

      {userData.role === 'booster' && userData.booster_approval_status === 'rejected' && (
        <div className="mb-6 bg-red-900/30 border border-red-500 rounded-lg p-6">
          <div className="flex items-start gap-4">
            <svg className="w-6 h-6 text-red-400 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div className="flex-1">
              <h3 className="text-lg font-bold text-red-400 mb-2">Application Not Approved</h3>
              <p className="text-red-200 text-sm mb-3">
                Unfortunately, your booster application was not approved at this time. If you believe this was a mistake or would like more information, please contact our support team.
              </p>
              <p className="text-red-200/80 text-xs">
                You may reapply after 30 days by contacting support.
              </p>
            </div>
          </div>
        </div>
      )}

      {userData.role === 'booster' && userData.booster_approval_status === 'approved' && showApprovalBanner && (
        <div className="mb-6 bg-green-900/30 border border-green-500 rounded-lg p-6">
          <div className="flex items-start gap-4">
            <svg className="w-6 h-6 text-green-400 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div className="flex-1">
              <h3 className="text-lg font-bold text-green-400 mb-2">Application Approved!</h3>
              <p className="text-green-200 text-sm">
                Congratulations! Your booster application has been approved. You now have access to the Booster Hub where you can accept and manage jobs.
              </p>
            </div>
            <button
              onClick={() => {
                setShowApprovalBanner(false);
                sessionStorage.setItem('approvalBannerDismissed', 'true');
              }}
              className="text-green-400 hover:text-green-300 transition"
              aria-label="Dismiss"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      )}

      <div className="space-y-6">
        {/* Email */}
        <div>
          <label className="block text-sm text-gray-400 mb-2">Email Address</label>
          <div className="px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white">
            {userData.email}
          </div>
        </div>

        {/* Full Name */}
        <div>
          <label htmlFor="full-name" className="block text-sm text-gray-400 mb-2">Full Name</label>
          <input
            id="full-name"
            type="text"
            value={editedFullName}
            onChange={(e) => setEditedFullName(e.target.value)}
            className="w-full px-4 py-3 bg-gray-800 border border-primary-700 text-white rounded-lg focus:outline-none focus:border-primary-500 transition"
            placeholder="Enter your full name"
            aria-required="true"
          />
        </div>

        {/* Phone */}
        <div>
          <label htmlFor="phone-number" className="block text-sm text-gray-400 mb-2">Phone Number (Optional)</label>
          <input
            id="phone-number"
            type="tel"
            value={editedPhone}
            onChange={(e) => setEditedPhone(e.target.value)}
            className="w-full px-4 py-3 bg-gray-800 border border-primary-700 text-white rounded-lg focus:outline-none focus:border-primary-500 transition"
            placeholder="Enter your phone number"
          />
        </div>

        {/* Account Created */}
        <div>
          <label className="block text-sm text-gray-400 mb-2">Member Since</label>
          <div className="px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white">
            {new Date(userData.created_at).toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })}
          </div>
        </div>

        <button className="px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition font-semibold focus:outline-none focus:ring-2 focus:ring-primary-500">
          Save Changes
        </button>
      </div>

      {/* Security Section */}
      <div className="mt-12 pt-8 border-t border-gray-700">
        <h2 className="text-2xl font-bold text-white mb-6">Security</h2>

        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-semibold text-white mb-4">Change Password</h3>

            {passwordError && (
              <div className="mb-4 bg-red-900/30 border border-red-500 rounded-lg p-4">
                <p className="text-red-400 text-sm">{passwordError}</p>
              </div>
            )}

            {passwordSuccess && (
              <div className="mb-4 bg-green-900/30 border border-green-500 rounded-lg p-4">
                <p className="text-green-400 text-sm">{passwordSuccess}</p>
              </div>
            )}

            <div className="space-y-4">
              <div>
                <label htmlFor="current-password" className="block text-sm text-gray-400 mb-2">Current Password</label>
                <input
                  id="current-password"
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className="w-full px-4 py-3 bg-gray-800 border border-primary-700 text-white rounded-lg focus:outline-none focus:border-primary-500 transition"
                  placeholder="Enter current password"
                  aria-required="true"
                />
              </div>

              <div>
                <label htmlFor="new-password" className="block text-sm text-gray-400 mb-2">New Password</label>
                <input
                  id="new-password"
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full px-4 py-3 bg-gray-800 border border-primary-700 text-white rounded-lg focus:outline-none focus:border-primary-500 transition"
                  placeholder="Enter new password (min 8 characters)"
                  aria-required="true"
                />
              </div>

              <div>
                <label htmlFor="confirm-password" className="block text-sm text-gray-400 mb-2">Confirm New Password</label>
                <input
                  id="confirm-password"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full px-4 py-3 bg-gray-800 border border-primary-700 text-white rounded-lg focus:outline-none focus:border-primary-500 transition"
                  placeholder="Confirm new password"
                  aria-required="true"
                />
              </div>

              <button
                onClick={handleUpdatePassword}
                disabled={updatingPassword}
                className="px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition font-semibold disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                {updatingPassword ? 'Updating...' : 'Update Password'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

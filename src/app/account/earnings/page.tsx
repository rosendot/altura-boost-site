'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAccount } from '@/contexts/AccountContext';
import { useToast } from '@/contexts/ToastContext';
import ConfirmationModal from '@/components/ConfirmationModal';

export default function EarningsPage() {
  const router = useRouter();
  const { userData, connectStatus, identityStatus, earningsLoading, fetchConnectStatus, fetchIdentityStatus } = useAccount();
  const { showToast } = useToast();

  const [connectLoading, setConnectLoading] = useState(false);
  const [disconnecting, setDisconnecting] = useState(false);
  const [identityLoading, setIdentityLoading] = useState(false);
  const [showDisconnectModal, setShowDisconnectModal] = useState(false);

  // Redirect if not approved booster
  useEffect(() => {
    if (userData && (userData.role !== 'booster' || userData.booster_approval_status !== 'approved')) {
      router.replace('/account/profile');
    }
  }, [userData, router]);

  const handleVerifyIdentity = async () => {
    setIdentityLoading(true);

    try {
      const response = await fetch('/api/boosters/connect/verify-identity', {
        method: 'POST',
      });

      if (response.ok) {
        const data = await response.json();
        // Redirect to Stripe Identity verification
        window.location.href = data.url;
      } else {
        const error = await response.json();
        showToast(error.error || 'Failed to start verification. Please try again.', 'error');
      }
    } catch (error) {
      console.error('Error starting identity verification:', error);
      showToast('Failed to start verification. Please try again.', 'error');
    } finally {
      setIdentityLoading(false);
    }
  };

  const handleConnectBank = async () => {
    setConnectLoading(true);

    try {
      const response = await fetch('/api/boosters/connect/onboarding', {
        method: 'POST',
      });

      if (response.ok) {
        const data = await response.json();
        // Redirect to Stripe onboarding
        window.location.href = data.url;
      } else {
        const error = await response.json();
        showToast(error.error || 'Failed to start onboarding. Please try again.', 'error');
      }
    } catch (error) {
      console.error('Error starting onboarding:', error);
      showToast('Failed to start onboarding. Please try again.', 'error');
    } finally {
      setConnectLoading(false);
    }
  };

  const handleDisconnectBank = async () => {
    setShowDisconnectModal(true);
  };

  const disconnectBankConfirmed = async () => {
    setDisconnecting(true);

    try {
      const response = await fetch('/api/boosters/connect/disconnect', {
        method: 'POST',
      });

      if (response.ok) {
        showToast('Bank account disconnected successfully.', 'success');
        await fetchConnectStatus(true);
      } else {
        const error = await response.json();
        showToast(error.error || 'Failed to disconnect. Please try again.', 'error');
      }
    } catch (error) {
      console.error('Error disconnecting:', error);
      showToast('Failed to disconnect. Please try again.', 'error');
    } finally {
      setDisconnecting(false);
    }
  };

  if (!userData || userData.role !== 'booster' || userData.booster_approval_status !== 'approved') {
    return null;
  }

  return (
    <div>
      <h2 className="text-2xl font-bold text-white mb-6">Earnings</h2>

      {earningsLoading ? (
        <div className="space-y-6">
          {/* Identity Verification Skeleton */}
          <div className="bg-gray-800 border border-gray-700 rounded-lg p-6 animate-pulse">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-full bg-gray-700"></div>
              <div className="flex-1">
                <div className="h-6 bg-gray-700 rounded w-48 mb-3"></div>
                <div className="h-4 bg-gray-700 rounded w-full mb-2"></div>
                <div className="h-4 bg-gray-700 rounded w-3/4 mb-4"></div>
                <div className="h-10 bg-gray-700 rounded w-40"></div>
              </div>
            </div>
          </div>
          {/* Bank Connection Skeleton */}
          <div className="bg-gray-800 border border-gray-700 rounded-lg p-6 animate-pulse">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-full bg-gray-700"></div>
              <div className="flex-1">
                <div className="h-6 bg-gray-700 rounded w-52 mb-3"></div>
                <div className="h-4 bg-gray-700 rounded w-full mb-2"></div>
                <div className="h-4 bg-gray-700 rounded w-2/3 mb-4"></div>
                <div className="h-10 bg-gray-700 rounded w-44"></div>
              </div>
            </div>
          </div>
          {/* Info Card Skeleton */}
          <div className="bg-gray-800 border border-gray-700 rounded-lg p-6 animate-pulse">
            <div className="h-6 bg-gray-700 rounded w-40 mb-4"></div>
            <div className="space-y-3">
              <div className="h-4 bg-gray-700 rounded w-full"></div>
              <div className="h-4 bg-gray-700 rounded w-full"></div>
              <div className="h-4 bg-gray-700 rounded w-3/4"></div>
            </div>
          </div>
        </div>
      ) : (
      <div className="space-y-6">
        {/* Step 1: Identity Verification (comes BEFORE bank connection) */}
        {!identityStatus ? (
          <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
            <div className="text-center py-4">
              <div className="text-gray-400">Loading verification status...</div>
            </div>
          </div>
        ) : !identityStatus.verified ? (
          /* Identity not verified - show verification UI */
          <div className="bg-yellow-900/20 border-2 border-yellow-500 rounded-lg p-6">
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 w-10 h-10 rounded-full bg-yellow-500 flex items-center justify-center text-white font-bold" aria-hidden="true">
                1
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-bold text-yellow-400 mb-2">Verify Your Identity</h3>

                {identityStatus.status === 'not_started' && (
                  <>
                    <p className="text-yellow-200 text-sm mb-4">
                      Before connecting your bank account, you need to verify your identity with a government-issued ID.
                    </p>
                    <button
                      onClick={handleVerifyIdentity}
                      disabled={identityLoading}
                      className="px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition font-semibold disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-primary-500"
                    >
                      {identityLoading ? 'Loading...' : 'Verify Identity'}
                    </button>
                    <p className="text-xs text-yellow-200/80 mt-4 flex items-center gap-2">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                      </svg>
                      Powered by Stripe Identity - Your documents are securely processed.
                    </p>
                  </>
                )}

                {identityStatus.status === 'pending' && (
                  <>
                    <div className="flex items-center gap-3 mb-4" role="status" aria-live="polite">
                      <svg className="w-6 h-6 text-blue-400 animate-spin" fill="none" viewBox="0 0 24 24" aria-hidden="true">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      <p className="text-blue-200 text-sm">
                        Your identity verification is being processed. This usually takes a few minutes.
                      </p>
                    </div>
                    <button
                      onClick={() => fetchIdentityStatus(true)}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-semibold text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      Refresh Status
                    </button>
                  </>
                )}

                {identityStatus.status === 'failed' && (
                  <>
                    <p className="text-red-200 text-sm mb-4">
                      Your identity verification failed. Please try again with a clear photo of your ID.
                    </p>
                    <button
                      onClick={handleVerifyIdentity}
                      disabled={identityLoading}
                      className="px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition font-semibold disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-red-500"
                    >
                      {identityLoading ? 'Loading...' : 'Retry Verification'}
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        ) : (
          /* Identity verified - show green checkmark */
          <div className="bg-green-900/20 border-2 border-green-500 rounded-lg p-6" role="status" aria-label="Identity verification complete">
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 w-10 h-10 rounded-full bg-green-500 flex items-center justify-center" aria-hidden="true">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-bold text-green-400 mb-1">Identity Verified</h3>
                <p className="text-green-200 text-sm">Your identity has been successfully verified.</p>
              </div>
            </div>
          </div>
        )}

        {/* Step 2: Bank Account Connection (only shown after identity verified) */}
        {identityStatus?.verified && (
          <>
            {!connectStatus ? (
              <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
                <div className="text-center py-4">
                  <div className="text-gray-400">Loading bank connection status...</div>
                </div>
              </div>
            ) : !connectStatus.connected ? (
              /* Scenario A: Not Connected */
              <div className="bg-yellow-900/20 border-2 border-yellow-500 rounded-lg p-6">
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-10 h-10 rounded-full bg-yellow-500 flex items-center justify-center text-white font-bold">
                    2
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-yellow-400 mb-2">Connect Bank Account</h3>
                    <p className="text-yellow-200 text-sm mb-4">
                      Connect your bank account to receive payouts for completed jobs.
                    </p>
                    <button
                      onClick={handleConnectBank}
                      disabled={connectLoading}
                      className="px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition font-semibold disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-primary-500"
                    >
                      {connectLoading ? 'Loading...' : 'Connect Bank Account'}
                    </button>
                    <p className="text-xs text-yellow-200/80 mt-4 flex items-center gap-2">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                      </svg>
                      Powered by Stripe - Your banking information is secure and encrypted.
                    </p>
                  </div>
                </div>
              </div>
            ) : !connectStatus.verified ? (
              /* Scenario B: Connected but Pending Verification */
              <div className="bg-blue-900/20 border-2 border-blue-500 rounded-lg p-6">
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center">
                    <svg className="w-6 h-6 text-white animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-blue-400 mb-2">Bank Verification in Progress</h3>
                    <p className="text-blue-200 text-sm mb-4">
                      Stripe is verifying your bank information. This usually takes 1-2 business days.
                    </p>
                    {!connectStatus.details_submitted && (
                      <p className="text-yellow-300 text-sm mb-4 flex items-center gap-2">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                        You may need to complete your Stripe onboarding. Click below to continue setup.
                      </p>
                    )}
                    <div className="flex gap-3">
                      <button
                        onClick={() => fetchConnectStatus(true)}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-semibold text-sm"
                      >
                        Refresh Status
                      </button>
                      {!connectStatus.details_submitted && (
                        <button
                          onClick={handleConnectBank}
                          disabled={connectLoading}
                          className="px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition font-semibold text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {connectLoading ? 'Loading...' : 'Continue Setup'}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              /* Scenario C: Fully Verified */
              <div className="bg-green-900/20 border-2 border-green-500 rounded-lg p-6">
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-10 h-10 rounded-full bg-green-500 flex items-center justify-center">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-green-400 mb-2">Bank Account Connected</h3>
                    <p className="text-green-200 text-sm mb-4">
                      Your bank account is verified and ready to receive payouts.
                    </p>
                    {connectStatus.bank_last4 && (
                      <div className="bg-gray-800 border border-gray-700 rounded-lg p-4 mb-4">
                        <p className="text-xs text-gray-400 mb-1">Bank Account</p>
                        <p className="text-white font-mono">•••• {connectStatus.bank_last4}</p>
                      </div>
                    )}
                    <div className="flex gap-3">
                      <button
                        onClick={handleConnectBank}
                        disabled={connectLoading}
                        className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition font-semibold text-sm disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-primary-500"
                      >
                        {connectLoading ? 'Loading...' : 'Update Bank Account'}
                      </button>
                      <button
                        onClick={handleDisconnectBank}
                        disabled={disconnecting}
                        className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition font-semibold text-sm disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-red-500"
                      >
                        {disconnecting ? 'Disconnecting...' : 'Disconnect'}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </>
        )}

        {/* Payment Information */}
        <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-white mb-4">How Payouts Work</h3>
          <div className="space-y-3 text-sm text-gray-400">
            <div className="flex items-start gap-3">
              <svg className="w-5 h-5 text-primary-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p>Payouts are processed manually by admins after job completion</p>
            </div>
            <div className="flex items-start gap-3">
              <svg className="w-5 h-5 text-primary-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p>Money arrives in your bank account within 2-7 business days</p>
            </div>
            <div className="flex items-start gap-3">
              <svg className="w-5 h-5 text-primary-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p>All payments are processed securely through Stripe</p>
            </div>
          </div>
        </div>
      </div>
      )}

      {/* Disconnect Bank Account Confirmation Modal */}
      <ConfirmationModal
        isOpen={showDisconnectModal}
        onClose={() => setShowDisconnectModal(false)}
        onConfirm={disconnectBankConfirmed}
        title="Disconnect Bank Account"
        message="Are you sure you want to disconnect your bank account? You will need to reconnect it to receive future payouts."
        confirmText="Disconnect"
        cancelText="Cancel"
        variant="warning"
      />
    </div>
  );
}

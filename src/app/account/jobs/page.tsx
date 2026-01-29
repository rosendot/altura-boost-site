'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAccount, Job } from '@/contexts/AccountContext';
import { useToast } from '@/contexts/ToastContext';

interface JobCredentials {
  game_platform: string;
  username: string;
  password: string;
  two_factor_codes: string[] | null;
}

export default function JobsPage() {
  const router = useRouter();
  const { userData, boosterJobs, boosterJobsLoading, fetchBoosterJobs } = useAccount();
  const { showToast } = useToast();
  const [showProgressModal, setShowProgressModal] = useState(false);
  const [selectedJobForUpdate, setSelectedJobForUpdate] = useState<Job | null>(null);
  const [newProgress, setNewProgress] = useState(0);
  const [progressNotes, setProgressNotes] = useState('');
  const [updatingProgress, setUpdatingProgress] = useState(false);

  // Credential reveal state (intentionally local - credentials are ephemeral)
  const [revealedCredentials, setRevealedCredentials] = useState<Record<string, JobCredentials | null>>({});
  const [revealingCredentials, setRevealingCredentials] = useState<Record<string, boolean>>({});
  const [credentialTimers, setCredentialTimers] = useState<Record<string, number>>({});

  // Redirect if not approved booster
  useEffect(() => {
    if (userData && (userData.role !== 'booster' || userData.booster_approval_status !== 'approved')) {
      router.replace('/account/profile');
    }
  }, [userData, router]);

  const handleOpenProgressModal = (job: Job) => {
    setSelectedJobForUpdate(job);
    setNewProgress(job.progress_percentage);
    setProgressNotes('');
    setShowProgressModal(true);
  };

  const handleCloseProgressModal = () => {
    setShowProgressModal(false);
    setSelectedJobForUpdate(null);
    setNewProgress(0);
    setProgressNotes('');
  };

  const handleUpdateProgress = async () => {
    if (!selectedJobForUpdate) return;

    setUpdatingProgress(true);

    try {
      const response = await fetch(`/api/jobs/${selectedJobForUpdate.id}/progress`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          progress_percentage: newProgress,
          notes: progressNotes,
        }),
      });

      if (response.ok) {
        // Force refresh jobs list after progress update
        await fetchBoosterJobs(true);
        handleCloseProgressModal();
        showToast('Progress updated successfully!', 'success');
      } else {
        const error = await response.json();
        showToast(error.error || 'Failed to update progress. Please try again.', 'error');
      }
    } catch (error) {
      console.error('Error updating progress:', error);
      showToast('Failed to update progress. Please try again.', 'error');
    } finally {
      setUpdatingProgress(false);
    }
  };

  const handleRevealCredentials = async (job: Job) => {
    const jobId = job.id;

    // Already revealing
    if (revealingCredentials[jobId]) return;

    setRevealingCredentials((prev) => ({ ...prev, [jobId]: true }));

    try {
      const response = await fetch(`/api/credentials/${job.order_id}`);

      if (response.ok) {
        const data = await response.json();
        setRevealedCredentials((prev) => ({ ...prev, [jobId]: data.credentials }));

        // Start 15 second countdown
        setCredentialTimers((prev) => ({ ...prev, [jobId]: 15 }));

        const interval = setInterval(() => {
          setCredentialTimers((prev) => {
            const newTime = (prev[jobId] || 0) - 1;
            if (newTime <= 0) {
              clearInterval(interval);
              // Hide credentials when timer expires
              setRevealedCredentials((p) => ({ ...p, [jobId]: null }));
              return { ...prev, [jobId]: 0 };
            }
            return { ...prev, [jobId]: newTime };
          });
        }, 1000);
      } else {
        const error = await response.json();
        showToast(error.error || 'Failed to load credentials', 'error');
      }
    } catch (error) {
      console.error('Error fetching credentials:', error);
      showToast('Failed to load credentials', 'error');
    } finally {
      setRevealingCredentials((prev) => ({ ...prev, [jobId]: false }));
    }
  };

  const copyToClipboard = async (text: string, label: string) => {
    try {
      await navigator.clipboard.writeText(text);
      showToast(`${label} copied to clipboard`, 'success');
    } catch {
      showToast('Failed to copy', 'error');
    }
  };

  if (!userData || userData.role !== 'booster' || userData.booster_approval_status !== 'approved') {
    return null;
  }

  return (
    <div>
      <h2 className="text-2xl font-bold text-white mb-6">My Jobs</h2>

      {boosterJobsLoading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-gray-800 border border-gray-700 rounded-lg p-6 animate-pulse">
              {/* Header skeleton */}
              <div className="flex justify-between items-start mb-4">
                <div>
                  <div className="h-6 bg-gray-700 rounded w-48 mb-2"></div>
                  <div className="h-4 bg-gray-700 rounded w-32 mb-1"></div>
                  <div className="h-3 bg-gray-700 rounded w-24 mt-2"></div>
                </div>
                <div className="text-right">
                  <div className="h-8 bg-gray-700 rounded w-20 mb-2"></div>
                  <div className="h-6 bg-gray-700 rounded w-24"></div>
                </div>
              </div>
              {/* Progress bar skeleton */}
              <div className="mb-4">
                <div className="flex justify-between items-center mb-2">
                  <div className="h-4 bg-gray-700 rounded w-16"></div>
                  <div className="h-4 bg-gray-700 rounded w-10"></div>
                </div>
                <div className="w-full bg-gray-700 rounded-full h-2"></div>
              </div>
              {/* Details skeleton */}
              <div className="border-t border-gray-700 pt-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <div className="h-3 bg-gray-700 rounded w-20 mb-1"></div>
                    <div className="h-4 bg-gray-700 rounded w-full"></div>
                  </div>
                  <div>
                    <div className="h-3 bg-gray-700 rounded w-24 mb-1"></div>
                    <div className="h-4 bg-gray-700 rounded w-16"></div>
                  </div>
                </div>
              </div>
              {/* Button skeleton */}
              <div className="mt-4">
                <div className="h-10 bg-gray-700 rounded w-full"></div>
              </div>
            </div>
          ))}
        </div>
      ) : boosterJobs.length === 0 ? (
        <div className="bg-gray-800 border border-gray-700 rounded-lg p-6 text-center">
          <svg className="w-16 h-16 text-gray-600 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
          <h3 className="text-lg font-semibold text-white mb-2">No Jobs Yet</h3>
          <p className="text-gray-400 text-sm">
            When you accept jobs, they will appear here.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {boosterJobs.map((job) => (
            <div
              key={job.id}
              className="bg-gray-800 border border-gray-700 rounded-lg p-6 hover:border-primary-600 transition"
            >
              {/* Job Header */}
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-xl font-semibold text-white mb-1">
                    {job.service_name}
                  </h3>
                  <p className="text-sm text-gray-400">{job.game_name}</p>
                  <p className="text-xs text-gray-500 mt-1">Job ID: {job.job_number}</p>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-green-400">
                    ${job.payout_amount}
                  </p>
                  <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold mt-2 ${
                    job.status === 'completed'
                      ? 'bg-green-900/50 text-green-400 border border-green-500'
                      : job.status === 'in_progress'
                      ? 'bg-blue-900/50 text-blue-400 border border-blue-500'
                      : job.status === 'accepted'
                      ? 'bg-purple-900/50 text-purple-400 border border-purple-500'
                      : 'bg-gray-700 text-gray-300 border border-gray-600'
                  }`}>
                    {job.status.toUpperCase().replace('_', ' ')}
                  </span>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="mb-4">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm text-gray-400">Progress</span>
                  <span className="text-sm font-semibold text-white">
                    {job.progress_percentage}%
                  </span>
                </div>
                <div className="w-full bg-gray-700 rounded-full h-2">
                  <div
                    className="bg-gradient-to-r from-primary-600 to-primary-500 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${job.progress_percentage}%` }}
                  />
                </div>
              </div>

              {/* Job Details */}
              <div className="border-t border-gray-700 pt-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Requirements</p>
                    <p className="text-sm text-white">{job.requirements}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Weapon Class</p>
                    <p className="text-sm text-white">{job.weapon_class || 'N/A'}</p>
                  </div>
                </div>
              </div>

              {/* Customer Account Credentials */}
              {job.status !== 'completed' && (
                <div className="border-t border-gray-700 pt-4 mt-4">
                  <div className="bg-gray-900 border border-gray-600 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="text-sm font-semibold text-white flex items-center gap-2">
                        <svg className="w-4 h-4 text-primary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                        </svg>
                        Customer Account Credentials
                      </h4>
                      {credentialTimers[job.id] > 0 && (
                        <span className="text-xs text-yellow-400 flex items-center gap-1">
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          {credentialTimers[job.id]}s
                        </span>
                      )}
                    </div>

                    {revealedCredentials[job.id] ? (
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-gray-400">Platform:</span>
                          <span className="text-sm text-white">{revealedCredentials[job.id]?.game_platform}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-gray-400">Username:</span>
                          <div className="flex items-center gap-2">
                            <span className="text-sm text-white font-mono">{revealedCredentials[job.id]?.username}</span>
                            <button
                              onClick={() => copyToClipboard(revealedCredentials[job.id]?.username || '', 'Username')}
                              className="text-primary-400 hover:text-primary-300 p-1"
                              title="Copy username"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                              </svg>
                            </button>
                          </div>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-gray-400">Password:</span>
                          <div className="flex items-center gap-2">
                            <span className="text-sm text-white font-mono">{revealedCredentials[job.id]?.password}</span>
                            <button
                              onClick={() => copyToClipboard(revealedCredentials[job.id]?.password || '', 'Password')}
                              className="text-primary-400 hover:text-primary-300 p-1"
                              title="Copy password"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                              </svg>
                            </button>
                          </div>
                        </div>
                        {revealedCredentials[job.id]?.two_factor_codes && revealedCredentials[job.id]!.two_factor_codes!.length > 0 && (
                          <div>
                            <span className="text-xs text-gray-400">2FA Codes:</span>
                            <div className="mt-1 flex flex-wrap gap-2">
                              {revealedCredentials[job.id]!.two_factor_codes!.map((code, idx) => (
                                <button
                                  key={idx}
                                  onClick={() => copyToClipboard(code, '2FA code')}
                                  className="px-2 py-1 bg-gray-800 text-white text-xs font-mono rounded hover:bg-gray-700 transition"
                                  title="Click to copy"
                                >
                                  {code}
                                </button>
                              ))}
                            </div>
                          </div>
                        )}
                        <p className="text-xs text-yellow-500 mt-2">
                          Credentials will hide in {credentialTimers[job.id]} seconds
                        </p>
                      </div>
                    ) : (
                      <div>
                        <p className="text-xs text-gray-400 mb-3">
                          Click to reveal the customer&apos;s game account credentials. You have 2 reveals per day.
                        </p>
                        <button
                          onClick={() => handleRevealCredentials(job)}
                          disabled={revealingCredentials[job.id]}
                          className="w-full py-2 bg-gray-700 text-white text-sm rounded hover:bg-gray-600 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                          {revealingCredentials[job.id] ? (
                            <>
                              <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                              </svg>
                              Loading...
                            </>
                          ) : (
                            <>
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                              </svg>
                              Reveal Credentials
                            </>
                          )}
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Update Progress Button */}
              {job.status !== 'completed' && (
                <div className="mt-4">
                  <button
                    onClick={() => handleOpenProgressModal(job)}
                    className="w-full py-2.5 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition font-bold focus:outline-none focus:ring-2 focus:ring-primary-500"
                  >
                    UPDATE PROGRESS
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Progress Update Modal */}
      {showProgressModal && selectedJobForUpdate && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-900 border border-primary-700 rounded-lg p-8 max-w-md w-full">
            <h3 className="text-2xl font-bold mb-4 text-white">
              Update Job Progress
            </h3>
            <p className="text-gray-400 mb-2 text-sm">
              Job: {selectedJobForUpdate.service_name}
            </p>
            <p className="text-gray-500 mb-6 text-xs">
              Current Progress: {selectedJobForUpdate.progress_percentage}%
            </p>

            {/* Progress Slider */}
            <div className="mb-6">
              <label className="block text-sm text-gray-400 mb-2">
                New Progress: {newProgress}%
              </label>
              <input
                type="range"
                min="0"
                max="100"
                value={newProgress}
                onChange={(e) => setNewProgress(Number(e.target.value))}
                className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-primary-600"
              />
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>0%</span>
                <span>50%</span>
                <span>100%</span>
              </div>

              {/* Quick Set Buttons */}
              <div className="flex gap-2 mt-3">
                {[0, 25, 50, 75, 100].map((percentage) => (
                  <button
                    key={percentage}
                    onClick={() => setNewProgress(percentage)}
                    className={`flex-1 py-2 rounded-lg text-xs font-semibold transition ${
                      newProgress === percentage
                        ? 'bg-primary-600 text-white'
                        : 'bg-gray-800 text-gray-400 hover:bg-gray-700 hover:text-white'
                    }`}
                  >
                    {percentage}%
                  </button>
                ))}
              </div>
            </div>

            {/* Progress Notes */}
            <div className="mb-6">
              <label className="block text-sm text-gray-400 mb-2">
                Notes (Optional)
              </label>
              <textarea
                value={progressNotes}
                onChange={(e) => setProgressNotes(e.target.value)}
                placeholder="Add any notes about this progress update..."
                className="w-full px-4 py-3 bg-gray-800 border border-primary-700 text-white rounded-lg focus:outline-none focus:border-primary-500 transition resize-none"
                rows={3}
              />
            </div>

            {/* Action Buttons */}
            <div className="flex gap-4">
              <button
                onClick={handleCloseProgressModal}
                disabled={updatingProgress}
                className="flex-1 py-3 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Cancel
              </button>
              <button
                onClick={handleUpdateProgress}
                disabled={updatingProgress}
                className="flex-1 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition font-bold disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {updatingProgress ? 'Updating...' : 'Update'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

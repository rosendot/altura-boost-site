'use client';

import { useState, useEffect } from 'react';
import { useSocket } from '@/hooks/useSocket';

interface Job {
  id: string;
  job_number: string;
  service_name: string;
  game_name: string;
  payout_amount: number;
  estimated_hours: number;
  requirements: string;
  weapon_class: string | null;
}

export default function BoosterHub() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedJob, setExpandedJob] = useState<string | null>(null);
  const [selectedJob, setSelectedJob] = useState<string | null>(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  const {
    isConnected,
    activeBoostersCount,
    joinBoosterHub,
    onJobUpdate,
    onJobAccepted,
    onNewJob,
    offJobUpdate,
    offJobAccepted,
    offNewJob
  } = useSocket();

  useEffect(() => {
    fetchAvailableJobs();
  }, []);

  // Socket.IO real-time updates
  useEffect(() => {
    if (isConnected) {
      // Join the booster hub room
      joinBoosterHub();

      // Handle new jobs being created
      const handleNewJob = (newJob: Job) => {
        setJobs((prevJobs) => [newJob, ...prevJobs]);
      };

      // Handle jobs being accepted by other boosters
      const handleJobAccepted = (data: { jobId: string }) => {
        setJobs((prevJobs) => prevJobs.filter((job) => job.id !== data.jobId));
      };

      // Handle general job updates
      const handleJobUpdate = (updatedJob: Job) => {
        setJobs((prevJobs) => {
          const index = prevJobs.findIndex((job) => job.id === updatedJob.id);
          if (index !== -1) {
            const newJobs = [...prevJobs];
            newJobs[index] = updatedJob;
            return newJobs;
          }
          return prevJobs;
        });
      };

      // Register event listeners
      onNewJob(handleNewJob);
      onJobAccepted(handleJobAccepted);
      onJobUpdate(handleJobUpdate);

      // Cleanup listeners on unmount
      return () => {
        offNewJob(handleNewJob);
        offJobAccepted(handleJobAccepted);
        offJobUpdate(handleJobUpdate);
      };
    }
  }, [isConnected, joinBoosterHub, onJobUpdate, onJobAccepted, onNewJob, offJobUpdate, offJobAccepted, offNewJob]);

  const fetchAvailableJobs = async () => {
    try {
      const response = await fetch('/api/jobs/available');

      if (response.ok) {
        const data = await response.json();
        setJobs(data.jobs || []);
      } else {
        console.error('Failed to fetch jobs');
        setJobs([]);
      }
    } catch (error) {
      console.error('Error fetching jobs:', error);
      setJobs([]);
    } finally {
      setLoading(false);
    }
  };

  const toggleExpand = (jobId: string) => {
    setExpandedJob(expandedJob === jobId ? null : jobId);
  };

  const handleAcceptJob = async (jobId: string) => {
    setSelectedJob(jobId);
    setShowConfirmModal(true);
  };

  const handleQuickAccept = async (jobId: string) => {
    try {
      const response = await fetch(`/api/jobs/${jobId}/accept`, {
        method: 'POST',
      });

      if (response.ok) {
        // Refresh jobs list
        await fetchAvailableJobs();
        alert('Job accepted successfully!');
      } else {
        const error = await response.json();
        alert(error.error || 'Failed to accept job. Please try again.');
      }
    } catch (error) {
      console.error('Error accepting job:', error);
      alert('Failed to accept job. Please try again.');
    }
  };

  const confirmAcceptance = async () => {
    if (!selectedJob) return;

    try {
      const response = await fetch(`/api/jobs/${selectedJob}/accept`, {
        method: 'POST',
      });

      if (response.ok) {
        // Refresh jobs list
        await fetchAvailableJobs();
        setShowConfirmModal(false);
        setSelectedJob(null);
        alert('Job accepted! Redirecting to My Jobs...');
      } else {
        const error = await response.json();
        alert(error.error || 'Failed to accept job. Please try again.');
      }
    } catch (error) {
      console.error('Error accepting job:', error);
      alert('Failed to accept job. Please try again.');
    }
  };

  if (loading) {
    return (
      <main className="min-h-screen bg-black pb-12">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-center py-20">
            <div className="text-gray-400">Loading available jobs...</div>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-black pt-24 pb-12">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-4xl font-bold text-white">Booster Hub</h1>
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`}></div>
            <span className="text-sm text-gray-400">
              {isConnected ? 'Live' : 'Connecting...'}
            </span>
            {isConnected && activeBoostersCount > 0 && (
              <span className="text-sm text-gray-500">
                • {activeBoostersCount} booster{activeBoostersCount !== 1 ? 's' : ''} active
              </span>
            )}
          </div>
        </div>
        <p className="text-gray-400 mb-8">
          Browse available jobs and accept ones that match your skills. Jobs update in real-time.
        </p>

        {/* Available Jobs List */}
        {jobs.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-400 text-lg">No available jobs at the moment</p>
            <p className="text-gray-500 text-sm mt-2">Check back later for new opportunities</p>
          </div>
        ) : (
          <div className="space-y-2">
            {jobs.map((job) => (
              <div
                key={job.id}
                className="bg-gray-900 border border-primary-700 rounded-lg overflow-hidden card-glow transition hover:border-primary-500"
              >
                {/* Compact Row */}
                <div className="flex items-center gap-4 p-4">
                  <div
                    onClick={() => toggleExpand(job.id)}
                    className="flex-1 min-w-0 cursor-pointer hover:opacity-80 transition"
                  >
                    <h3 className="text-lg font-semibold text-white truncate">
                      {job.service_name}
                    </h3>
                    <p className="text-sm text-gray-400">{job.game_name}</p>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <div className="text-right">
                      <p className="text-xl font-bold text-green-400">
                        ${job.payout_amount.toFixed(2)}
                      </p>
                    </div>
                    <div className="text-right min-w-[70px]">
                      <p className="text-sm text-gray-400">Est. Hours</p>
                      <p className="text-white font-semibold">{job.estimated_hours}h</p>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleQuickAccept(job.id);
                      }}
                      className="px-4 py-2 bg-primary-600 text-white text-sm rounded-lg hover:bg-primary-700 transition font-bold whitespace-nowrap"
                    >
                      Quick Accept
                    </button>
                    <button
                      onClick={() => toggleExpand(job.id)}
                      className="text-gray-400 hover:text-white transition p-2"
                    >
                      <svg
                        className={`w-5 h-5 transition-transform ${
                          expandedJob === job.id ? 'rotate-180' : ''
                        }`}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M19 9l-7 7-7-7"
                        />
                      </svg>
                    </button>
                  </div>
                </div>

                {/* Expanded Details */}
                {expandedJob === job.id && (
                  <div className="border-t border-gray-700 p-4 bg-gray-800/50">
                    <div className="mb-4">
                      <p className="text-xs text-gray-500 mb-1">Job ID</p>
                      <p className="text-sm text-gray-300">{job.job_number}</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <div>
                        <p className="text-xs text-gray-500 mb-1">Requirements</p>
                        <p className="text-sm text-white">{job.requirements}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 mb-1">Weapon Class</p>
                        <p className="text-sm text-white">{job.weapon_class || 'N/A'}</p>
                      </div>
                    </div>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleAcceptJob(job.id);
                      }}
                      className="w-full py-2.5 gradient-purple text-white rounded-lg hover:opacity-90 transition font-bold"
                    >
                      ACCEPT JOB
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Confirmation Modal */}
        {showConfirmModal && (
          <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
            <div className="bg-gray-900 border border-primary-700 rounded-lg p-8 max-w-md w-full">
              <h3 className="text-2xl font-bold mb-4 text-white">
                Confirm Job Acceptance
              </h3>
              <p className="text-gray-400 mb-6">
                Are you sure you want to accept this job? Once accepted, you&apos;ll be
                responsible for completing it within the estimated timeframe.
              </p>
              <div className="flex gap-4">
                <button
                  onClick={() => setShowConfirmModal(false)}
                  className="flex-1 py-3 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition font-semibold"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmAcceptance}
                  className="flex-1 py-3 gradient-purple text-white rounded-lg hover:opacity-90 transition font-bold"
                >
                  Yes, Accept
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}

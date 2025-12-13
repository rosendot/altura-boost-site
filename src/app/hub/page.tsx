'use client';

import { useState, useEffect, useMemo } from 'react';
import { useSocket } from '@/hooks/useSocket';
import { timeAgo, isJobNew } from '@/utils/timeAgo';

interface Job {
  id: string;
  job_number: string;
  service_name: string;
  game_name: string;
  payout_amount: number;
  estimated_hours: number;
  requirements: string;
  weapon_class: string | null;
  created_at: string;
}

type SortOption = 'newest' | 'oldest' | 'payout-high' | 'payout-low' | 'hours-low' | 'hours-high' | 'hourly-rate';

export default function BoosterHub() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedJob, setExpandedJob] = useState<string | null>(null);
  const [selectedJob, setSelectedJob] = useState<string | null>(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [currentTime, setCurrentTime] = useState(Date.now());

  // Filter states
  const [selectedGame, setSelectedGame] = useState<string>('all');
  const [minPayout, setMinPayout] = useState<number>(0);
  const [maxPayout, setMaxPayout] = useState<number>(1000);
  const [maxHours, setMaxHours] = useState<number>(100);
  const [selectedWeaponClass, setSelectedWeaponClass] = useState<string>('all');

  // Sort state
  const [sortBy, setSortBy] = useState<SortOption>('newest');

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

  // Update time every minute for "time ago" display
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(Date.now());
    }, 60000); // Update every minute

    return () => clearInterval(interval);
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

  // Get unique values for filters
  const uniqueGames = useMemo(() => {
    const games = jobs.map(job => job.game_name);
    return ['all', ...Array.from(new Set(games))];
  }, [jobs]);

  const uniqueWeaponClasses = useMemo(() => {
    const classes = jobs.map(job => job.weapon_class).filter(Boolean) as string[];
    return ['all', ...Array.from(new Set(classes))];
  }, [jobs]);

  // Filter and sort jobs
  const filteredAndSortedJobs = useMemo(() => {
    let filtered = jobs.filter(job => {
      // Game filter
      if (selectedGame !== 'all' && job.game_name !== selectedGame) return false;

      // Payout filter
      if (job.payout_amount < minPayout || job.payout_amount > maxPayout) return false;

      // Hours filter
      if (job.estimated_hours > maxHours) return false;

      // Weapon class filter
      if (selectedWeaponClass !== 'all' && job.weapon_class !== selectedWeaponClass) return false;

      return true;
    });

    // Sort
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'newest':
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        case 'oldest':
          return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
        case 'payout-high':
          return b.payout_amount - a.payout_amount;
        case 'payout-low':
          return a.payout_amount - b.payout_amount;
        case 'hours-low':
          return a.estimated_hours - b.estimated_hours;
        case 'hours-high':
          return b.estimated_hours - a.estimated_hours;
        case 'hourly-rate':
          const rateA = a.payout_amount / a.estimated_hours;
          const rateB = b.payout_amount / b.estimated_hours;
          return rateB - rateA;
        default:
          return 0;
      }
    });

    return filtered;
  }, [jobs, selectedGame, minPayout, maxPayout, maxHours, selectedWeaponClass, sortBy]);

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
        <p className="text-gray-400 mb-6">
          Browse available jobs and accept ones that match your skills. Jobs update in real-time.
        </p>

        {/* Filters and Sort */}
        <div className="bg-gray-900 border border-gray-700 rounded-lg p-4 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            {/* Game Filter */}
            <div>
              <label className="block text-xs text-gray-400 mb-1">Game</label>
              <select
                value={selectedGame}
                onChange={(e) => setSelectedGame(e.target.value)}
                className="w-full bg-gray-800 border border-gray-700 text-white text-sm rounded px-3 py-2 focus:outline-none focus:border-primary-500"
              >
                {uniqueGames.map((game) => (
                  <option key={game} value={game}>
                    {game === 'all' ? 'All Games' : game}
                  </option>
                ))}
              </select>
            </div>

            {/* Payout Range */}
            <div>
              <label className="block text-xs text-gray-400 mb-1">Min Payout</label>
              <input
                type="number"
                value={minPayout}
                onChange={(e) => setMinPayout(Number(e.target.value))}
                className="w-full bg-gray-800 border border-gray-700 text-white text-sm rounded px-3 py-2 focus:outline-none focus:border-primary-500"
                placeholder="$0"
              />
            </div>

            <div>
              <label className="block text-xs text-gray-400 mb-1">Max Payout</label>
              <input
                type="number"
                value={maxPayout}
                onChange={(e) => setMaxPayout(Number(e.target.value))}
                className="w-full bg-gray-800 border border-gray-700 text-white text-sm rounded px-3 py-2 focus:outline-none focus:border-primary-500"
                placeholder="$1000"
              />
            </div>

            {/* Max Hours */}
            <div>
              <label className="block text-xs text-gray-400 mb-1">Max Hours</label>
              <input
                type="number"
                value={maxHours}
                onChange={(e) => setMaxHours(Number(e.target.value))}
                className="w-full bg-gray-800 border border-gray-700 text-white text-sm rounded px-3 py-2 focus:outline-none focus:border-primary-500"
                placeholder="100"
              />
            </div>

            {/* Weapon Class */}
            <div>
              <label className="block text-xs text-gray-400 mb-1">Weapon Class</label>
              <select
                value={selectedWeaponClass}
                onChange={(e) => setSelectedWeaponClass(e.target.value)}
                className="w-full bg-gray-800 border border-gray-700 text-white text-sm rounded px-3 py-2 focus:outline-none focus:border-primary-500"
              >
                {uniqueWeaponClasses.map((wc) => (
                  <option key={wc} value={wc}>
                    {wc === 'all' ? 'All Classes' : wc}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Sort Options */}
          <div className="mt-4 pt-4 border-t border-gray-700">
            <label className="block text-xs text-gray-400 mb-2">Sort By</label>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setSortBy('newest')}
                className={`px-3 py-1.5 text-xs rounded transition ${
                  sortBy === 'newest'
                    ? 'bg-primary-600 text-white'
                    : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                }`}
              >
                Newest First
              </button>
              <button
                onClick={() => setSortBy('oldest')}
                className={`px-3 py-1.5 text-xs rounded transition ${
                  sortBy === 'oldest'
                    ? 'bg-primary-600 text-white'
                    : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                }`}
              >
                Oldest First
              </button>
              <button
                onClick={() => setSortBy('payout-high')}
                className={`px-3 py-1.5 text-xs rounded transition ${
                  sortBy === 'payout-high'
                    ? 'bg-primary-600 text-white'
                    : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                }`}
              >
                Highest Payout
              </button>
              <button
                onClick={() => setSortBy('payout-low')}
                className={`px-3 py-1.5 text-xs rounded transition ${
                  sortBy === 'payout-low'
                    ? 'bg-primary-600 text-white'
                    : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                }`}
              >
                Lowest Payout
              </button>
              <button
                onClick={() => setSortBy('hours-low')}
                className={`px-3 py-1.5 text-xs rounded transition ${
                  sortBy === 'hours-low'
                    ? 'bg-primary-600 text-white'
                    : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                }`}
              >
                Quickest Jobs
              </button>
              <button
                onClick={() => setSortBy('hours-high')}
                className={`px-3 py-1.5 text-xs rounded transition ${
                  sortBy === 'hours-high'
                    ? 'bg-primary-600 text-white'
                    : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                }`}
              >
                Longest Jobs
              </button>
              <button
                onClick={() => setSortBy('hourly-rate')}
                className={`px-3 py-1.5 text-xs rounded transition ${
                  sortBy === 'hourly-rate'
                    ? 'bg-primary-600 text-white'
                    : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                }`}
              >
                Best $/Hour
              </button>
            </div>
          </div>
        </div>

        {/* Job Count */}
        <div className="mb-4 text-sm text-gray-400">
          Showing {filteredAndSortedJobs.length} of {jobs.length} jobs
        </div>

        {/* Available Jobs List */}
        {filteredAndSortedJobs.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-400 text-lg">No available jobs at the moment</p>
            <p className="text-gray-500 text-sm mt-2">Check back later for new opportunities</p>
          </div>
        ) : (
          <div className="space-y-2">
            {filteredAndSortedJobs.map((job) => (
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
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="text-lg font-semibold text-white truncate">
                        {job.service_name}
                      </h3>
                      {isJobNew(job.created_at) && (
                        <span className="px-2 py-0.5 bg-green-500 text-white text-xs font-bold rounded">
                          NEW
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-400">
                      <span>{job.game_name}</span>
                      <span>•</span>
                      <span className="text-xs">{timeAgo(job.created_at)}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <div className="text-right">
                      <p className="text-xl font-bold text-green-400">
                        ${job.payout_amount.toFixed(2)}
                      </p>
                      <p className="text-xs text-gray-500">
                        ${(job.payout_amount / job.estimated_hours).toFixed(2)}/hr
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

'use client';

import { useState, useEffect, useMemo } from 'react';
import { timeAgo, isJobNew } from '@/utils/timeAgo';

// Skeleton loader for job cards
const JobSkeleton = () => (
  <div className="bg-gray-900 border border-gray-700 rounded-lg overflow-hidden animate-pulse">
    <div className="flex items-center gap-4 p-4">
      <div className="flex-1 min-w-0">
        <div className="h-6 bg-gray-700 rounded w-2/3 mb-2"></div>
        <div className="h-4 bg-gray-700 rounded w-1/2"></div>
      </div>
      <div className="flex items-center gap-3 shrink-0">
        <div className="text-right">
          <div className="h-6 bg-gray-700 rounded w-20 mb-1"></div>
        </div>
        <div className="text-right min-w-[70px]">
          <div className="h-4 bg-gray-700 rounded w-16 mb-1"></div>
          <div className="h-5 bg-gray-700 rounded w-12"></div>
        </div>
        <div className="h-10 bg-gray-700 rounded w-28"></div>
        <div className="h-10 bg-gray-700 rounded w-10"></div>
      </div>
    </div>
  </div>
);

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

type SortOption = 'newest' | 'oldest' | 'payout-high' | 'hours-low';

const POLLING_INTERVAL = 30000; // 30 seconds

export default function BoosterHub() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [expandedJob, setExpandedJob] = useState<string | null>(null);
  const [selectedJob, setSelectedJob] = useState<string | null>(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [currentTime, setCurrentTime] = useState(Date.now());
  const [suspended, setSuspended] = useState(false);
  const [suspensionReason, setSuspensionReason] = useState<string | null>(null);
  const [secondsUntilRefresh, setSecondsUntilRefresh] = useState(30);
  const [stripeNotConnected, setStripeNotConnected] = useState(false);
  const [stripeNotVerified, setStripeNotVerified] = useState(false);
  const [checkingStripe, setCheckingStripe] = useState(true);

  // Filter states
  const [selectedGame, setSelectedGame] = useState<string>('all');
  const [minPayout, setMinPayout] = useState<number>(0);
  const [maxPayout, setMaxPayout] = useState<number>(1000);
  const [maxHours, setMaxHours] = useState<number>(100);
  const [selectedWeaponClass, setSelectedWeaponClass] = useState<string>('all');

  // Sort state
  const [sortBy, setSortBy] = useState<SortOption>('newest');

  // Initial fetch
  useEffect(() => {
    fetchAvailableJobs();
    checkStripeStatus();
  }, []);

  // Countdown timer that updates every second
  useEffect(() => {
    const interval = setInterval(() => {
      setSecondsUntilRefresh((prev) => {
        if (prev <= 1) {
          return 30; // Reset to 30 when it hits 0
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  // Polling for job updates every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      fetchAvailableJobs(true); // Pass true for background refresh
      setSecondsUntilRefresh(30); // Reset countdown
    }, POLLING_INTERVAL);

    return () => clearInterval(interval);
  }, []);

  // Update time every minute for "time ago" display
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(Date.now());
    }, 60000); // Update every minute

    return () => clearInterval(interval);
  }, []);

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
        case 'hours-low':
          return a.estimated_hours - b.estimated_hours;
        default:
          return 0;
      }
    });

    return filtered;
  }, [jobs, selectedGame, minPayout, maxPayout, maxHours, selectedWeaponClass, sortBy]);

  const checkStripeStatus = async () => {
    setCheckingStripe(true);
    try {
      const response = await fetch('/api/boosters/connect/status');

      if (response.ok) {
        const data = await response.json();
        setStripeNotConnected(!data.connected);
        setStripeNotVerified(data.connected && !data.verified);
      } else {
        // If API fails, assume not connected to be safe
        setStripeNotConnected(true);
        setStripeNotVerified(false);
      }
    } catch (error) {
      console.error('Error checking Stripe status:', error);
      // If network error, assume not connected to be safe
      setStripeNotConnected(true);
      setStripeNotVerified(false);
    } finally {
      setCheckingStripe(false);
    }
  };

  const fetchAvailableJobs = async (isBackgroundRefresh = false) => {
    if (isBackgroundRefresh) {
      setIsRefreshing(true);
    }

    try {
      const response = await fetch('/api/jobs/available');

      if (response.ok) {
        const data = await response.json();
        setJobs(data.jobs || []);
        setSuspended(false);
      } else if (response.status === 403) {
        const data = await response.json();
        if (data.suspended) {
          setSuspended(true);
          setSuspensionReason(data.suspension_reason || null);
          setJobs([]);
        }
      } else {
        console.error('Failed to fetch jobs');
        setJobs([]);
      }
    } catch (error) {
      console.error('Error fetching jobs:', error);
      setJobs([]);
    } finally {
      if (isBackgroundRefresh) {
        setIsRefreshing(false);
      }
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

  // Show loading screen while checking Stripe status
  if (checkingStripe) {
    return (
      <main className="min-h-screen bg-black pt-24 pb-12">
        <div className="max-w-7xl mx-auto px-4">
          <div className="max-w-2xl mx-auto">
            <div className="bg-gray-900 border border-gray-700 rounded-lg p-8 text-center">
              <div className="mb-4">
                <svg className="w-16 h-16 text-primary-500 mx-auto animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              </div>
              <h2 className="text-xl font-semibold text-white mb-2">Loading...</h2>
              <p className="text-gray-400 text-sm">Checking account status</p>
            </div>
          </div>
        </div>
      </main>
    );
  }

  if (suspended) {
    return (
      <main className="min-h-screen bg-black pt-24 pb-12">
        <div className="max-w-7xl mx-auto px-4">
          <div className="max-w-2xl mx-auto">
            <div className="bg-red-900/20 border-2 border-red-500 rounded-lg p-8 text-center">
              <div className="mb-4">
                <svg className="w-16 h-16 text-red-500 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <h1 className="text-3xl font-bold text-red-400 mb-4">Account Suspended</h1>
              <p className="text-gray-300 mb-6">
                Your account has been suspended and you cannot access the jobs board.
              </p>
              {suspensionReason && (
                <div className="bg-gray-900 border border-gray-700 rounded-lg p-4 mb-6">
                  <p className="text-sm text-gray-400 mb-1">Reason:</p>
                  <p className="text-white">{suspensionReason}</p>
                </div>
              )}
              <p className="text-gray-400 mb-6">
                If you believe this is a mistake, you can submit an appeal from your account page.
              </p>
              <a
                href="/account"
                className="inline-block px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition font-semibold"
              >
                Go to Account Page
              </a>
            </div>
          </div>
        </div>
      </main>
    );
  }

  if (stripeNotConnected) {
    return (
      <main className="min-h-screen bg-black pt-24 pb-12">
        <div className="max-w-7xl mx-auto px-4">
          <div className="max-w-2xl mx-auto">
            <div className="bg-yellow-900/20 border-2 border-yellow-500 rounded-lg p-8 text-center">
              <div className="mb-4">
                <svg className="w-16 h-16 text-yellow-500 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h1 className="text-3xl font-bold text-yellow-400 mb-4">Bank Account Required</h1>
              <p className="text-gray-300 mb-6">
                You need to connect your bank account before you can accept jobs.
              </p>
              <p className="text-gray-400 mb-6">
                Go to your Earnings tab to connect your bank account via Stripe. This is required to receive payouts for completed jobs.
              </p>
              <a
                href="/account?tab=earnings"
                className="inline-block px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition font-semibold"
              >
                Connect Bank Account
              </a>
            </div>
          </div>
        </div>
      </main>
    );
  }

  if (stripeNotVerified) {
    return (
      <main className="min-h-screen bg-black pt-24 pb-12">
        <div className="max-w-7xl mx-auto px-4">
          <div className="max-w-2xl mx-auto">
            <div className="bg-blue-900/20 border-2 border-blue-500 rounded-lg p-8 text-center">
              <div className="mb-4">
                <svg className="w-16 h-16 text-blue-500 mx-auto animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              </div>
              <h1 className="text-3xl font-bold text-blue-400 mb-4">Verification in Progress</h1>
              <p className="text-gray-300 mb-6">
                Your bank account is being verified by Stripe.
              </p>
              <p className="text-gray-400 mb-6">
                This usually takes 1-2 business days. You&apos;ll be able to accept jobs once your account is verified.
              </p>
              <div className="flex gap-4 justify-center">
                <button
                  onClick={() => {
                    checkStripeStatus();
                  }}
                  className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-semibold"
                >
                  Refresh Status
                </button>
                <a
                  href="/account?tab=earnings"
                  className="inline-block px-6 py-3 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition font-semibold"
                >
                  View Earnings
                </a>
              </div>
            </div>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-black pt-24 pb-12 relative">
      {/* Purple glow overlay effect */}
      <div
        className={`fixed inset-0 pointer-events-none transition-opacity duration-500 ${
          isRefreshing ? 'opacity-100' : 'opacity-0'
        }`}
        style={{
          background: 'radial-gradient(circle at center, rgba(168, 85, 247, 0.15) 0%, transparent 70%)',
          boxShadow: 'inset 0 0 100px rgba(168, 85, 247, 0.3)'
        }}
      />
      <div className="max-w-7xl mx-auto px-4 relative z-10">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-4xl font-bold text-white">Booster Hub</h1>
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full transition-all ${
              isRefreshing
                ? 'bg-purple-500 animate-pulse'
                : 'bg-green-500 animate-pulse'
            }`}></div>
            <span className="text-sm text-gray-400">
              {isRefreshing ? 'Refreshing jobs...' : `Auto-refreshing in ${secondsUntilRefresh}s`}
            </span>
          </div>
        </div>
        <p className="text-gray-400 mb-6">
          Browse available jobs and accept ones that match your skills. Jobs update automatically every 30 seconds.
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
                onClick={() => setSortBy('hours-low')}
                className={`px-3 py-1.5 text-xs rounded transition ${
                  sortBy === 'hours-low'
                    ? 'bg-primary-600 text-white'
                    : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                }`}
              >
                Quickest Jobs
              </button>
            </div>
          </div>
        </div>

        {/* Job Count */}
        <div className="mb-4 text-sm text-gray-400">
          Showing {filteredAndSortedJobs.length} of {jobs.length} jobs
        </div>

        {/* Available Jobs List */}
        {jobs.length === 0 ? (
          <div className="space-y-2">
            <JobSkeleton />
            <JobSkeleton />
            <JobSkeleton />
            <JobSkeleton />
            <JobSkeleton />
          </div>
        ) : filteredAndSortedJobs.length === 0 ? (
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

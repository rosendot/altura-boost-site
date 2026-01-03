'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import ReviewModal from '@/components/ReviewModal';

interface UserData {
  id: string;
  email: string;
  full_name: string | null;
  phone: string | null;
  role: 'customer' | 'booster' | 'admin';
  created_at: string;
  total_earnings?: number;
  booster_approval_status?: 'pending' | 'approved' | 'rejected' | null;
  is_suspended?: boolean;
  suspended_at?: string | null;
  suspension_reason?: string | null;
  can_appeal?: boolean;
  appeal_status?: 'none' | 'pending' | 'approved' | 'rejected' | null;
  strike_count?: number;
}

interface Order {
  id: string;
  order_number: string;
  total_price: number;
  status: string;
  progress_percentage: number;
  created_at: string;
  paid_at: string | null;
  completed_at: string | null;
}

interface Job {
  id: string;
  job_number: string;
  service_name: string;
  game_name: string;
  status: string;
  progress_percentage: number;
  booster_id: string | null;
  accepted_at: string | null;
  completed_at: string | null;
  payout_amount: number;
  requirements: string;
  weapon_class: string | null;
  booster?: {
    full_name: string | null;
    email: string;
  };
}

interface Review {
  id: string;
  rating: number;
  quality_rating: number | null;
  communication_rating: number | null;
  timeliness_rating: number | null;
  review_text: string | null;
  delivery_status: string;
  created_at: string;
}

interface CompletedJob {
  id: string;
  job_number: string;
  service_name: string;
  game_name: string;
  status: string;
  completed_at: string;
  booster_id: string;
  booster: {
    id: string;
    full_name: string | null;
    email: string;
  };
  has_review: boolean;
  review: Review | null;
}

interface BoosterReview {
  id: string;
  rating: number;
  quality_rating: number | null;
  communication_rating: number | null;
  timeliness_rating: number | null;
  review_text: string | null;
  delivery_status: string;
  created_at: string;
  job_id: string;
  jobs: {
    job_number: string;
    service_name: string;
    game_name: string;
    completed_at: string;
  } | null;
  customer: {
    id: string;
    full_name: string | null;
    email: string;
  } | null;
}

export default function AccountPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('profile');
  const [orders, setOrders] = useState<Order[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [orderJobs, setOrderJobs] = useState<Record<string, Job[]>>({});
  const [boosterJobs, setBoosterJobs] = useState<Job[]>([]);
  const [boosterJobsLoading, setBoosterJobsLoading] = useState(false);
  const [showProgressModal, setShowProgressModal] = useState(false);
  const [selectedJobForUpdate, setSelectedJobForUpdate] = useState<Job | null>(null);
  const [newProgress, setNewProgress] = useState(0);
  const [progressNotes, setProgressNotes] = useState('');
  const [updatingProgress, setUpdatingProgress] = useState(false);
  const [editedFullName, setEditedFullName] = useState('');
  const [editedPhone, setEditedPhone] = useState('');
  const [completedJobs, setCompletedJobs] = useState<CompletedJob[]>([]);
  const [completedJobsLoading, setCompletedJobsLoading] = useState(false);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [selectedJobForReview, setSelectedJobForReview] = useState<CompletedJob | null>(null);
  const [boosterReviews, setBoosterReviews] = useState<BoosterReview[]>([]);
  const [boosterReviewsLoading, setBoosterReviewsLoading] = useState(false);
  const [appealText, setAppealText] = useState('');
  const [submittingAppeal, setSubmittingAppeal] = useState(false);
  const [connectStatus, setConnectStatus] = useState<{
    connected: boolean;
    verified: boolean;
    details_submitted: boolean;
    bank_last4: string | null;
  } | null>(null);
  const [connectLoading, setConnectLoading] = useState(false);
  const [disconnecting, setDisconnecting] = useState(false);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await fetch('/api/user/me');

        if (response.ok) {
          const data = await response.json();
          setUser(data.user);
          setUserData(data.userData);
          setEditedFullName(data.userData.full_name || '');
          setEditedPhone(data.userData.phone || '');
        } else {
          router.push('/login');
          return;
        }
      } catch (error) {
        console.error('Error fetching user:', error);
        router.push('/login');
        return;
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [router]);

  // Fetch orders when orders tab is active and user is customer
  useEffect(() => {
    if (activeTab === 'orders' && userData?.role === 'customer') {
      fetchOrders();
    }
  }, [activeTab, userData]);

  // Fetch booster jobs when jobs tab is active and user is approved booster
  useEffect(() => {
    if (activeTab === 'jobs' && userData?.role === 'booster' && userData?.booster_approval_status === 'approved') {
      fetchBoosterJobs();
    }
  }, [activeTab, userData]);

  // Fetch completed jobs when completed tab is active and user is customer
  useEffect(() => {
    if (activeTab === 'completed' && userData?.role === 'customer') {
      fetchCompletedJobs();
    }
  }, [activeTab, userData]);

  // Fetch booster reviews when reviews tab is active and user is approved booster
  useEffect(() => {
    if (activeTab === 'reviews' && userData?.role === 'booster' && userData?.booster_approval_status === 'approved') {
      fetchBoosterReviews();
    }
  }, [activeTab, userData]);

  // Fetch Connect status when earnings tab is active and user is approved booster
  useEffect(() => {
    if (activeTab === 'earnings' && userData?.role === 'booster' && userData?.booster_approval_status === 'approved') {
      fetchConnectStatus();
    }
  }, [activeTab, userData]);

  const fetchOrders = async () => {
    setOrdersLoading(true);

    try {
      const response = await fetch('/api/orders/my-orders');

      if (response.ok) {
        const data = await response.json();
        setOrders(data.orders || []);
        setOrderJobs(data.jobs || {});
      } else {
        console.error('Failed to fetch orders');
        setOrders([]);
        setOrderJobs({});
      }
    } catch (error) {
      console.error('Error fetching orders:', error);
      setOrders([]);
      setOrderJobs({});
    } finally {
      setOrdersLoading(false);
    }
  };

  const fetchBoosterJobs = async () => {
    setBoosterJobsLoading(true);

    try {
      const response = await fetch('/api/jobs/my-jobs');

      if (response.ok) {
        const data = await response.json();
        setBoosterJobs(data.jobs || []);
      } else {
        console.error('Failed to fetch booster jobs');
        setBoosterJobs([]);
      }
    } catch (error) {
      console.error('Error fetching booster jobs:', error);
      setBoosterJobs([]);
    } finally {
      setBoosterJobsLoading(false);
    }
  };

  const fetchCompletedJobs = async () => {
    setCompletedJobsLoading(true);

    try {
      const response = await fetch('/api/jobs/completed');

      if (response.ok) {
        const data = await response.json();
        setCompletedJobs(data.jobs || []);
      } else {
        console.error('Failed to fetch completed jobs');
        setCompletedJobs([]);
      }
    } catch (error) {
      console.error('Error fetching completed jobs:', error);
      setCompletedJobs([]);
    } finally {
      setCompletedJobsLoading(false);
    }
  };

  const fetchBoosterReviews = async () => {
    setBoosterReviewsLoading(true);

    try {
      const response = await fetch('/api/reviews/my-reviews');

      if (response.ok) {
        const data = await response.json();
        setBoosterReviews(data.reviews || []);
      } else {
        console.error('Failed to fetch booster reviews');
        setBoosterReviews([]);
      }
    } catch (error) {
      console.error('Error fetching booster reviews:', error);
      setBoosterReviews([]);
    } finally {
      setBoosterReviewsLoading(false);
    }
  };

  const fetchConnectStatus = async () => {
    try {
      const response = await fetch('/api/boosters/connect/status');

      if (response.ok) {
        const data = await response.json();
        setConnectStatus(data);
      } else {
        console.error('Failed to fetch Connect status');
        setConnectStatus(null);
      }
    } catch (error) {
      console.error('Error fetching Connect status:', error);
      setConnectStatus(null);
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
        alert(error.error || 'Failed to start onboarding. Please try again.');
      }
    } catch (error) {
      console.error('Error starting onboarding:', error);
      alert('Failed to start onboarding. Please try again.');
    } finally {
      setConnectLoading(false);
    }
  };

  const handleDisconnectBank = async () => {
    if (!confirm('Are you sure you want to disconnect your bank account? You will need to reconnect it to receive future payouts.')) {
      return;
    }

    setDisconnecting(true);

    try {
      const response = await fetch('/api/boosters/connect/disconnect', {
        method: 'POST',
      });

      if (response.ok) {
        alert('Bank account disconnected successfully.');
        await fetchConnectStatus();
      } else {
        const error = await response.json();
        alert(error.error || 'Failed to disconnect. Please try again.');
      }
    } catch (error) {
      console.error('Error disconnecting:', error);
      alert('Failed to disconnect. Please try again.');
    } finally {
      setDisconnecting(false);
    }
  };

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
        // Refresh jobs list
        await fetchBoosterJobs();
        handleCloseProgressModal();
        alert('Progress updated successfully!');
      } else {
        const error = await response.json();
        alert(error.error || 'Failed to update progress. Please try again.');
      }
    } catch (error) {
      console.error('Error updating progress:', error);
      alert('Failed to update progress. Please try again.');
    } finally {
      setUpdatingProgress(false);
    }
  };

  const handleOpenReviewModal = (job: CompletedJob) => {
    setSelectedJobForReview(job);
    setShowReviewModal(true);
  };

  const handleCloseReviewModal = () => {
    setShowReviewModal(false);
    setSelectedJobForReview(null);
  };

  const handleReviewSubmitted = () => {
    // Refresh completed jobs list
    fetchCompletedJobs();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }

  if (!userData) {
    return null;
  }

  return (
    <div className="min-h-screen bg-black pb-12">
      <div className="max-w-7xl mx-auto px-6">
        <h1 className="text-4xl font-bold text-white mb-8">My Account</h1>

        <div className="flex gap-8">
          {/* Sidebar */}
          <div className="w-64 flex-shrink-0">
            <div className="bg-gray-900 border border-primary-700 rounded-lg p-4">
              <nav className="space-y-2">
                <button
                  onClick={() => setActiveTab('profile')}
                  className={`w-full text-left px-4 py-3 rounded-lg transition-colors duration-200 ${
                    activeTab === 'profile'
                      ? 'bg-primary-600 text-white'
                      : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                  }`}
                >
                  Profile Information
                </button>
                <button
                  onClick={() => setActiveTab('security')}
                  className={`w-full text-left px-4 py-3 rounded-lg transition-colors duration-200 ${
                    activeTab === 'security'
                      ? 'bg-primary-600 text-white'
                      : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                  }`}
                >
                  Security
                </button>
                {userData.role === 'customer' && (
                  <>
                    <button
                      onClick={() => setActiveTab('orders')}
                      className={`w-full text-left px-4 py-3 rounded-lg transition-colors duration-200 ${
                        activeTab === 'orders'
                          ? 'bg-primary-600 text-white'
                          : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                      }`}
                    >
                      My Orders
                    </button>
                    <button
                      onClick={() => setActiveTab('completed')}
                      className={`w-full text-left px-4 py-3 rounded-lg transition-colors duration-200 ${
                        activeTab === 'completed'
                          ? 'bg-primary-600 text-white'
                          : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                      }`}
                    >
                      Completed Jobs
                    </button>
                  </>
                )}
                {userData.role === 'booster' && userData.booster_approval_status === 'approved' && (
                  <>
                    <button
                      onClick={() => setActiveTab('jobs')}
                      className={`w-full text-left px-4 py-3 rounded-lg transition-colors duration-200 ${
                        activeTab === 'jobs'
                          ? 'bg-primary-600 text-white'
                          : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                      }`}
                    >
                      My Jobs
                    </button>
                    <button
                      onClick={() => setActiveTab('reviews')}
                      className={`w-full text-left px-4 py-3 rounded-lg transition-colors duration-200 ${
                        activeTab === 'reviews'
                          ? 'bg-primary-600 text-white'
                          : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                      }`}
                    >
                      My Reviews
                    </button>
                    <button
                      onClick={() => setActiveTab('earnings')}
                      className={`w-full text-left px-4 py-3 rounded-lg transition-colors duration-200 ${
                        activeTab === 'earnings'
                          ? 'bg-primary-600 text-white'
                          : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                      }`}
                    >
                      Earnings
                    </button>
                  </>
                )}
                {userData.role === 'booster' && userData.is_suspended && userData.can_appeal && (
                  <button
                    onClick={() => setActiveTab('appeals')}
                    className={`w-full text-left px-4 py-3 rounded-lg transition-colors duration-200 border-2 ${
                      activeTab === 'appeals'
                        ? 'bg-red-600 text-white border-red-500'
                        : 'text-red-400 border-red-700 hover:bg-red-900/20 hover:text-red-300'
                    }`}
                  >
                    Submit Appeal
                  </button>
                )}
              </nav>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1">
            <div className="bg-gray-900 border border-primary-700 rounded-lg p-6">
              {/* Profile Tab */}
              {activeTab === 'profile' && (
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

                  {userData.role === 'booster' && userData.booster_approval_status === 'approved' && (
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
                      <label className="block text-sm text-gray-400 mb-2">Full Name</label>
                      <input
                        type="text"
                        value={editedFullName}
                        onChange={(e) => setEditedFullName(e.target.value)}
                        className="w-full px-4 py-3 bg-gray-800 border border-primary-700 text-white rounded-lg focus:outline-none focus:border-primary-500 transition"
                        placeholder="Enter your full name"
                      />
                    </div>

                    {/* Phone */}
                    <div>
                      <label className="block text-sm text-gray-400 mb-2">Phone Number (Optional)</label>
                      <input
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

                    <button className="px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition font-semibold">
                      Save Changes
                    </button>
                  </div>
                </div>
              )}

              {/* Security Tab */}
              {activeTab === 'security' && (
                <div>
                  <h2 className="text-2xl font-bold text-white mb-6">Security Settings</h2>

                  <div className="space-y-6">
                    {/* Change Password */}
                    <div>
                      <h3 className="text-lg font-semibold text-white mb-4">Change Password</h3>

                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm text-gray-400 mb-2">Current Password</label>
                          <input
                            type="password"
                            className="w-full px-4 py-3 bg-gray-800 border border-primary-700 text-white rounded-lg focus:outline-none focus:border-primary-500 transition"
                            placeholder="Enter current password"
                          />
                        </div>

                        <div>
                          <label className="block text-sm text-gray-400 mb-2">New Password</label>
                          <input
                            type="password"
                            className="w-full px-4 py-3 bg-gray-800 border border-primary-700 text-white rounded-lg focus:outline-none focus:border-primary-500 transition"
                            placeholder="Enter new password"
                          />
                        </div>

                        <div>
                          <label className="block text-sm text-gray-400 mb-2">Confirm New Password</label>
                          <input
                            type="password"
                            className="w-full px-4 py-3 bg-gray-800 border border-primary-700 text-white rounded-lg focus:outline-none focus:border-primary-500 transition"
                            placeholder="Confirm new password"
                          />
                        </div>

                        <button className="px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition font-semibold">
                          Update Password
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Earnings Tab (Approved Boosters Only) */}
              {activeTab === 'earnings' && userData.role === 'booster' && userData.booster_approval_status === 'approved' && (
                <div>
                  <h2 className="text-2xl font-bold text-white mb-6">Earnings</h2>

                  <div className="space-y-6">
                    {/* Bank Account Connection Status */}
                    {!connectStatus ? (
                      <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
                        <div className="text-center py-4">
                          <div className="text-gray-400">Loading connection status...</div>
                        </div>
                      </div>
                    ) : !connectStatus.connected ? (
                      /* Scenario A: Not Connected */
                      <div className="bg-yellow-900/20 border-2 border-yellow-500 rounded-lg p-6">
                        <div className="flex items-start gap-4">
                          <svg className="w-8 h-8 text-yellow-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                          </svg>
                          <div className="flex-1">
                            <h3 className="text-lg font-bold text-yellow-400 mb-2">Bank Account Required</h3>
                            <p className="text-yellow-200 text-sm mb-4">
                              You need to connect your bank account to receive payouts for completed jobs.
                            </p>
                            <button
                              onClick={handleConnectBank}
                              disabled={connectLoading}
                              className="px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
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
                          <svg className="w-8 h-8 text-blue-400 flex-shrink-0 animate-spin" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          <div className="flex-1">
                            <h3 className="text-lg font-bold text-blue-400 mb-2">Verification in Progress</h3>
                            <p className="text-blue-200 text-sm mb-4">
                              Stripe is verifying your information. This usually takes 1-2 business days.
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
                                onClick={fetchConnectStatus}
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
                        <div className="flex items-start gap-4 mb-4">
                          <svg className="w-8 h-8 text-green-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
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
                                className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition font-semibold text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                              >
                                {connectLoading ? 'Loading...' : 'Update Bank Account'}
                              </button>
                              <button
                                onClick={handleDisconnectBank}
                                disabled={disconnecting}
                                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition font-semibold text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                              >
                                {disconnecting ? 'Disconnecting...' : 'Disconnect'}
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
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
                </div>
              )}

              {/* Orders Tab (Customers Only) */}
              {activeTab === 'orders' && userData.role === 'customer' && (
                <div>
                  <h2 className="text-2xl font-bold text-white mb-6">My Orders</h2>

                  {ordersLoading ? (
                    <div className="text-center py-12">
                      <div className="text-gray-400">Loading orders...</div>
                    </div>
                  ) : orders.length === 0 ? (
                    <div className="bg-gray-800 border border-gray-700 rounded-lg p-6 text-center">
                      <svg className="w-16 h-16 text-gray-600 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                      </svg>
                      <h3 className="text-lg font-semibold text-white mb-2">No Orders Yet</h3>
                      <p className="text-gray-400 text-sm">
                        When you place orders, they will appear here.
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {orders.map((order) => {
                        const jobs = orderJobs[order.id] || [];
                        const hasJobs = jobs.length > 0;

                        return (
                          <div
                            key={order.id}
                            className="bg-gray-800 border border-gray-700 rounded-lg p-6 hover:border-primary-600 transition"
                          >
                            {/* Order Header */}
                            <div className="flex justify-between items-start mb-4">
                              <div>
                                <h3 className="text-xl font-semibold text-white mb-1">
                                  Order {order.order_number}
                                </h3>
                                <p className="text-sm text-gray-400">
                                  Placed on {new Date(order.created_at).toLocaleDateString('en-US', {
                                    year: 'numeric',
                                    month: 'long',
                                    day: 'numeric',
                                  })}
                                </p>
                              </div>
                              <div className="text-right">
                                <p className="text-2xl font-bold text-green-400">
                                  ${order.total_price.toFixed(2)}
                                </p>
                                <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold mt-2 ${
                                  order.status === 'completed'
                                    ? 'bg-green-900/50 text-green-400 border border-green-500'
                                    : order.status === 'in_progress'
                                    ? 'bg-blue-900/50 text-blue-400 border border-blue-500'
                                    : order.status === 'paid'
                                    ? 'bg-yellow-900/50 text-yellow-400 border border-yellow-500'
                                    : 'bg-gray-700 text-gray-300 border border-gray-600'
                                }`}>
                                  {order.status.toUpperCase().replace('_', ' ')}
                                </span>
                              </div>
                            </div>

                            {/* Progress Bar */}
                            <div className="mb-4">
                              <div className="flex justify-between items-center mb-2">
                                <span className="text-sm text-gray-400">Progress</span>
                                <span className="text-sm font-semibold text-white">
                                  {order.progress_percentage}%
                                </span>
                              </div>
                              <div className="w-full bg-gray-700 rounded-full h-2">
                                <div
                                  className="bg-gradient-to-r from-primary-600 to-primary-500 h-2 rounded-full transition-all duration-300"
                                  style={{ width: `${order.progress_percentage}%` }}
                                />
                              </div>
                            </div>

                            {/* Job Details */}
                            {hasJobs && (
                              <div className="border-t border-gray-700 pt-4">
                                <h4 className="text-sm font-semibold text-gray-400 mb-3">Job Details</h4>
                                {jobs.map((job) => (
                                  <div key={job.id} className="mb-3 last:mb-0">
                                    <div className="flex justify-between items-start">
                                      <div className="flex-1">
                                        <p className="text-white font-medium">{job.service_name}</p>
                                        <p className="text-sm text-gray-400">{job.game_name}</p>
                                        {job.booster_id ? (
                                          <p className="text-xs text-gray-500 mt-1">
                                            Assigned to: {job.booster!.full_name}
                                          </p>
                                        ) : (
                                          <p className="text-xs text-yellow-500 mt-1">
                                            Waiting for booster assignment
                                          </p>
                                        )}
                                      </div>
                                      <div className="text-right ml-4">
                                        <span className={`inline-block px-2 py-1 rounded text-xs font-semibold ${
                                          job.status === 'completed'
                                            ? 'bg-green-900/50 text-green-400'
                                            : job.status === 'in_progress'
                                            ? 'bg-blue-900/50 text-blue-400'
                                            : job.status === 'accepted'
                                            ? 'bg-purple-900/50 text-purple-400'
                                            : job.status === 'available'
                                            ? 'bg-yellow-900/50 text-yellow-400'
                                            : job.status === 'assigned'
                                            ? 'bg-indigo-900/50 text-indigo-400'
                                            : 'bg-gray-700 text-gray-300'
                                        }`}>
                                          {job.status.toUpperCase().replace('_', ' ')}
                                        </span>
                                        <p className="text-xs text-gray-500 mt-1">
                                          {job.progress_percentage}% Complete
                                        </p>
                                      </div>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}

              {/* Completed Jobs Tab (Customers Only) */}
              {activeTab === 'completed' && userData.role === 'customer' && (
                <div>
                  <h2 className="text-2xl font-bold text-white mb-6">Completed Jobs</h2>

                  {completedJobsLoading ? (
                    <div className="text-center py-12">
                      <div className="text-gray-400">Loading completed jobs...</div>
                    </div>
                  ) : completedJobs.length === 0 ? (
                    <div className="bg-gray-800 border border-gray-700 rounded-lg p-6 text-center">
                      <svg className="w-16 h-16 text-gray-600 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <h3 className="text-lg font-semibold text-white mb-2">No Completed Jobs Yet</h3>
                      <p className="text-gray-400 text-sm">
                        When your jobs are completed, they will appear here for you to review.
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {completedJobs.map((job) => (
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
                              <p className="text-xs text-gray-500 mt-1">Job #{job.job_number}</p>
                              <p className="text-xs text-gray-500">
                                Completed on {new Date(job.completed_at).toLocaleDateString('en-US', {
                                  year: 'numeric',
                                  month: 'long',
                                  day: 'numeric',
                                })}
                              </p>
                            </div>
                            <div className="text-right">
                              <span className="inline-block px-3 py-1 rounded-full text-xs font-semibold bg-green-900/50 text-green-400 border border-green-500">
                                COMPLETED
                              </span>
                            </div>
                          </div>

                          {/* Booster Info */}
                          <div className="border-t border-gray-700 pt-4 mb-4">
                            <p className="text-xs text-gray-500 mb-1">Booster</p>
                            <p className="text-sm text-white">{job.booster.full_name || job.booster.email}</p>
                          </div>

                          {/* Review Section */}
                          {job.has_review && job.review ? (
                            <div className="border-t border-gray-700 pt-4">
                              <div className="flex items-center justify-between mb-3">
                                <h4 className="text-sm font-semibold text-gray-400">Your Review</h4>
                                <div className="flex items-center gap-1">
                                  {[...Array(5)].map((_, i) => (
                                    <span
                                      key={i}
                                      className={`text-lg ${
                                        i < job.review!.rating ? 'text-yellow-400' : 'text-gray-600'
                                      }`}
                                    >
                                      ★
                                    </span>
                                  ))}
                                </div>
                              </div>
                              <div className="mb-2">
                                <span className={`inline-block px-2 py-1 rounded text-xs font-semibold ${
                                  job.review.delivery_status === 'complete'
                                    ? 'bg-green-900/50 text-green-400'
                                    : job.review.delivery_status === 'incomplete'
                                    ? 'bg-yellow-900/50 text-yellow-400'
                                    : 'bg-red-900/50 text-red-400'
                                }`}>
                                  {job.review.delivery_status === 'complete' ? 'Complete Delivery' :
                                   job.review.delivery_status === 'incomplete' ? 'Incomplete Delivery' :
                                   'Poor Quality'}
                                </span>
                              </div>
                              {job.review.review_text && (
                                <p className="text-sm text-gray-300 mb-2">{job.review.review_text}</p>
                              )}
                              <p className="text-xs text-gray-500">
                                Reviewed on {new Date(job.review.created_at).toLocaleDateString('en-US', {
                                  year: 'numeric',
                                  month: 'long',
                                  day: 'numeric',
                                })}
                              </p>
                            </div>
                          ) : (
                            <div className="border-t border-gray-700 pt-4">
                              <button
                                onClick={() => handleOpenReviewModal(job)}
                                className="w-full py-2.5 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition font-bold"
                              >
                                LEAVE A REVIEW
                              </button>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Reviews Tab (Approved Boosters Only) */}
              {activeTab === 'reviews' && userData.role === 'booster' && userData.booster_approval_status === 'approved' && (
                <div>
                  <h2 className="text-2xl font-bold text-white mb-6">My Reviews</h2>

                  {boosterReviewsLoading ? (
                    <div className="text-center py-12">
                      <div className="text-gray-400">Loading reviews...</div>
                    </div>
                  ) : boosterReviews.length === 0 ? (
                    <div>
                      {/* Strike Count Card (show even when no reviews) */}
                      <div className={`bg-gradient-to-br rounded-lg p-6 mb-6 ${
                        (userData.strike_count || 0) >= 3
                          ? 'from-red-600 to-red-700'
                          : (userData.strike_count || 0) >= 2
                          ? 'from-orange-600 to-orange-700'
                          : (userData.strike_count || 0) >= 1
                          ? 'from-yellow-600 to-yellow-700'
                          : 'from-green-600 to-green-700'
                      }`}>
                        <div className="flex items-center justify-between">
                          <div>
                            <div className={`text-sm mb-1 ${
                              (userData.strike_count || 0) >= 3
                                ? 'text-red-100'
                                : (userData.strike_count || 0) >= 2
                                ? 'text-orange-100'
                                : (userData.strike_count || 0) >= 1
                                ? 'text-yellow-100'
                                : 'text-green-100'
                            }`}>Active Strikes</div>
                            <div className="flex items-center gap-2">
                              <div className="text-5xl font-bold text-white">
                                {userData.strike_count || 0}
                              </div>
                              <div className="text-2xl text-white opacity-70">/3</div>
                            </div>
                          </div>
                          <div className="text-right">
                            <svg className="w-16 h-16 text-white opacity-30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                            </svg>
                          </div>
                        </div>
                        {(userData.strike_count || 0) === 0 && (
                          <p className="text-xs text-green-100 mt-2">Great job! Keep up the excellent work.</p>
                        )}
                        {(userData.strike_count || 0) === 1 && (
                          <p className="text-xs text-yellow-100 mt-2">You have 1 active strike. Two more will result in suspension.</p>
                        )}
                        {(userData.strike_count || 0) === 2 && (
                          <p className="text-xs text-orange-100 mt-2">Warning: You have 2 strikes. One more will result in suspension.</p>
                        )}
                        {(userData.strike_count || 0) >= 3 && (
                          <p className="text-xs text-red-100 mt-2">Your account is suspended due to 3 strikes.</p>
                        )}
                      </div>

                      <div className="bg-gray-800 border border-gray-700 rounded-lg p-6 text-center">
                        <svg className="w-16 h-16 text-gray-600 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                        </svg>
                        <h3 className="text-lg font-semibold text-white mb-2">No Reviews Yet</h3>
                        <p className="text-gray-400 text-sm">
                          When customers review your work, their reviews will appear here.
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div>
                      {/* Stats Cards */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                        {/* Average Rating Card */}
                        <div className="bg-gradient-to-br from-yellow-600 to-yellow-700 rounded-lg p-6">
                          <div className="flex items-center justify-between">
                            <div>
                              <div className="text-sm text-yellow-100 mb-1">Average Rating</div>
                              <div className="flex items-center gap-2">
                                <div className="text-5xl font-bold text-white">
                                  {(boosterReviews.reduce((acc, r) => acc + r.rating, 0) / boosterReviews.length).toFixed(1)}
                                </div>
                                <div className="text-3xl text-yellow-200">★</div>
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="text-sm text-yellow-100 mb-1">Total Reviews</div>
                              <div className="text-3xl font-bold text-white">{boosterReviews.length}</div>
                            </div>
                          </div>
                        </div>

                        {/* Strike Count Card */}
                        <div className={`bg-gradient-to-br rounded-lg p-6 ${
                          (userData.strike_count || 0) >= 3
                            ? 'from-red-600 to-red-700'
                            : (userData.strike_count || 0) >= 2
                            ? 'from-orange-600 to-orange-700'
                            : (userData.strike_count || 0) >= 1
                            ? 'from-yellow-600 to-yellow-700'
                            : 'from-green-600 to-green-700'
                        }`}>
                          <div className="flex items-center justify-between">
                            <div>
                              <div className={`text-sm mb-1 ${
                                (userData.strike_count || 0) >= 3
                                  ? 'text-red-100'
                                  : (userData.strike_count || 0) >= 2
                                  ? 'text-orange-100'
                                  : (userData.strike_count || 0) >= 1
                                  ? 'text-yellow-100'
                                  : 'text-green-100'
                              }`}>Active Strikes</div>
                              <div className="flex items-center gap-2">
                                <div className="text-5xl font-bold text-white">
                                  {userData.strike_count || 0}
                                </div>
                                <div className="text-2xl text-white opacity-70">/3</div>
                              </div>
                            </div>
                            <div className="text-right">
                              <svg className="w-16 h-16 text-white opacity-30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                              </svg>
                            </div>
                          </div>
                          {(userData.strike_count || 0) === 0 && (
                            <p className="text-xs text-green-100 mt-2">Great job! Keep up the excellent work.</p>
                          )}
                          {(userData.strike_count || 0) === 1 && (
                            <p className="text-xs text-yellow-100 mt-2">You have 1 active strike. Two more will result in suspension.</p>
                          )}
                          {(userData.strike_count || 0) === 2 && (
                            <p className="text-xs text-orange-100 mt-2">Warning: You have 2 strikes. One more will result in suspension.</p>
                          )}
                          {(userData.strike_count || 0) >= 3 && (
                            <p className="text-xs text-red-100 mt-2">Your account is suspended due to 3 strikes.</p>
                          )}
                        </div>
                      </div>

                      {/* Reviews List */}
                      <div className="space-y-4">
                        {boosterReviews.map((review) => (
                          <div
                            key={review.id}
                            className="bg-gray-800 border border-gray-700 rounded-lg p-6 hover:border-primary-600 transition"
                          >
                            {/* Review Header */}
                            <div className="flex justify-between items-start mb-4">
                              <div>
                                <h3 className="text-xl font-semibold text-white mb-1">
                                  {review.jobs?.service_name || 'Unknown Service'}
                                </h3>
                                <p className="text-sm text-gray-400">{review.jobs?.game_name || 'Unknown Game'}</p>
                                <p className="text-xs text-gray-500 mt-1">Job #{review.jobs?.job_number || 'N/A'}</p>
                              </div>
                              <div className="text-right">
                                <div className="flex items-center gap-1 mb-2">
                                  {[...Array(5)].map((_, i) => (
                                    <span
                                      key={i}
                                      className={`text-2xl ${
                                        i < review.rating ? 'text-yellow-400' : 'text-gray-600'
                                      }`}
                                    >
                                      ★
                                    </span>
                                  ))}
                                </div>
                                <span className={`inline-block px-2 py-1 rounded text-xs font-semibold ${
                                  review.delivery_status === 'complete'
                                    ? 'bg-green-900/50 text-green-400'
                                    : review.delivery_status === 'incomplete'
                                    ? 'bg-yellow-900/50 text-yellow-400'
                                    : 'bg-red-900/50 text-red-400'
                                }`}>
                                  {review.delivery_status === 'complete' ? 'Complete' :
                                   review.delivery_status === 'incomplete' ? 'Incomplete' :
                                   'Poor Quality'}
                                </span>
                              </div>
                            </div>

                            {/* Review Content */}
                            {review.review_text && (
                              <div className="mb-4">
                                <p className="text-gray-300 text-sm italic">&ldquo;{review.review_text}&rdquo;</p>
                              </div>
                            )}

                            {/* Additional Ratings */}
                            {(review.quality_rating || review.communication_rating || review.timeliness_rating) && (
                              <div className="border-t border-gray-700 pt-4 mb-4">
                                <div className="grid grid-cols-3 gap-4 text-center">
                                  {review.quality_rating && (
                                    <div>
                                      <p className="text-xs text-gray-500 mb-1">Quality</p>
                                      <p className="text-sm font-semibold text-white">
                                        {review.quality_rating}/5 ★
                                      </p>
                                    </div>
                                  )}
                                  {review.communication_rating && (
                                    <div>
                                      <p className="text-xs text-gray-500 mb-1">Communication</p>
                                      <p className="text-sm font-semibold text-white">
                                        {review.communication_rating}/5 ★
                                      </p>
                                    </div>
                                  )}
                                  {review.timeliness_rating && (
                                    <div>
                                      <p className="text-xs text-gray-500 mb-1">Timeliness</p>
                                      <p className="text-sm font-semibold text-white">
                                        {review.timeliness_rating}/5 ★
                                      </p>
                                    </div>
                                  )}
                                </div>
                              </div>
                            )}

                            {/* Review Footer */}
                            <div className="border-t border-gray-700 pt-4 flex justify-between items-center text-xs text-gray-500">
                              <div>
                                From: {review.customer?.full_name || review.customer?.email || 'Anonymous'}
                              </div>
                              <div>
                                {new Date(review.created_at).toLocaleDateString('en-US', {
                                  year: 'numeric',
                                  month: 'long',
                                  day: 'numeric',
                                })}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Jobs Tab (Approved Boosters Only) */}
              {activeTab === 'jobs' && userData.role === 'booster' && userData.booster_approval_status === 'approved' && (
                <div>
                  <h2 className="text-2xl font-bold text-white mb-6">My Jobs</h2>

                  {boosterJobsLoading ? (
                    <div className="text-center py-12">
                      <div className="text-gray-400">Loading jobs...</div>
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

                          {/* Update Progress Button */}
                          {job.status !== 'completed' && (
                            <div className="mt-4">
                              <button
                                onClick={() => handleOpenProgressModal(job)}
                                className="w-full py-2.5 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition font-bold"
                              >
                                UPDATE PROGRESS
                              </button>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Appeals Tab (Suspended Boosters Only) */}
              {activeTab === 'appeals' && userData.role === 'booster' && userData.is_suspended && (
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

                      <form onSubmit={async (e) => {
                        e.preventDefault();
                        if (!appealText.trim()) {
                          alert('Please provide an explanation for your appeal.');
                          return;
                        }

                        setSubmittingAppeal(true);
                        try {
                          const response = await fetch('/api/appeals/submit', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ appeal_text: appealText }),
                          });

                          if (response.ok) {
                            alert('Your appeal has been submitted successfully. We will review it and get back to you soon.');
                            setAppealText('');
                            // Refresh user data
                            const userResponse = await fetch('/api/user/me');
                            if (userResponse.ok) {
                              const data = await userResponse.json();
                              setUserData(data.userData);
                            }
                          } else {
                            const error = await response.json();
                            alert(error.error || 'Failed to submit appeal. Please try again.');
                          }
                        } catch (error) {
                          console.error('Error submitting appeal:', error);
                          alert('Failed to submit appeal. Please try again.');
                        } finally {
                          setSubmittingAppeal(false);
                        }
                      }}>
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
                          <p className="text-xs text-gray-500 mt-2">
                            Be honest and respectful in your explanation.
                          </p>
                        </div>

                        <button
                          type="submit"
                          disabled={submittingAppeal || !appealText.trim()}
                          className="w-full px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {submittingAppeal ? 'Submitting Appeal...' : 'Submit Appeal'}
                        </button>
                      </form>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Review Modal */}
      {showReviewModal && selectedJobForReview && (
        <ReviewModal
          isOpen={showReviewModal}
          onClose={handleCloseReviewModal}
          jobId={selectedJobForReview.id}
          jobNumber={selectedJobForReview.job_number}
          gameName={selectedJobForReview.game_name}
          serviceName={selectedJobForReview.service_name}
          boosterName={selectedJobForReview.booster.full_name || selectedJobForReview.booster.email}
          onReviewSubmitted={handleReviewSubmitted}
        />
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

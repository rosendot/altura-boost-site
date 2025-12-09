'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

interface UserData {
  id: string;
  email: string;
  full_name: string | null;
  phone: string | null;
  role: 'customer' | 'booster' | 'admin';
  created_at: string;
  total_earnings?: number;
  booster_approval_status?: 'pending' | 'approved' | 'rejected' | null;
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

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await fetch('/api/user/me');

        if (response.ok) {
          const data = await response.json();
          setUser(data.user);
          setUserData(data.userData);
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

  // Fetch booster jobs when jobs tab is active and user is booster
  useEffect(() => {
    if (activeTab === 'jobs' && userData?.role === 'booster') {
      fetchBoosterJobs();
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
    <div className="min-h-screen bg-black pt-20 pb-12">
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
                )}
                {userData.role === 'booster' && (
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

                  <div className="space-y-6">
                    {/* Role Badge */}
                    <div>
                      <label className="block text-sm text-gray-400 mb-2">Account Type</label>
                      <div className="flex items-center gap-3">
                        <span className={`px-4 py-2 rounded-lg font-semibold text-sm ${
                          userData.role === 'booster'
                            ? 'bg-primary-600 text-white'
                            : userData.role === 'admin'
                            ? 'bg-yellow-600 text-white'
                            : 'bg-gray-700 text-white'
                        }`}>
                          {userData.role.toUpperCase()}
                        </span>
                        {userData.role === 'booster' && userData.booster_approval_status && (
                          <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                            userData.booster_approval_status === 'approved'
                              ? 'bg-green-900/50 text-green-400 border border-green-500'
                              : userData.booster_approval_status === 'pending'
                              ? 'bg-yellow-900/50 text-yellow-400 border border-yellow-500'
                              : 'bg-red-900/50 text-red-400 border border-red-500'
                          }`}>
                            {userData.booster_approval_status.toUpperCase()}
                          </span>
                        )}
                      </div>
                    </div>

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
                        value={userData.full_name || ''}
                        className="w-full px-4 py-3 bg-gray-800 border border-primary-700 text-white rounded-lg focus:outline-none focus:border-primary-500 transition"
                        placeholder="Enter your full name"
                      />
                    </div>

                    {/* Phone */}
                    <div>
                      <label className="block text-sm text-gray-400 mb-2">Phone Number (Optional)</label>
                      <input
                        type="tel"
                        value={userData.phone || ''}
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

              {/* Earnings Tab (Boosters Only) */}
              {activeTab === 'earnings' && userData.role === 'booster' && (
                <div>
                  <h2 className="text-2xl font-bold text-white mb-6">Earnings</h2>

                  <div className="space-y-6">
                    {/* Total Earnings */}
                    <div className="bg-gradient-to-r from-primary-600 to-primary-700 rounded-lg p-6">
                      <div className="text-sm text-gray-200 mb-1">Total Lifetime Earnings</div>
                      <div className="text-4xl font-bold text-white">
                        ${(userData.total_earnings || 0).toFixed(2)}
                      </div>
                    </div>

                    {/* Earnings Info */}
                    <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
                      <h3 className="text-lg font-semibold text-white mb-4">Payment Information</h3>
                      <p className="text-gray-400 text-sm">
                        Payments are processed via Stripe Connect. You will receive payouts after completing jobs.
                      </p>
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

              {/* Jobs Tab (Boosters Only) */}
              {activeTab === 'jobs' && userData.role === 'booster' && (
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
            </div>
          </div>
        </div>
      </div>

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

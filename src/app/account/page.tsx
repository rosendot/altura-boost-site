'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

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

  useEffect(() => {
    const fetchUser = async () => {
      const supabase = createClient();

      // Check if user is authenticated
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        router.push('/login');
        return;
      }

      setUser(user);

      // Fetch user data from public.users
      const { data: publicUserData } = await supabase
        .from('users')
        .select('*')
        .eq('id', user.id)
        .single();

      setUserData(publicUserData);
      setLoading(false);
    };

    fetchUser();
  }, [router]);

  // Fetch orders when orders tab is active and user is customer
  useEffect(() => {
    if (activeTab === 'orders' && userData?.role === 'customer') {
      fetchOrders();
    }
  }, [activeTab, userData]);

  const fetchOrders = async () => {
    setOrdersLoading(true);
    const supabase = createClient();

    try {
      // Fetch orders for this customer
      const { data: ordersData, error: ordersError } = await supabase
        .from('orders')
        .select('*')
        .eq('customer_id', userData?.id)
        .order('created_at', { ascending: false });

      if (ordersError) throw ordersError;

      setOrders(ordersData || []);

      // Fetch jobs for each order
      if (ordersData && ordersData.length > 0) {
        const { data: jobsData, error: jobsError } = await supabase
          .from('jobs')
          .select(`
            *,
            booster:users!jobs_booster_id_fkey(full_name, email)
          `)
          .in('order_id', ordersData.map(o => o.id));

        if (jobsError) throw jobsError;

        // Group jobs by order_id
        const jobsByOrder: Record<string, Job[]> = {};
        jobsData?.forEach((job) => {
          if (!jobsByOrder[job.order_id]) {
            jobsByOrder[job.order_id] = [];
          }
          jobsByOrder[job.order_id].push(job);
        });

        setOrderJobs(jobsByOrder);
      }
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setOrdersLoading(false);
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
                                        {job.booster_id && job.booster ? (
                                          <p className="text-xs text-gray-500 mt-1">
                                            Assigned to: {job.booster.full_name || job.booster.email}
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

                  <div className="space-y-4">
                    {/* Placeholder for jobs - will be populated with real data later */}
                    <div className="bg-gray-800 border border-gray-700 rounded-lg p-6 text-center">
                      <svg className="w-16 h-16 text-gray-600 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                      </svg>
                      <h3 className="text-lg font-semibold text-white mb-2">No Jobs Yet</h3>
                      <p className="text-gray-400 text-sm">
                        When you accept jobs, they will appear here.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

interface UserData {
  id: string;
  email: string;
  role: 'customer' | 'booster' | 'admin';
}

interface BoosterApplication {
  id: string;
  user_id: string;
  questionnaire_responses: any;
  status: 'pending' | 'approved' | 'rejected';
  submitted_at: string;
  reviewed_at: string | null;
  rejection_reason: string | null;
  users: {
    email: string;
    full_name: string | null;
  };
}

interface Order {
  id: string;
  order_number: string;
  customer_id: string;
  subtotal: number;
  tax_amount: number;
  total_price: number;
  status: 'pending_payment' | 'paid' | 'available' | 'assigned' | 'in_progress' | 'completed' | 'cancelled';
  progress_percentage: number;
  created_at: string;
  paid_at: string | null;
  completed_at: string | null;
  users: {
    email: string;
    full_name: string | null;
  } | null;
}

interface Job {
  id: string;
  job_number: string;
  order_id: string;
  order_number: string;
  service_name: string;
  game_name: string;
  booster_id: string | null;
  status: 'available' | 'accepted' | 'in_progress' | 'completed' | 'cancelled';
  payout_amount: number;
  estimated_hours: number;
  requirements: string;
  weapon_class: string | null;
  progress_percentage: number;
  accepted_at: string | null;
  completed_at: string | null;
  created_at: string;
  users: {
    email: string;
    full_name: string | null;
  } | null;
}

export default function AdminPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [applications, setApplications] = useState<BoosterApplication[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [jobs, setJobs] = useState<Job[]>([]);

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
        .select('id, email, role')
        .eq('id', user.id)
        .single();

      // Check if user is admin
      if (publicUserData?.role !== 'admin') {
        router.push('/');
        return;
      }

      setUserData(publicUserData);
      setLoading(false);
    };

    fetchUser();
  }, [router]);

  useEffect(() => {
    if (activeTab === 'applications' && userData?.role === 'admin') {
      fetchApplications();
    }
    if (activeTab === 'orders' && userData?.role === 'admin') {
      fetchOrders();
      fetchJobs();
    }
  }, [activeTab, userData]);

  const fetchApplications = async () => {
    const supabase = createClient();
    const { data } = await supabase
      .from('booster_applications')
      .select(`
        *,
        users (
          email,
          full_name
        )
      `)
      .order('submitted_at', { ascending: false });

    if (data) {
      setApplications(data);
    }
  };

  const fetchOrders = async () => {
    const supabase = createClient();
    const { data } = await supabase
      .from('orders')
      .select(`
        *,
        users (
          email,
          full_name
        )
      `)
      .order('created_at', { ascending: false });

    if (data) {
      setOrders(data);
    }
  };

  const fetchJobs = async () => {
    const supabase = createClient();
    const { data } = await supabase
      .from('jobs')
      .select(`
        *,
        users (
          email,
          full_name
        )
      `)
      .order('created_at', { ascending: false });

    if (data) {
      setJobs(data);
    }
  };

  const handleApplicationAction = async (
    applicationId: string,
    userId: string,
    action: 'approve' | 'reject',
    rejectionReason?: string
  ) => {
    const supabase = createClient();

    // Update application status
    const { error: appError } = await supabase
      .from('booster_applications')
      .update({
        status: action === 'approve' ? 'approved' : 'rejected',
        reviewed_at: new Date().toISOString(),
        reviewed_by: userData?.id,
        rejection_reason: action === 'reject' ? rejectionReason : null,
      })
      .eq('id', applicationId);

    if (appError) {
      alert('Error updating application: ' + appError.message);
      return;
    }

    // Update user role and booster_approval_status
    const { error: userError } = await supabase
      .from('users')
      .update({
        role: action === 'approve' ? 'booster' : 'customer',
        booster_approval_status: action === 'approve' ? 'approved' : 'rejected',
      })
      .eq('id', userId);

    if (userError) {
      alert('Error updating user: ' + userError.message);
      return;
    }

    alert(`Application ${action === 'approve' ? 'approved' : 'rejected'} successfully!`);
    fetchApplications();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }

  if (!userData || userData.role !== 'admin') {
    return null;
  }

  return (
    <div className="min-h-screen bg-black pb-12">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-4xl font-bold text-white">Admin Panel</h1>
          <div className="px-4 py-2 bg-yellow-600 text-white rounded-lg font-semibold text-sm">
            ADMIN ACCESS
          </div>
        </div>

        <div className="flex gap-8">
          {/* Sidebar */}
          <div className="w-64 flex-shrink-0">
            <div className="bg-gray-900 border border-primary-700 rounded-lg p-4">
              <nav className="space-y-2">
                <button
                  onClick={() => setActiveTab('dashboard')}
                  className={`w-full text-left px-4 py-3 rounded-lg transition-colors duration-200 ${
                    activeTab === 'dashboard'
                      ? 'bg-primary-600 text-white'
                      : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                  }`}
                >
                  Dashboard
                </button>
                <button
                  onClick={() => setActiveTab('applications')}
                  className={`w-full text-left px-4 py-3 rounded-lg transition-colors duration-200 ${
                    activeTab === 'applications'
                      ? 'bg-primary-600 text-white'
                      : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                  }`}
                >
                  Booster Applications
                </button>
                <button
                  onClick={() => setActiveTab('orders')}
                  className={`w-full text-left px-4 py-3 rounded-lg transition-colors duration-200 ${
                    activeTab === 'orders'
                      ? 'bg-primary-600 text-white'
                      : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                  }`}
                >
                  Orders
                </button>
                <button
                  onClick={() => setActiveTab('users')}
                  className={`w-full text-left px-4 py-3 rounded-lg transition-colors duration-200 ${
                    activeTab === 'users'
                      ? 'bg-primary-600 text-white'
                      : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                  }`}
                >
                  Users
                </button>
                <button
                  onClick={() => setActiveTab('services')}
                  className={`w-full text-left px-4 py-3 rounded-lg transition-colors duration-200 ${
                    activeTab === 'services'
                      ? 'bg-primary-600 text-white'
                      : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                  }`}
                >
                  Services & Games
                </button>
              </nav>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1">
            <div className="bg-gray-900 border border-primary-700 rounded-lg p-6">
              {/* Dashboard Tab */}
              {activeTab === 'dashboard' && (
                <div>
                  <h2 className="text-2xl font-bold text-white mb-6">Dashboard Overview</h2>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    {/* Stats Cards */}
                    <div className="bg-gradient-to-br from-primary-600 to-primary-700 rounded-lg p-6">
                      <div className="text-sm text-gray-200 mb-1">Total Revenue</div>
                      <div className="text-3xl font-bold text-white">$0.00</div>
                      <div className="text-xs text-gray-300 mt-2">All time</div>
                    </div>

                    <div className="bg-gradient-to-br from-green-600 to-green-700 rounded-lg p-6">
                      <div className="text-sm text-gray-200 mb-1">Active Orders</div>
                      <div className="text-3xl font-bold text-white">0</div>
                      <div className="text-xs text-gray-300 mt-2">Currently in progress</div>
                    </div>

                    <div className="bg-gradient-to-br from-blue-600 to-blue-700 rounded-lg p-6">
                      <div className="text-sm text-gray-200 mb-1">Active Boosters</div>
                      <div className="text-3xl font-bold text-white">0</div>
                      <div className="text-xs text-gray-300 mt-2">Approved boosters</div>
                    </div>

                    <div className="bg-gradient-to-br from-yellow-600 to-yellow-700 rounded-lg p-6">
                      <div className="text-sm text-gray-200 mb-1">Pending Applications</div>
                      <div className="text-3xl font-bold text-white">
                        {applications.filter(app => app.status === 'pending').length}
                      </div>
                      <div className="text-xs text-gray-300 mt-2">Awaiting review</div>
                    </div>
                  </div>

                  {/* Recent Activity */}
                  <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
                    <h3 className="text-lg font-semibold text-white mb-4">Recent Activity</h3>
                    <p className="text-gray-400 text-sm">No recent activity to display.</p>
                  </div>
                </div>
              )}

              {/* Booster Applications Tab */}
              {activeTab === 'applications' && (
                <div>
                  <h2 className="text-2xl font-bold text-white mb-6">Booster Applications</h2>

                  {/* Filter Tabs */}
                  <div className="flex gap-4 mb-6">
                    <button className="px-4 py-2 bg-yellow-600 text-white rounded-lg font-semibold text-sm">
                      Pending ({applications.filter(app => app.status === 'pending').length})
                    </button>
                    <button className="px-4 py-2 bg-gray-700 text-gray-300 rounded-lg font-semibold text-sm hover:bg-gray-600">
                      Approved ({applications.filter(app => app.status === 'approved').length})
                    </button>
                    <button className="px-4 py-2 bg-gray-700 text-gray-300 rounded-lg font-semibold text-sm hover:bg-gray-600">
                      Rejected ({applications.filter(app => app.status === 'rejected').length})
                    </button>
                  </div>

                  {/* Applications List */}
                  <div className="space-y-4">
                    {applications.filter(app => app.status === 'pending').length === 0 ? (
                      <div className="bg-gray-800 border border-gray-700 rounded-lg p-6 text-center">
                        <p className="text-gray-400">No pending applications.</p>
                      </div>
                    ) : (
                      applications
                        .filter(app => app.status === 'pending')
                        .map((app) => (
                          <div key={app.id} className="bg-gray-800 border border-gray-700 rounded-lg p-6">
                            <div className="flex items-start justify-between mb-4">
                              <div>
                                <h3 className="text-lg font-semibold text-white">
                                  {app.users.full_name || 'No name provided'}
                                </h3>
                                <p className="text-sm text-gray-400">{app.users.email}</p>
                                <p className="text-xs text-gray-500 mt-1">
                                  Submitted: {new Date(app.submitted_at).toLocaleDateString()}
                                </p>
                              </div>
                              <span className="px-3 py-1 bg-yellow-900/50 text-yellow-400 border border-yellow-500 rounded-full text-xs font-semibold">
                                PENDING
                              </span>
                            </div>

                            {/* Questionnaire Responses */}
                            <div className="bg-gray-900 rounded-lg p-4 mb-4">
                              <h4 className="text-sm font-semibold text-white mb-3">Application Responses</h4>
                              <div className="space-y-3">
                                {Object.entries(app.questionnaire_responses || {}).map(([key, value]) => (
                                  <div key={key}>
                                    <p className="text-xs text-gray-400 capitalize mb-1">
                                      {key.replace(/_/g, ' ')}:
                                    </p>
                                    <p className="text-sm text-white">
                                      {Array.isArray(value) ? value.join(', ') : String(value || '')}
                                    </p>
                                  </div>
                                ))}
                              </div>
                            </div>

                            {/* Action Buttons */}
                            <div className="flex gap-3">
                              <button
                                onClick={() => handleApplicationAction(app.id, app.user_id, 'approve')}
                                className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition font-semibold"
                              >
                                Approve
                              </button>
                              <button
                                onClick={() => {
                                  const reason = prompt('Enter rejection reason:');
                                  if (reason) {
                                    handleApplicationAction(app.id, app.user_id, 'reject', reason);
                                  }
                                }}
                                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition font-semibold"
                              >
                                Reject
                              </button>
                            </div>
                          </div>
                        ))
                    )}
                  </div>
                </div>
              )}

              {/* Orders Tab */}
              {activeTab === 'orders' && (
                <div>
                  <h2 className="text-2xl font-bold text-white mb-6">Orders & Jobs Management</h2>

                  {/* Aggregated Stats */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                    <div className="bg-gradient-to-br from-blue-600 to-blue-700 rounded-lg p-4">
                      <div className="text-sm text-gray-200 mb-1">Total Orders</div>
                      <div className="text-3xl font-bold text-white">{orders.length}</div>
                      <div className="text-xs text-gray-300 mt-1">All time</div>
                    </div>

                    <div className="bg-gradient-to-br from-green-600 to-green-700 rounded-lg p-4">
                      <div className="text-sm text-gray-200 mb-1">Active Orders</div>
                      <div className="text-3xl font-bold text-white">
                        {orders.filter(o => o.status === 'in_progress' || o.status === 'assigned').length}
                      </div>
                      <div className="text-xs text-gray-300 mt-1">In progress</div>
                    </div>

                    <div className="bg-gradient-to-br from-purple-600 to-purple-700 rounded-lg p-4">
                      <div className="text-sm text-gray-200 mb-1">Total Jobs</div>
                      <div className="text-3xl font-bold text-white">{jobs.length}</div>
                      <div className="text-xs text-gray-300 mt-1">All time</div>
                    </div>

                    <div className="bg-gradient-to-br from-yellow-600 to-yellow-700 rounded-lg p-4">
                      <div className="text-sm text-gray-200 mb-1">Available Jobs</div>
                      <div className="text-3xl font-bold text-white">
                        {jobs.filter(j => j.status === 'available').length}
                      </div>
                      <div className="text-xs text-gray-300 mt-1">Awaiting boosters</div>
                    </div>
                  </div>

                  {/* Orders Section */}
                  <div className="mb-8">
                    <h3 className="text-xl font-semibold text-white mb-4">Recent Orders</h3>
                    {orders.length === 0 ? (
                      <div className="bg-gray-800 border border-gray-700 rounded-lg p-6 text-center">
                        <svg className="w-16 h-16 text-gray-600 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                        </svg>
                        <h3 className="text-lg font-semibold text-white mb-2">No Orders Yet</h3>
                        <p className="text-gray-400 text-sm">
                          Orders will appear here once customers start placing them.
                        </p>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {orders.map((order) => (
                          <div key={order.id} className="bg-gray-800 border border-gray-700 rounded-lg p-4 hover:border-primary-600 transition-colors">
                            <div className="flex items-start justify-between mb-3">
                              <div>
                                <h4 className="text-lg font-semibold text-white">{order.order_number}</h4>
                                <p className="text-sm text-gray-400">
                                  {order.users?.full_name && <span className="font-medium">{order.users.full_name} - </span>}
                                  {order.users?.email || 'Unknown customer'}
                                </p>
                              </div>
                              <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                                order.status === 'completed' ? 'bg-green-900/50 text-green-400 border border-green-500' :
                                order.status === 'in_progress' ? 'bg-blue-900/50 text-blue-400 border border-blue-500' :
                                order.status === 'assigned' ? 'bg-purple-900/50 text-purple-400 border border-purple-500' :
                                order.status === 'paid' || order.status === 'available' ? 'bg-yellow-900/50 text-yellow-400 border border-yellow-500' :
                                order.status === 'cancelled' ? 'bg-red-900/50 text-red-400 border border-red-500' :
                                'bg-gray-900/50 text-gray-400 border border-gray-500'
                              }`}>
                                {order.status.replace('_', ' ').toUpperCase()}
                              </span>
                            </div>

                            <div className="space-y-2 mb-3">
                              <div className="flex justify-between text-sm">
                                <span className="text-gray-400">Total:</span>
                                <span className="text-white font-semibold">${order.total_price.toFixed(2)}</span>
                              </div>
                              <div className="flex justify-between text-sm">
                                <span className="text-gray-400">Progress:</span>
                                <span className="text-white font-semibold">{order.progress_percentage}%</span>
                              </div>
                              <div className="w-full bg-gray-700 rounded-full h-2">
                                <div
                                  className="bg-primary-600 h-2 rounded-full transition-all duration-300"
                                  style={{ width: `${order.progress_percentage}%` }}
                                />
                              </div>
                            </div>

                            <div className="text-xs text-gray-500">
                              <div>Created: {new Date(order.created_at).toLocaleDateString()}</div>
                              {order.paid_at && <div>Paid: {new Date(order.paid_at).toLocaleDateString()}</div>}
                              {order.completed_at && <div>Completed: {new Date(order.completed_at).toLocaleDateString()}</div>}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Jobs Section */}
                  <div>
                    <h3 className="text-xl font-semibold text-white mb-4">All Jobs</h3>
                    {jobs.length === 0 ? (
                      <div className="bg-gray-800 border border-gray-700 rounded-lg p-6 text-center">
                        <p className="text-gray-400 text-sm">
                          No jobs created yet.
                        </p>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {jobs.map((job) => (
                          <div key={job.id} className="bg-gray-800 border border-gray-700 rounded-lg p-4 hover:border-primary-600 transition-colors">
                            <div className="flex items-start justify-between mb-3">
                              <div>
                                <h4 className="text-lg font-semibold text-white">{job.job_number}</h4>
                                <p className="text-sm text-gray-400">{job.game_name}</p>
                              </div>
                              <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                                job.status === 'completed' ? 'bg-green-900/50 text-green-400 border border-green-500' :
                                job.status === 'in_progress' ? 'bg-blue-900/50 text-blue-400 border border-blue-500' :
                                job.status === 'accepted' ? 'bg-purple-900/50 text-purple-400 border border-purple-500' :
                                job.status === 'available' ? 'bg-yellow-900/50 text-yellow-400 border border-yellow-500' :
                                'bg-red-900/50 text-red-400 border border-red-500'
                              }`}>
                                {job.status.toUpperCase()}
                              </span>
                            </div>

                            <div className="mb-3">
                              <p className="text-sm text-white font-medium mb-1">{job.service_name}</p>
                              <p className="text-xs text-gray-400">{job.requirements}</p>
                              {job.weapon_class && (
                                <p className="text-xs text-gray-500 mt-1">Weapon: {job.weapon_class}</p>
                              )}
                            </div>

                            <div className="space-y-2 mb-3">
                              <div className="flex justify-between text-sm">
                                <span className="text-gray-400">Payout:</span>
                                <span className="text-green-400 font-semibold">${job.payout_amount.toFixed(2)}</span>
                              </div>
                              <div className="flex justify-between text-sm">
                                <span className="text-gray-400">Est. Hours:</span>
                                <span className="text-white">{job.estimated_hours}h</span>
                              </div>
                              <div className="flex justify-between text-sm">
                                <span className="text-gray-400">Progress:</span>
                                <span className="text-white font-semibold">{job.progress_percentage}%</span>
                              </div>
                              <div className="w-full bg-gray-700 rounded-full h-2">
                                <div
                                  className="bg-primary-600 h-2 rounded-full transition-all duration-300"
                                  style={{ width: `${job.progress_percentage}%` }}
                                />
                              </div>
                            </div>

                            {job.users && (
                              <div className="text-xs text-gray-400 mb-2">
                                <span className="font-semibold">Booster:</span>{' '}
                                {job.users.full_name ? `${job.users.full_name} (${job.users.email})` : job.users.email}
                              </div>
                            )}

                            <div className="text-xs text-gray-500">
                              <div>Order: {job.order_number}</div>
                              <div>Created: {new Date(job.created_at).toLocaleDateString()}</div>
                              {job.accepted_at && <div>Accepted: {new Date(job.accepted_at).toLocaleDateString()}</div>}
                              {job.completed_at && <div>Completed: {new Date(job.completed_at).toLocaleDateString()}</div>}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Users Tab */}
              {activeTab === 'users' && (
                <div>
                  <h2 className="text-2xl font-bold text-white mb-6">User Management</h2>
                  <div className="bg-gray-800 border border-gray-700 rounded-lg p-6 text-center">
                    <svg className="w-16 h-16 text-gray-600 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                    </svg>
                    <h3 className="text-lg font-semibold text-white mb-2">User Management</h3>
                    <p className="text-gray-400 text-sm">
                      User list and management features coming soon.
                    </p>
                  </div>
                </div>
              )}

              {/* Services & Games Tab */}
              {activeTab === 'services' && (
                <div>
                  <h2 className="text-2xl font-bold text-white mb-6">Services & Games Management</h2>
                  <div className="bg-gray-800 border border-gray-700 rounded-lg p-6 text-center">
                    <svg className="w-16 h-16 text-gray-600 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 4a2 2 0 114 0v1a1 1 0 001 1h3a1 1 0 011 1v3a1 1 0 01-1 1h-1a2 2 0 100 4h1a1 1 0 011 1v3a1 1 0 01-1 1h-3a1 1 0 01-1-1v-1a2 2 0 10-4 0v1a1 1 0 01-1 1H7a1 1 0 01-1-1v-3a1 1 0 00-1-1H4a2 2 0 110-4h1a1 1 0 001-1V7a1 1 0 011-1h3a1 1 0 001-1V4z" />
                    </svg>
                    <h3 className="text-lg font-semibold text-white mb-2">Services & Games</h3>
                    <p className="text-gray-400 text-sm">
                      Manage games and services from this panel.
                    </p>
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

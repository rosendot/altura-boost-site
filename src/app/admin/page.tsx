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

export default function AdminPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [applications, setApplications] = useState<BoosterApplication[]>([]);

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
                  <h2 className="text-2xl font-bold text-white mb-6">Orders Management</h2>
                  <div className="bg-gray-800 border border-gray-700 rounded-lg p-6 text-center">
                    <svg className="w-16 h-16 text-gray-600 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                    </svg>
                    <h3 className="text-lg font-semibold text-white mb-2">No Orders Yet</h3>
                    <p className="text-gray-400 text-sm">
                      Orders will appear here once customers start placing them.
                    </p>
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

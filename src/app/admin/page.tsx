'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import GameCarousel from '@/components/GameCarousel';
import StrikeModal from '@/components/StrikeModal';

interface UserData {
  id: string;
  email: string;
  role: 'customer' | 'booster' | 'admin';
  full_name: string | null;
  phone: string | null;
  total_earnings: number | null;
  created_at: string;
  strike_count: number | null;
  suspension_count: number | null;
  is_suspended: boolean | null;
  suspended_at: string | null;
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

interface Game {
  id: string;
  name: string;
  slug: string;
  image_url: string | null;
  active: boolean;
  created_at: string;
}

interface Service {
  id: string;
  game_id: string;
  name: string;
  description: string | null;
  price: number;
  delivery_time_hours: number;
  active: boolean;
  created_at: string;
  updated_at: string;
}

interface Message {
  id: string;
  message_text: string | null;
  sender_id: string;
  created_at: string;
  read_at: string | null;
  is_system_message: boolean;
}

interface AdminReview {
  id: string;
  rating: number;
  quality_rating: number | null;
  communication_rating: number | null;
  timeliness_rating: number | null;
  review_text: string | null;
  delivery_status: string;
  is_flagged: boolean | null;
  requires_admin_review: boolean | null;
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
  booster: {
    id: string;
    full_name: string | null;
    email: string;
  } | null;
}

interface ConversationUser {
  id: string;
  email: string;
  full_name: string | null;
}

interface Strike {
  id: string;
  reason: string;
  strike_type: string;
  severity: string;
  is_active: boolean;
  created_at: string;
  job_id: string;
  jobs: {
    job_number: string;
    service_name: string;
    game_name: string;
  } | null;
}

interface Appeal {
  id: string;
  user_id: string;
  appeal_text: string;
  status: 'pending' | 'approved' | 'rejected';
  submitted_at: string;
  reviewed_at: string | null;
  reviewed_by: string | null;
  admin_notes: string | null;
  users: {
    email: string;
    full_name: string | null;
    is_suspended: boolean | null;
    suspension_reason: string | null;
    suspended_at: string | null;
  } | null;
}

interface Conversation {
  id: string;
  job_id: string;
  customer_id: string;
  booster_id: string;
  created_at: string;
  last_message_at: string;
  status: string;
  customer_archived: boolean;
  booster_archived: boolean;
  jobs: {
    job_number: string;
    service_name: string;
    game_name: string;
    status: string;
  };
  customer: ConversationUser;
  booster: ConversationUser;
  message_count: number;
  unread_count: number;
  last_message: Message | null;
  messages?: Message[];
}

export default function AdminPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('applications');
  const [applications, setApplications] = useState<BoosterApplication[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [users, setUsers] = useState<UserData[]>([]);
  const [userFilter, setUserFilter] = useState<'all' | 'customer' | 'booster' | 'admin'>('all');
  const [games, setGames] = useState<Game[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [selectedGame, setSelectedGame] = useState<string | null>(null);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [conversationMessages, setConversationMessages] = useState<Message[]>([]);
  const [reviews, setReviews] = useState<AdminReview[]>([]);
  const [strikeModalOpen, setStrikeModalOpen] = useState(false);
  const [selectedReviewForStrike, setSelectedReviewForStrike] = useState<AdminReview | null>(null);
  const [selectedUserForStrikes, setSelectedUserForStrikes] = useState<UserData | null>(null);
  const [userStrikes, setUserStrikes] = useState<Strike[]>([]);
  const [strikesLoading, setStrikesLoading] = useState(false);
  const [showStrikesModal, setShowStrikesModal] = useState(false);
  const [appeals, setAppeals] = useState<Appeal[]>([]);
  const [appealsLoading, setAppealsLoading] = useState(false);
  const [selectedAppeal, setSelectedAppeal] = useState<Appeal | null>(null);
  const [adminNotes, setAdminNotes] = useState('');

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
        .select('id, email, role, full_name, phone, total_earnings, created_at, strike_count, suspension_count, is_suspended, suspended_at')
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
    if (activeTab === 'users' && userData?.role === 'admin') {
      fetchUsers();
    }
    if (activeTab === 'services' && userData?.role === 'admin') {
      fetchGames();
      fetchServices();
    }
    if (activeTab === 'conversations' && userData?.role === 'admin') {
      fetchConversations();
    }
    if (activeTab === 'reviews' && userData?.role === 'admin') {
      fetchReviews();
    }
    if (activeTab === 'appeals' && userData?.role === 'admin') {
      fetchAppeals();
    }
  }, [activeTab, userData]);

  const fetchApplications = async () => {
    const supabase = createClient();
    const { data, error } = await supabase
      .from('booster_applications')
      .select(`
        *,
        users!booster_applications_user_id_fkey (
          email,
          full_name
        )
      `)
      .order('submitted_at', { ascending: false });

    if (error) {
      console.error('Error fetching applications:', error);
      return;
    }

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

  const fetchUsers = async () => {
    const supabase = createClient();
    const { data } = await supabase
      .from('users')
      .select('id, email, role, full_name, phone, total_earnings, created_at, strike_count, suspension_count, is_suspended, suspended_at')
      .order('created_at', { ascending: false });

    if (data) {
      setUsers(data);
    }
  };

  const fetchGames = async () => {
    const supabase = createClient();
    const { data } = await supabase
      .from('games')
      .select('*')
      .order('created_at', { ascending: false });

    if (data) {
      setGames(data);
    }
  };

  const fetchServices = async () => {
    const supabase = createClient();
    const { data } = await supabase
      .from('services')
      .select('*')
      .order('created_at', { ascending: false });

    if (data) {
      setServices(data);
    }
  };

  const fetchConversations = async () => {
    try {
      const res = await fetch('/api/admin/conversations');
      if (res.ok) {
        const data = await res.json();
        setConversations(data.conversations || []);
      }
    } catch (error) {
      console.error('Error fetching conversations:', error);
    }
  };

  const fetchConversationMessages = async (conversationId: string) => {
    try {
      const res = await fetch(`/api/conversations/${conversationId}/messages`);
      if (res.ok) {
        const data = await res.json();
        setConversationMessages(data.messages || []);
      }
    } catch (error) {
      console.error('Error fetching messages:', error);
    }
  };

  const fetchReviews = async () => {
    try {
      const res = await fetch('/api/admin/reviews');
      if (res.ok) {
        const data = await res.json();
        setReviews(data.reviews || []);
      }
    } catch (error) {
      console.error('Error fetching reviews:', error);
    }
  };

  const fetchUserStrikes = async (boosterId: string) => {
    setStrikesLoading(true);
    try {
      const res = await fetch(`/api/admin/strikes/booster/${boosterId}`);
      if (res.ok) {
        const data = await res.json();
        setUserStrikes(data.strikes || []);
      }
    } catch (error) {
      console.error('Error fetching strikes:', error);
    } finally {
      setStrikesLoading(false);
    }
  };

  const handleViewStrikes = async (user: UserData) => {
    setSelectedUserForStrikes(user);
    setShowStrikesModal(true);
    await fetchUserStrikes(user.id);
  };

  const handleDeactivateStrike = async (strikeId: string) => {
    if (!confirm('Are you sure you want to deactivate this strike? It will no longer count toward suspension.')) {
      return;
    }

    try {
      const res = await fetch(`/api/admin/strikes/${strikeId}`, {
        method: 'PATCH',
      });

      if (res.ok) {
        alert('Strike deactivated successfully');
        if (selectedUserForStrikes) {
          await fetchUserStrikes(selectedUserForStrikes.id);
          await fetchUsers();
        }
      } else {
        const error = await res.json();
        alert(error.error || 'Failed to deactivate strike');
      }
    } catch (error) {
      console.error('Error deactivating strike:', error);
      alert('Failed to deactivate strike');
    }
  };

  const handleDeleteStrike = async (strikeId: string) => {
    if (!confirm('Are you sure you want to permanently DELETE this strike? This action cannot be undone.')) {
      return;
    }

    try {
      const res = await fetch(`/api/admin/strikes/${strikeId}`, {
        method: 'DELETE',
      });

      if (res.ok) {
        alert('Strike deleted successfully');
        if (selectedUserForStrikes) {
          await fetchUserStrikes(selectedUserForStrikes.id);
          await fetchUsers();
        }
      } else {
        const error = await res.json();
        alert(error.error || 'Failed to delete strike');
      }
    } catch (error) {
      console.error('Error deleting strike:', error);
      alert('Failed to delete strike');
    }
  };

  const fetchAppeals = async () => {
    setAppealsLoading(true);
    try {
      const res = await fetch('/api/admin/appeals');
      if (res.ok) {
        const data = await res.json();
        setAppeals(data.appeals || []);
      }
    } catch (error) {
      console.error('Error fetching appeals:', error);
    } finally {
      setAppealsLoading(false);
    }
  };

  const handleAppealAction = async (appealId: string, action: 'approved' | 'rejected') => {
    const confirmMsg = action === 'approved'
      ? 'Are you sure you want to APPROVE this appeal? The booster will be unsuspended.'
      : 'Are you sure you want to REJECT this appeal? The booster will remain suspended.';

    if (!confirm(confirmMsg)) {
      return;
    }

    try {
      const res = await fetch(`/api/admin/appeals/${appealId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: action,
          admin_notes: adminNotes.trim() || null,
        }),
      });

      if (res.ok) {
        alert(`Appeal ${action} successfully`);
        setSelectedAppeal(null);
        setAdminNotes('');
        await fetchAppeals();
      } else {
        const error = await res.json();
        alert(error.error || `Failed to ${action} appeal`);
      }
    } catch (error) {
      console.error(`Error ${action} appeal:`, error);
      alert(`Failed to ${action} appeal`);
    }
  };

  const handleApplicationAction = async (
    applicationId: string,
    userId: string,
    action: 'approve' | 'reject',
    rejectionReason?: string
  ) => {
    const supabase = createClient();

    if (action === 'approve') {
      // Update user's booster_approval_status to 'approved'
      const { error: userError } = await supabase
        .from('users')
        .update({
          booster_approval_status: 'approved',
        })
        .eq('id', userId);

      if (userError) {
        alert('Error updating user status: ' + userError.message);
        return;
      }

      // Update application status
      const { error: appError } = await supabase
        .from('booster_applications')
        .update({
          status: 'approved',
          reviewed_at: new Date().toISOString(),
          reviewed_by: userData?.id,
        })
        .eq('id', applicationId);

      if (appError) {
        alert('Error updating application: ' + appError.message);
        return;
      }

      alert('Application approved successfully!');
    } else {
      // Update user's booster_approval_status to 'rejected'
      const { error: userError } = await supabase
        .from('users')
        .update({
          booster_approval_status: 'rejected',
        })
        .eq('id', userId);

      if (userError) {
        alert('Error updating user status: ' + userError.message);
        return;
      }

      // Update application status
      const { error: appError } = await supabase
        .from('booster_applications')
        .update({
          status: 'rejected',
          reviewed_at: new Date().toISOString(),
          reviewed_by: userData?.id,
          rejection_reason: rejectionReason,
        })
        .eq('id', applicationId);

      if (appError) {
        alert('Error updating application: ' + appError.message);
        return;
      }

      alert('Application rejected successfully!');
    }

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
        </div>

        <div className="flex gap-8">
          {/* Sidebar */}
          <div className="w-64 flex-shrink-0">
            <div className="bg-gray-900 border border-primary-700 rounded-lg p-4">
              <nav className="space-y-2">
                <button
                  onClick={() => setActiveTab('applications')}
                  className={`w-full text-left px-4 py-3 rounded-lg transition-colors duration-200 ${activeTab === 'applications'
                    ? 'bg-primary-600 text-white'
                    : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                    }`}
                >
                  Booster Applications
                </button>
                <button
                  onClick={() => setActiveTab('orders')}
                  className={`w-full text-left px-4 py-3 rounded-lg transition-colors duration-200 ${activeTab === 'orders'
                    ? 'bg-primary-600 text-white'
                    : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                    }`}
                >
                  Orders
                </button>
                <button
                  onClick={() => setActiveTab('users')}
                  className={`w-full text-left px-4 py-3 rounded-lg transition-colors duration-200 ${activeTab === 'users'
                    ? 'bg-primary-600 text-white'
                    : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                    }`}
                >
                  Users
                </button>
                <button
                  onClick={() => setActiveTab('services')}
                  className={`w-full text-left px-4 py-3 rounded-lg transition-colors duration-200 ${activeTab === 'services'
                    ? 'bg-primary-600 text-white'
                    : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                    }`}
                >
                  Services & Games
                </button>
                <button
                  onClick={() => setActiveTab('conversations')}
                  className={`w-full text-left px-4 py-3 rounded-lg transition-colors duration-200 ${activeTab === 'conversations'
                    ? 'bg-primary-600 text-white'
                    : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                    }`}
                >
                  Conversations
                </button>
                <button
                  onClick={() => setActiveTab('reviews')}
                  className={`w-full text-left px-4 py-3 rounded-lg transition-colors duration-200 ${activeTab === 'reviews'
                    ? 'bg-primary-600 text-white'
                    : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                    }`}
                >
                  Reviews
                </button>
                <button
                  onClick={() => setActiveTab('appeals')}
                  className={`w-full text-left px-4 py-3 rounded-lg transition-colors duration-200 ${activeTab === 'appeals'
                    ? 'bg-primary-600 text-white'
                    : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                    }`}
                >
                  Appeals
                </button>
              </nav>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1">
            <div className="bg-gray-900 border border-primary-700 rounded-lg p-6">
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
                              <span className={`px-2 py-1 rounded-full text-xs font-semibold ${order.status === 'completed' ? 'bg-green-900/50 text-green-400 border border-green-500' :
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
                              <span className={`px-2 py-1 rounded-full text-xs font-semibold ${job.status === 'completed' ? 'bg-green-900/50 text-green-400 border border-green-500' :
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

                  {/* Filter Tabs */}
                  <div className="flex gap-4 mb-6">
                    <button
                      onClick={() => setUserFilter('all')}
                      className={`px-4 py-2 rounded-lg font-semibold text-sm transition-colors ${userFilter === 'all'
                        ? 'bg-primary-600 text-white'
                        : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                        }`}
                    >
                      All Users ({users.length})
                    </button>
                    <button
                      onClick={() => setUserFilter('customer')}
                      className={`px-4 py-2 rounded-lg font-semibold text-sm transition-colors ${userFilter === 'customer'
                        ? 'bg-primary-600 text-white'
                        : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                        }`}
                    >
                      Customers ({users.filter(u => u.role === 'customer').length})
                    </button>
                    <button
                      onClick={() => setUserFilter('booster')}
                      className={`px-4 py-2 rounded-lg font-semibold text-sm transition-colors ${userFilter === 'booster'
                        ? 'bg-primary-600 text-white'
                        : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                        }`}
                    >
                      Boosters ({users.filter(u => u.role === 'booster').length})
                    </button>
                    <button
                      onClick={() => setUserFilter('admin')}
                      className={`px-4 py-2 rounded-lg font-semibold text-sm transition-colors ${userFilter === 'admin'
                        ? 'bg-primary-600 text-white'
                        : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                        }`}
                    >
                      Admins ({users.filter(u => u.role === 'admin').length})
                    </button>
                  </div>

                  {/* Users List */}
                  {users.length === 0 ? (
                    <div className="bg-gray-800 border border-gray-700 rounded-lg p-6 text-center">
                      <svg className="w-16 h-16 text-gray-600 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                      </svg>
                      <h3 className="text-lg font-semibold text-white mb-2">No Users</h3>
                      <p className="text-gray-400 text-sm">
                        No users found in the database.
                      </p>
                    </div>
                  ) : (
                    <div className="bg-gray-800 border border-gray-700 rounded-lg overflow-hidden">
                      <div className="overflow-x-auto">
                        <table className="w-full">
                          <thead className="bg-gray-900 border-b border-gray-700">
                            <tr>
                              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-300 uppercase tracking-wider">
                                User
                              </th>
                              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-300 uppercase tracking-wider">
                                Email
                              </th>
                              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-300 uppercase tracking-wider">
                                Role
                              </th>
                              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-300 uppercase tracking-wider">
                                Status
                              </th>
                              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-300 uppercase tracking-wider">
                                Strikes
                              </th>
                              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-300 uppercase tracking-wider">
                                Phone
                              </th>
                              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-300 uppercase tracking-wider">
                                Earnings
                              </th>
                              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-300 uppercase tracking-wider">
                                Joined
                              </th>
                              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-300 uppercase tracking-wider">
                                Actions
                              </th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-700">
                            {users
                              .filter(u => userFilter === 'all' || u.role === userFilter)
                              .map((user) => (
                                <tr key={user.id} className={`hover:bg-gray-750 transition-colors ${user.is_suspended ? 'bg-red-900/10' : ''
                                  }`}>
                                  <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="flex items-center">
                                      <div className="flex-shrink-0 h-10 w-10 bg-primary-600 rounded-full flex items-center justify-center">
                                        <span className="text-white font-semibold text-sm">
                                          {user.full_name
                                            ? user.full_name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
                                            : user.email.slice(0, 2).toUpperCase()}
                                        </span>
                                      </div>
                                      <div className="ml-4">
                                        <div className="text-sm font-medium text-white">
                                          {user.full_name || 'No name provided'}
                                        </div>
                                        <div className="text-xs text-gray-400">
                                          ID: {user.id.slice(0, 8)}...
                                        </div>
                                      </div>
                                    </div>
                                  </td>
                                  <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="text-sm text-gray-300">{user.email}</div>
                                  </td>
                                  <td className="px-6 py-4 whitespace-nowrap">
                                    <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${user.role === 'admin' ? 'bg-yellow-900/50 text-yellow-400 border border-yellow-500' :
                                      user.role === 'booster' ? 'bg-purple-900/50 text-purple-400 border border-purple-500' :
                                        'bg-blue-900/50 text-blue-400 border border-blue-500'
                                      }`}>
                                      {user.role.toUpperCase()}
                                    </span>
                                  </td>
                                  <td className="px-6 py-4 whitespace-nowrap">
                                    {user.role === 'booster' ? (
                                      <div className="flex flex-col gap-1">
                                        {user.is_suspended ? (
                                          <>
                                            <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-900/50 text-red-400 border border-red-500">
                                              SUSPENDED
                                            </span>
                                            {user.suspension_count && user.suspension_count > 0 && (
                                              <span className="text-xs text-gray-500">
                                                {user.suspension_count}x suspended
                                              </span>
                                            )}
                                          </>
                                        ) : (
                                          <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-900/50 text-green-400 border border-green-500">
                                            ACTIVE
                                          </span>
                                        )}
                                      </div>
                                    ) : (
                                      <span className="text-sm text-gray-500">-</span>
                                    )}
                                  </td>
                                  <td className="px-6 py-4 whitespace-nowrap">
                                    {user.role === 'booster' ? (
                                      <div className="text-sm">
                                        <span className={`font-semibold ${(user.strike_count || 0) >= 3 ? 'text-red-400' :
                                          (user.strike_count || 0) >= 2 ? 'text-yellow-400' :
                                            'text-gray-300'
                                          }`}>
                                          {user.strike_count || 0}/3
                                        </span>
                                        <span className="text-gray-500 ml-1">strikes</span>
                                      </div>
                                    ) : (
                                      <span className="text-sm text-gray-500">-</span>
                                    )}
                                  </td>
                                  <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="text-sm text-gray-300">
                                      {user.phone || '-'}
                                    </div>
                                  </td>
                                  <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="text-sm text-green-400 font-semibold">
                                      {user.role === 'booster' && user.total_earnings
                                        ? `$${Number(user.total_earnings).toFixed(2)}`
                                        : '-'}
                                    </div>
                                  </td>
                                  <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="text-sm text-gray-400">
                                      {new Date(user.created_at).toLocaleDateString()}
                                    </div>
                                  </td>
                                  <td className="px-6 py-4 whitespace-nowrap">
                                    {user.role === 'booster' && (
                                      <button
                                        onClick={() => handleViewStrikes(user)}
                                        className="px-3 py-1.5 bg-gray-700 text-white text-xs rounded hover:bg-gray-600 transition font-semibold"
                                      >
                                        View Strikes
                                      </button>
                                    )}
                                  </td>
                                </tr>
                              ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Services & Games Tab */}
              {activeTab === 'services' && (
                <div>
                  <h2 className="text-2xl font-bold text-white mb-6">Services & Games Management</h2>

                  {/* Games Section */}
                  <div className="mb-8">
                    <h3 className="text-xl font-semibold text-white mb-4">Games</h3>
                    <GameCarousel games={games} onGameClick={(gameId) => setSelectedGame(gameId)} />
                  </div>

                  {/* Services Section */}
                  {selectedGame && (
                    <div>
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-xl font-semibold text-white">
                          Services for {games.find(g => g.id === selectedGame)?.name}
                        </h3>
                        <button
                          onClick={() => setSelectedGame(null)}
                          className="text-sm text-gray-400 hover:text-white transition-colors"
                        >
                          Clear Selection
                        </button>
                      </div>
                      {services.length === 0 ? (
                        <div className="bg-gray-800 border border-gray-700 rounded-lg p-6 text-center">
                          <p className="text-gray-400 text-sm">
                            No services found. Add services to games.
                          </p>
                        </div>
                      ) : (
                        <div className="bg-gray-800 border border-gray-700 rounded-lg overflow-hidden">
                          <div className="overflow-x-auto">
                            <table className="w-full">
                              <thead className="bg-gray-900 border-b border-gray-700">
                                <tr>
                                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-300 uppercase tracking-wider">
                                    Service
                                  </th>
                                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-300 uppercase tracking-wider">
                                    Game
                                  </th>
                                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-300 uppercase tracking-wider">
                                    Price
                                  </th>
                                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-300 uppercase tracking-wider">
                                    Delivery Time
                                  </th>
                                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-300 uppercase tracking-wider">
                                    Status
                                  </th>
                                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-300 uppercase tracking-wider">
                                    Created
                                  </th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-gray-700">
                                {services
                                  .filter(s => !selectedGame || s.game_id === selectedGame)
                                  .map((service) => (
                                    <tr key={service.id} className="hover:bg-gray-750 transition-colors">
                                      <td className="px-6 py-4">
                                        <div className="text-sm font-medium text-white">
                                          {service.name}
                                        </div>
                                        {service.description && (
                                          <div className="text-xs text-gray-400 mt-1 max-w-md truncate">
                                            {service.description}
                                          </div>
                                        )}
                                      </td>
                                      <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm text-gray-300">
                                          {games.find(g => g.id === service.game_id)?.name || 'Unknown'}
                                        </div>
                                      </td>
                                      <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm text-green-400 font-semibold">
                                          ${service.price.toFixed(2)}
                                        </div>
                                      </td>
                                      <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm text-gray-300">
                                          {service.delivery_time_hours}h
                                        </div>
                                      </td>
                                      <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${service.active
                                          ? 'bg-green-900/50 text-green-400 border border-green-500'
                                          : 'bg-red-900/50 text-red-400 border border-red-500'
                                          }`}>
                                          {service.active ? 'ACTIVE' : 'INACTIVE'}
                                        </span>
                                      </td>
                                      <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm text-gray-400">
                                          {new Date(service.created_at).toLocaleDateString()}
                                        </div>
                                      </td>
                                    </tr>
                                  ))}
                              </tbody>
                            </table>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* Conversations Tab */}
              {activeTab === 'conversations' && (
                <div>
                  <h2 className="text-2xl font-bold text-white mb-6">Conversations Monitor</h2>

                  {/* Stats */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                    <div className="bg-gradient-to-br from-blue-600 to-blue-700 rounded-lg p-4">
                      <div className="text-sm text-gray-200 mb-1">Total Conversations</div>
                      <div className="text-3xl font-bold text-white">{conversations.length}</div>
                      <div className="text-xs text-gray-300 mt-1">All time</div>
                    </div>

                    <div className="bg-gradient-to-br from-green-600 to-green-700 rounded-lg p-4">
                      <div className="text-sm text-gray-200 mb-1">Active Conversations</div>
                      <div className="text-3xl font-bold text-white">
                        {conversations.filter(c => c.status === 'active').length}
                      </div>
                      <div className="text-xs text-gray-300 mt-1">Currently active</div>
                    </div>

                    <div className="bg-gradient-to-br from-yellow-600 to-yellow-700 rounded-lg p-4">
                      <div className="text-sm text-gray-200 mb-1">Unread Messages</div>
                      <div className="text-3xl font-bold text-white">
                        {conversations.reduce((sum, c) => sum + c.unread_count, 0)}
                      </div>
                      <div className="text-xs text-gray-300 mt-1">Across all conversations</div>
                    </div>
                  </div>

                  {/* Conversations List */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Conversation List */}
                    <div className="bg-gray-800 border border-gray-700 rounded-lg overflow-hidden">
                      <div className="p-4 border-b border-gray-700">
                        <h3 className="font-semibold text-white">All Conversations</h3>
                      </div>
                      <div className="overflow-y-auto max-h-[600px]">
                        {conversations.length === 0 ? (
                          <div className="p-6 text-center">
                            <p className="text-gray-400 text-sm">No conversations yet.</p>
                          </div>
                        ) : (
                          conversations.map((conv) => (
                            <button
                              key={conv.id}
                              onClick={() => {
                                setSelectedConversation(conv);
                                fetchConversationMessages(conv.id);
                              }}
                              className={`w-full p-4 border-b border-gray-700 hover:bg-gray-750 text-left transition ${selectedConversation?.id === conv.id ? 'bg-gray-750' : ''
                                }`}
                            >
                              <div className="flex justify-between items-start mb-2">
                                <div className="font-semibold text-sm text-white">
                                  {conv.jobs.game_name} - Job #{conv.jobs.job_number}
                                </div>
                                {conv.unread_count > 0 && (
                                  <span className="bg-yellow-600 text-white text-xs px-2 py-1 rounded-full">
                                    {conv.unread_count} unread
                                  </span>
                                )}
                              </div>
                              <div className="text-xs text-gray-400 mb-1">
                                Customer: {conv.customer.full_name || conv.customer.email}
                              </div>
                              <div className="text-xs text-gray-400 mb-2">
                                Booster: {conv.booster.full_name || conv.booster.email}
                              </div>
                              <div className="flex justify-between items-center">
                                <span className={`px-2 py-1 rounded-full text-xs font-semibold ${conv.jobs.status === 'completed' ? 'bg-green-900/50 text-green-400 border border-green-500' :
                                  conv.jobs.status === 'in_progress' ? 'bg-blue-900/50 text-blue-400 border border-blue-500' :
                                    'bg-purple-900/50 text-purple-400 border border-purple-500'
                                  }`}>
                                  {conv.jobs.status.toUpperCase()}
                                </span>
                                <span className="text-xs text-gray-500">
                                  {conv.message_count} messages
                                </span>
                              </div>
                              {conv.last_message && (
                                <div className="text-xs text-gray-500 mt-2 truncate">
                                  Last: {conv.last_message.message_text || '📎 Attachment'}
                                </div>
                              )}
                            </button>
                          ))
                        )}
                      </div>
                    </div>

                    {/* Message Viewer */}
                    <div className="bg-gray-800 border border-gray-700 rounded-lg flex flex-col">
                      {selectedConversation ? (
                        <>
                          <div className="p-4 border-b border-gray-700">
                            <div className="font-semibold text-white mb-1">
                              {selectedConversation.jobs.game_name} - {selectedConversation.jobs.service_name}
                            </div>
                            <div className="text-xs text-gray-400">
                              Job #{selectedConversation.jobs.job_number}
                            </div>
                            <div className="text-xs text-gray-400 mt-1">
                              Customer: {selectedConversation.customer.full_name || selectedConversation.customer.email}
                            </div>
                            <div className="text-xs text-gray-400">
                              Booster: {selectedConversation.booster.full_name || selectedConversation.booster.email}
                            </div>
                          </div>

                          <div className="flex-1 overflow-y-auto p-4 space-y-3 max-h-[500px] bg-black">
                            {conversationMessages.map((msg) => {
                              const isCustomerMessage = msg.sender_id === selectedConversation.customer_id;
                              const isSystemMessage = msg.is_system_message;

                              if (isSystemMessage) {
                                return (
                                  <div key={msg.id} className="flex justify-center">
                                    <div className="bg-gray-800 text-gray-400 text-xs px-3 py-1 rounded-full">
                                      {msg.message_text}
                                    </div>
                                  </div>
                                );
                              }

                              return (
                                <div key={msg.id} className="flex flex-col">
                                  <div className="text-xs text-gray-500 mb-1">
                                    {isCustomerMessage ? 'Customer' : 'Booster'}
                                  </div>
                                  <div className={`px-3 py-2 rounded-lg ${isCustomerMessage
                                    ? 'bg-blue-900/50 text-blue-100 border border-blue-700'
                                    : 'bg-purple-900/50 text-purple-100 border border-purple-700'
                                    }`}>
                                    <div className="text-sm">{msg.message_text || '📎 Attachment'}</div>
                                    <div className="text-xs text-gray-400 mt-1">
                                      {new Date(msg.created_at).toLocaleString()}
                                      {msg.read_at ? ' • Read' : ' • Unread'}
                                    </div>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </>
                      ) : (
                        <div className="flex-1 flex items-center justify-center text-gray-500 p-6">
                          Select a conversation to view messages
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Reviews Tab */}
              {activeTab === 'reviews' && (
                <div>
                  <h2 className="text-2xl font-bold text-white mb-6">Customer Reviews</h2>

                  {reviews.length === 0 ? (
                    <div className="bg-gray-800 border border-gray-700 rounded-lg p-6 text-center">
                      <svg className="w-16 h-16 text-gray-600 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                      </svg>
                      <h3 className="text-lg font-semibold text-white mb-2">No Reviews Yet</h3>
                      <p className="text-gray-400 text-sm">
                        Customer reviews will appear here once jobs are completed and reviewed.
                      </p>
                    </div>
                  ) : (
                    <div>
                      {/* Stats Cards */}
                      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                        <div className="bg-gradient-to-br from-yellow-600 to-yellow-700 rounded-lg p-4">
                          <div className="text-sm text-yellow-100 mb-1">Total Reviews</div>
                          <div className="text-3xl font-bold text-white">{reviews.length}</div>
                        </div>
                        <div className="bg-gradient-to-br from-green-600 to-green-700 rounded-lg p-4">
                          <div className="text-sm text-green-100 mb-1">Average Rating</div>
                          <div className="text-3xl font-bold text-white">
                            {(reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length).toFixed(1)} ★
                          </div>
                        </div>
                        <div className="bg-gradient-to-br from-blue-600 to-blue-700 rounded-lg p-4">
                          <div className="text-sm text-blue-100 mb-1">Complete Deliveries</div>
                          <div className="text-3xl font-bold text-white">
                            {reviews.filter(r => r.delivery_status === 'complete').length}
                          </div>
                        </div>
                        <div className="bg-gradient-to-br from-red-600 to-red-700 rounded-lg p-4">
                          <div className="text-sm text-red-100 mb-1">Flagged Reviews</div>
                          <div className="text-3xl font-bold text-white">
                            {reviews.filter(r => r.is_flagged || r.requires_admin_review).length}
                          </div>
                        </div>
                      </div>

                      {/* Reviews List */}
                      <div className="space-y-4">
                        {reviews.map((review) => (
                          <div
                            key={review.id}
                            className={`bg-gray-800 border rounded-lg p-6 hover:border-primary-600 transition ${review.is_flagged || review.requires_admin_review
                              ? 'border-red-500'
                              : 'border-gray-700'
                              }`}
                          >
                            {/* Review Header */}
                            <div className="flex justify-between items-start mb-4">
                              <div>
                                <h3 className="text-xl font-semibold text-white mb-1">
                                  {review.jobs?.service_name || 'Unknown Service'}
                                </h3>
                                <p className="text-sm text-gray-400">{review.jobs?.game_name || 'Unknown Game'} • Job #{review.jobs?.job_number || 'N/A'}</p>
                                <div className="flex gap-4 mt-2 text-xs">
                                  <span className="text-gray-500">
                                    Customer: {review.customer?.full_name || review.customer?.email || 'Anonymous'}
                                  </span>
                                  <span className="text-gray-500">
                                    Booster: {review.booster?.full_name || review.booster?.email || 'Anonymous'}
                                  </span>
                                </div>
                              </div>
                              <div className="text-right">
                                <div className="flex items-center gap-1 mb-2">
                                  {[...Array(5)].map((_, i) => (
                                    <span
                                      key={i}
                                      className={`text-2xl ${i < review.rating ? 'text-yellow-400' : 'text-gray-600'
                                        }`}
                                    >
                                      ★
                                    </span>
                                  ))}
                                </div>
                                <div className="flex gap-2 flex-wrap justify-end">
                                  <span className={`inline-block px-2 py-1 rounded text-xs font-semibold ${review.delivery_status === 'complete'
                                    ? 'bg-green-900/50 text-green-400'
                                    : review.delivery_status === 'incomplete'
                                      ? 'bg-yellow-900/50 text-yellow-400'
                                      : 'bg-red-900/50 text-red-400'
                                    }`}>
                                    {review.delivery_status === 'complete' ? 'Complete' :
                                      review.delivery_status === 'incomplete' ? 'Incomplete' :
                                        'Poor Quality'}
                                  </span>
                                  {(review.is_flagged || review.requires_admin_review) && (
                                    <span className="inline-block px-2 py-1 rounded text-xs font-semibold bg-red-900/50 text-red-400 border border-red-500">
                                      ⚠ FLAGGED
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>

                            {/* Review Content */}
                            {review.review_text && (
                              <div className="mb-4 p-3 bg-gray-900 rounded-lg">
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
                            <div className="border-t border-gray-700 pt-4 flex justify-between items-center">
                              <div className="text-xs text-gray-500">
                                {new Date(review.created_at).toLocaleDateString('en-US', {
                                  year: 'numeric',
                                  month: 'long',
                                  day: 'numeric',
                                  hour: '2-digit',
                                  minute: '2-digit',
                                })}
                              </div>
                              {review.booster && (
                                <button
                                  onClick={() => {
                                    setSelectedReviewForStrike(review);
                                    setStrikeModalOpen(true);
                                  }}
                                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition font-semibold text-sm"
                                >
                                  Issue Strike
                                </button>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Appeals Tab */}
              {activeTab === 'appeals' && (
                <div>
                  <h2 className="text-2xl font-bold text-white mb-6">Suspension Appeals</h2>

                  {appealsLoading ? (
                    <div className="bg-gray-800 border border-gray-700 rounded-lg p-6 text-center">
                      <p className="text-gray-400">Loading appeals...</p>
                    </div>
                  ) : (
                    <div>
                      {/* Filter Tabs */}
                      <div className="flex gap-4 mb-6">
                        <button className="px-4 py-2 bg-yellow-600 text-white rounded-lg font-semibold text-sm">
                          Pending ({appeals.filter(a => a.status === 'pending').length})
                        </button>
                        <button className="px-4 py-2 bg-gray-700 text-gray-300 rounded-lg font-semibold text-sm hover:bg-gray-600">
                          Approved ({appeals.filter(a => a.status === 'approved').length})
                        </button>
                        <button className="px-4 py-2 bg-gray-700 text-gray-300 rounded-lg font-semibold text-sm hover:bg-gray-600">
                          Rejected ({appeals.filter(a => a.status === 'rejected').length})
                        </button>
                      </div>

                      {/* Appeals List */}
                      <div className="space-y-4">
                        {appeals.filter(a => a.status === 'pending').length === 0 ? (
                          <div className="bg-gray-800 border border-gray-700 rounded-lg p-6 text-center">
                            <p className="text-gray-400">No pending appeals.</p>
                          </div>
                        ) : (
                          appeals
                            .filter(a => a.status === 'pending')
                            .map((appeal) => (
                              <div
                                key={appeal.id}
                                className={`bg-gray-800 border rounded-lg p-6 ${appeal.status === 'pending'
                                  ? 'border-yellow-500'
                                  : appeal.status === 'approved'
                                    ? 'border-green-500'
                                    : 'border-red-500'
                                  }`}
                              >
                                {/* Appeal Header */}
                                <div className="flex justify-between items-start mb-4">
                                  <div>
                                    <h3 className="text-xl font-semibold text-white mb-1">
                                      {appeal.users?.full_name || appeal.users?.email || 'Unknown User'}
                                    </h3>
                                    <div className="flex gap-4 mt-2 text-xs">
                                      <span className="text-gray-500">
                                        Submitted: {new Date(appeal.submitted_at).toLocaleDateString('en-US', {
                                          year: 'numeric',
                                          month: 'short',
                                          day: 'numeric',
                                          hour: '2-digit',
                                          minute: '2-digit',
                                        })}
                                      </span>
                                      {appeal.users?.is_suspended && (
                                        <span className="px-2 py-0.5 bg-red-900/50 text-red-400 border border-red-500 rounded text-xs font-semibold">
                                          SUSPENDED
                                        </span>
                                      )}
                                    </div>
                                  </div>
                                  <div>
                                    <span
                                      className={`px-3 py-1 rounded-full text-xs font-semibold ${appeal.status === 'pending'
                                        ? 'bg-yellow-900/50 text-yellow-400 border border-yellow-500'
                                        : appeal.status === 'approved'
                                          ? 'bg-green-900/50 text-green-400 border border-green-500'
                                          : 'bg-red-900/50 text-red-400 border border-red-500'
                                        }`}
                                    >
                                      {appeal.status.toUpperCase()}
                                    </span>
                                  </div>
                                </div>

                                {/* Suspension Reason */}
                                {appeal.users?.suspension_reason && (
                                  <div className="mb-4 p-3 bg-red-900/20 border border-red-500/30 rounded">
                                    <h4 className="text-sm font-semibold text-red-400 mb-1">Suspension Reason:</h4>
                                    <p className="text-sm text-gray-300">{appeal.users.suspension_reason}</p>
                                    {appeal.users.suspended_at && (
                                      <p className="text-xs text-gray-500 mt-1">
                                        Suspended on: {new Date(appeal.users.suspended_at).toLocaleDateString('en-US', {
                                          year: 'numeric',
                                          month: 'long',
                                          day: 'numeric',
                                        })}
                                      </p>
                                    )}
                                  </div>
                                )}

                                {/* Appeal Text */}
                                <div className="mb-4 p-3 bg-gray-700/30 rounded">
                                  <h4 className="text-sm font-semibold text-gray-300 mb-2">Appeal:</h4>
                                  <p className="text-sm text-white whitespace-pre-wrap">{appeal.appeal_text}</p>
                                </div>

                                {/* Admin Notes (if reviewed) */}
                                {appeal.admin_notes && (
                                  <div className="mb-4 p-3 bg-blue-900/20 border border-blue-500/30 rounded">
                                    <h4 className="text-sm font-semibold text-blue-400 mb-1">Admin Notes:</h4>
                                    <p className="text-sm text-gray-300">{appeal.admin_notes}</p>
                                    {appeal.reviewed_at && (
                                      <p className="text-xs text-gray-500 mt-1">
                                        Reviewed on: {new Date(appeal.reviewed_at).toLocaleDateString('en-US', {
                                          year: 'numeric',
                                          month: 'long',
                                          day: 'numeric',
                                          hour: '2-digit',
                                          minute: '2-digit',
                                        })}
                                      </p>
                                    )}
                                  </div>
                                )}

                                {/* Action Buttons (only for pending appeals) */}
                                {appeal.status === 'pending' && (
                                  <div className="border-t border-gray-700 pt-4">
                                    <button
                                      onClick={() => setSelectedAppeal(appeal)}
                                      className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition font-semibold text-sm"
                                    >
                                      Review Appeal
                                    </button>
                                  </div>
                                )}
                              </div>
                            ))
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Strike Modal */}
      {selectedReviewForStrike && (
        <StrikeModal
          isOpen={strikeModalOpen}
          onClose={() => {
            setStrikeModalOpen(false);
            setSelectedReviewForStrike(null);
          }}
          boosterId={selectedReviewForStrike.booster?.id || ''}
          boosterName={selectedReviewForStrike.booster?.full_name || selectedReviewForStrike.booster?.email || 'Unknown'}
          jobId={selectedReviewForStrike.job_id}
          jobNumber={selectedReviewForStrike.jobs?.job_number || 'N/A'}
          onStrikeIssued={() => {
            fetchReviews();
            setStrikeModalOpen(false);
            setSelectedReviewForStrike(null);
          }}
        />
      )}

      {/* Strikes Management Modal */}
      {showStrikesModal && selectedUserForStrikes && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-900 rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto border border-gray-700">
            <div className="sticky top-0 bg-gray-900 border-b border-gray-700 p-6 flex justify-between items-start">
              <div>
                <h2 className="text-2xl font-bold text-white mb-1">Strike Management</h2>
                <p className="text-gray-400">
                  {selectedUserForStrikes.full_name || selectedUserForStrikes.email}
                </p>
                <div className="flex gap-4 mt-2 text-sm">
                  <span className="text-gray-500">
                    Active Strikes: <span className={`font-bold ${(selectedUserForStrikes.strike_count || 0) >= 3 ? 'text-red-400' : 'text-yellow-400'}`}>
                      {selectedUserForStrikes.strike_count || 0}/3
                    </span>
                  </span>
                  {selectedUserForStrikes.is_suspended && (
                    <span className="px-2 py-0.5 bg-red-900/50 text-red-400 border border-red-500 rounded text-xs font-semibold">
                      SUSPENDED
                    </span>
                  )}
                </div>
              </div>
              <button
                onClick={() => {
                  setShowStrikesModal(false);
                  setSelectedUserForStrikes(null);
                  setUserStrikes([]);
                }}
                className="text-gray-400 hover:text-white text-2xl"
              >
                ×
              </button>
            </div>

            <div className="p-6">
              {strikesLoading ? (
                <div className="text-center py-12">
                  <div className="text-gray-400">Loading strikes...</div>
                </div>
              ) : userStrikes.length === 0 ? (
                <div className="text-center py-12">
                  <svg className="w-16 h-16 text-gray-600 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <p className="text-gray-400">No strikes found for this booster.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {userStrikes.map((strike) => (
                    <div
                      key={strike.id}
                      className={`border rounded-lg p-4 ${strike.is_active
                        ? 'bg-red-900/10 border-red-700'
                        : 'bg-gray-800 border-gray-700 opacity-60'
                        }`}
                    >
                      <div className="flex justify-between items-start mb-3">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h3 className="text-lg font-semibold text-white">
                              {strike.jobs?.service_name || 'Unknown Service'}
                            </h3>
                            {!strike.is_active && (
                              <span className="px-2 py-0.5 bg-gray-700 text-gray-400 text-xs font-semibold rounded">
                                DEACTIVATED
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-gray-400">
                            {strike.jobs?.game_name || 'Unknown Game'} • Job #{strike.jobs?.job_number || 'N/A'}
                          </p>
                          <div className="flex gap-3 mt-2 text-xs">
                            <span className="text-gray-500">
                              Type: <span className="text-gray-300 capitalize">{strike.strike_type.replace(/_/g, ' ')}</span>
                            </span>
                            <span className="text-gray-500">
                              Severity: <span className={`font-semibold ${strike.severity === 'severe' ? 'text-red-400' :
                                strike.severity === 'moderate' ? 'text-yellow-400' :
                                  'text-gray-300'
                                }`}>{strike.severity}</span>
                            </span>
                          </div>
                        </div>
                        <span className="text-xs text-gray-500">
                          {new Date(strike.created_at).toLocaleDateString()}
                        </span>
                      </div>

                      <div className="mb-4 p-3 bg-gray-950 rounded border border-gray-800">
                        <p className="text-sm text-gray-400 mb-1">Reason:</p>
                        <p className="text-white text-sm">{strike.reason}</p>
                      </div>

                      <div className="flex gap-2">
                        {strike.is_active ? (
                          <button
                            onClick={() => handleDeactivateStrike(strike.id)}
                            className="px-4 py-2 bg-yellow-600 text-white rounded hover:bg-yellow-700 transition text-sm font-semibold"
                          >
                            Deactivate Strike
                          </button>
                        ) : (
                          <div className="text-xs text-gray-500 italic">
                            This strike is deactivated and does not count toward suspension
                          </div>
                        )}
                        <button
                          onClick={() => handleDeleteStrike(strike.id)}
                          className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition text-sm font-semibold"
                        >
                          Delete Permanently
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Review Appeal Modal */}
      {selectedAppeal && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-900 rounded-lg max-w-3xl w-full max-h-[90vh] overflow-y-auto border border-gray-700">
            <div className="sticky top-0 bg-gray-900 border-b border-gray-700 p-6">
              <div className="flex justify-between items-start">
                <div>
                  <h2 className="text-2xl font-bold text-white mb-1">Review Appeal</h2>
                  <p className="text-gray-400">
                    {selectedAppeal.users?.full_name || selectedAppeal.users?.email || 'Unknown User'}
                  </p>
                </div>
                <button
                  onClick={() => {
                    setSelectedAppeal(null);
                    setAdminNotes('');
                  }}
                  className="text-gray-400 hover:text-white transition text-2xl"
                >
                  ×
                </button>
              </div>
            </div>

            <div className="p-6 space-y-4">
              {/* Suspension Info */}
              <div className="bg-red-900/20 border border-red-500/30 rounded-lg p-4">
                <h3 className="text-sm font-semibold text-red-400 mb-2">Suspension Information</h3>
                <div className="space-y-2 text-sm">
                  <div>
                    <span className="text-gray-400">Reason: </span>
                    <span className="text-white">{selectedAppeal.users?.suspension_reason || 'N/A'}</span>
                  </div>
                  {selectedAppeal.users?.suspended_at && (
                    <div>
                      <span className="text-gray-400">Suspended On: </span>
                      <span className="text-white">
                        {new Date(selectedAppeal.users.suspended_at).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                        })}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Appeal Text */}
              <div className="bg-gray-800 border border-gray-700 rounded-lg p-4">
                <h3 className="text-sm font-semibold text-gray-300 mb-2">Booster&apos;s Appeal</h3>
                <p className="text-white text-sm whitespace-pre-wrap">{selectedAppeal.appeal_text}</p>
                <p className="text-xs text-gray-500 mt-2">
                  Submitted: {new Date(selectedAppeal.submitted_at).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </p>
              </div>

              {/* Admin Notes Input */}
              <div>
                <label className="block text-sm font-semibold text-gray-300 mb-2">
                  Admin Notes (Optional)
                </label>
                <textarea
                  value={adminNotes}
                  onChange={(e) => setAdminNotes(e.target.value)}
                  placeholder="Add any notes about your decision..."
                  className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-primary-600"
                  rows={4}
                />
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-4 border-t border-gray-700">
                <button
                  onClick={() => handleAppealAction(selectedAppeal.id, 'approved')}
                  className="flex-1 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition font-semibold"
                >
                  Approve & Unsuspend
                </button>
                <button
                  onClick={() => handleAppealAction(selectedAppeal.id, 'rejected')}
                  className="flex-1 px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition font-semibold"
                >
                  Reject Appeal
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

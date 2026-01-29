'use client';

import { createContext, useContext, useState, useEffect, useCallback, useRef, ReactNode } from 'react';
import { useRouter } from 'next/navigation';

export interface UserData {
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

export interface Order {
  id: string;
  order_number: string;
  total_price: number;
  status: string;
  progress_percentage: number;
  created_at: string;
  paid_at: string | null;
  completed_at: string | null;
}

export interface Job {
  id: string;
  job_number: string;
  order_id: string;
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

export interface CompletedJob {
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

export interface Review {
  id: string;
  rating: number;
  quality_rating: number | null;
  communication_rating: number | null;
  timeliness_rating: number | null;
  review_text: string | null;
  delivery_status: string;
  created_at: string;
}

export interface BoosterReview {
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

export interface ConnectStatus {
  connected: boolean;
  verified: boolean;
  details_submitted: boolean;
  bank_last4: string | null;
}

export interface IdentityStatus {
  status: 'not_started' | 'pending' | 'verified' | 'failed';
  verified: boolean;
}

export interface GameAccount {
  id: string;
  account_name: string;
  game_platform: string;
  username: string;
  has_2fa_codes: boolean;
  created_at: string;
  updated_at: string;
  last_used_at: string | null;
}

interface AccountContextType {
  // User data
  user: any;
  userData: UserData | null;
  loading: boolean;
  editedFullName: string;
  setEditedFullName: (value: string) => void;
  editedPhone: string;
  setEditedPhone: (value: string) => void;
  showApprovalBanner: boolean;
  setShowApprovalBanner: (value: boolean) => void;
  refreshUserData: () => Promise<void>;

  // Customer: Orders
  orders: Order[];
  orderJobs: Record<string, Job[]>;
  ordersLoading: boolean;
  ordersFetched: boolean;
  fetchOrders: (forceRefresh?: boolean) => Promise<void>;

  // Customer: Completed Jobs
  completedJobs: CompletedJob[];
  completedJobsLoading: boolean;
  completedJobsFetched: boolean;
  fetchCompletedJobs: (forceRefresh?: boolean) => Promise<void>;

  // Booster: Jobs
  boosterJobs: Job[];
  boosterJobsLoading: boolean;
  boosterJobsFetched: boolean;
  fetchBoosterJobs: (forceRefresh?: boolean) => Promise<void>;

  // Booster: Reviews
  boosterReviews: BoosterReview[];
  boosterReviewsLoading: boolean;
  boosterReviewsFetched: boolean;
  fetchBoosterReviews: (forceRefresh?: boolean) => Promise<void>;

  // Booster: Earnings (Connect + Identity)
  connectStatus: ConnectStatus | null;
  identityStatus: IdentityStatus | null;
  earningsLoading: boolean;
  fetchConnectStatus: (forceRefresh?: boolean) => Promise<void>;
  fetchIdentityStatus: (forceRefresh?: boolean) => Promise<void>;

  // Customer: Game Accounts
  gameAccounts: GameAccount[];
  gameAccountsLoading: boolean;
  fetchGameAccounts: (forceRefresh?: boolean) => Promise<void>;
}

const AccountContext = createContext<AccountContextType | undefined>(undefined);

export function AccountProvider({ children }: { children: ReactNode }) {
  const router = useRouter();

  // User state
  const [user, setUser] = useState<any>(null);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const [editedFullName, setEditedFullName] = useState('');
  const [editedPhone, setEditedPhone] = useState('');
  const [showApprovalBanner, setShowApprovalBanner] = useState(false);

  // Customer: Orders state
  const [orders, setOrders] = useState<Order[]>([]);
  const [orderJobs, setOrderJobs] = useState<Record<string, Job[]>>({});
  const [ordersLoading, setOrdersLoading] = useState(false);
  const ordersFetchedRef = useRef(false);

  // Customer: Completed Jobs state
  const [completedJobs, setCompletedJobs] = useState<CompletedJob[]>([]);
  const [completedJobsLoading, setCompletedJobsLoading] = useState(false);
  const completedJobsFetchedRef = useRef(false);

  // Booster: Jobs state
  const [boosterJobs, setBoosterJobs] = useState<Job[]>([]);
  const [boosterJobsLoading, setBoosterJobsLoading] = useState(false);
  const boosterJobsFetchedRef = useRef(false);

  // Booster: Reviews state
  const [boosterReviews, setBoosterReviews] = useState<BoosterReview[]>([]);
  const [boosterReviewsLoading, setBoosterReviewsLoading] = useState(false);
  const boosterReviewsFetchedRef = useRef(false);

  // Booster: Earnings state
  const [connectStatus, setConnectStatus] = useState<ConnectStatus | null>(null);
  const [identityStatus, setIdentityStatus] = useState<IdentityStatus | null>(null);
  const [earningsLoading, setEarningsLoading] = useState(false);
  const connectStatusFetchedRef = useRef(false);
  const identityStatusFetchedRef = useRef(false);

  // Customer: Game Accounts state
  const [gameAccounts, setGameAccounts] = useState<GameAccount[]>([]);
  const [gameAccountsLoading, setGameAccountsLoading] = useState(false);
  const gameAccountsFetchedRef = useRef(false);

  // Fetch user on mount
  const fetchUser = useCallback(async () => {
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
  }, [router]);

  const refreshUserData = useCallback(async () => {
    try {
      const response = await fetch('/api/user/me');
      if (response.ok) {
        const data = await response.json();
        setUser(data.user);
        setUserData(data.userData);
      }
    } catch (error) {
      console.error('Error refreshing user data:', error);
    }
  }, []);

  // Customer: Fetch orders
  const fetchOrders = useCallback(async (forceRefresh = false) => {
    if (!forceRefresh && ordersFetchedRef.current) return;

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
      ordersFetchedRef.current = true;
      setOrdersLoading(false);
    }
  }, []);

  // Customer: Fetch completed jobs
  const fetchCompletedJobs = useCallback(async (forceRefresh = false) => {
    if (!forceRefresh && completedJobsFetchedRef.current) return;

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
      completedJobsFetchedRef.current = true;
      setCompletedJobsLoading(false);
    }
  }, []);

  // Booster: Fetch jobs
  const fetchBoosterJobs = useCallback(async (forceRefresh = false) => {
    if (!forceRefresh && boosterJobsFetchedRef.current) return;

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
      boosterJobsFetchedRef.current = true;
      setBoosterJobsLoading(false);
    }
  }, []);

  // Booster: Fetch reviews
  const fetchBoosterReviews = useCallback(async (forceRefresh = false) => {
    if (!forceRefresh && boosterReviewsFetchedRef.current) return;

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
      boosterReviewsFetchedRef.current = true;
      setBoosterReviewsLoading(false);
    }
  }, []);

  // Booster: Fetch connect status
  const fetchConnectStatus = useCallback(async (forceRefresh = false) => {
    if (!forceRefresh && connectStatusFetchedRef.current) return;

    try {
      const response = await fetch('/api/boosters/connect/status');
      if (response.ok) {
        const data = await response.json();
        setConnectStatus(data);
      } else {
        console.error('Failed to fetch Connect status');
        setConnectStatus({ connected: false, verified: false, details_submitted: false, bank_last4: null });
      }
    } catch (error) {
      console.error('Error fetching Connect status:', error);
      setConnectStatus({ connected: false, verified: false, details_submitted: false, bank_last4: null });
    } finally {
      connectStatusFetchedRef.current = true;
    }
  }, []);

  // Booster: Fetch identity status
  const fetchIdentityStatus = useCallback(async (forceRefresh = false) => {
    if (!forceRefresh && identityStatusFetchedRef.current) return;

    setEarningsLoading(true);
    try {
      const response = await fetch('/api/boosters/connect/verify-identity/status');
      if (response.ok) {
        const data = await response.json();
        setIdentityStatus(data);
      } else {
        console.error('Failed to fetch Identity status');
        setIdentityStatus({ status: 'not_started', verified: false });
      }
    } catch (error) {
      console.error('Error fetching Identity status:', error);
      setIdentityStatus({ status: 'not_started', verified: false });
    } finally {
      identityStatusFetchedRef.current = true;
      setEarningsLoading(false);
    }
  }, []);

  // Customer: Fetch game accounts
  const fetchGameAccounts = useCallback(async (forceRefresh = false) => {
    if (!forceRefresh && gameAccountsFetchedRef.current) return;

    setGameAccountsLoading(true);
    try {
      const response = await fetch('/api/accounts/game-accounts');
      if (response.ok) {
        const data = await response.json();
        setGameAccounts(data.accounts || []);
      } else {
        console.error('Failed to fetch game accounts');
        setGameAccounts([]);
      }
    } catch (error) {
      console.error('Error fetching game accounts:', error);
      setGameAccounts([]);
    } finally {
      gameAccountsFetchedRef.current = true;
      setGameAccountsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  // Show approval banner once per session for approved boosters
  useEffect(() => {
    if (userData?.role === 'booster' && userData?.booster_approval_status === 'approved') {
      const dismissed = sessionStorage.getItem('approvalBannerDismissed');
      if (!dismissed) {
        setShowApprovalBanner(true);
        // Auto-dismiss after 10 seconds
        const timer = setTimeout(() => {
          setShowApprovalBanner(false);
          sessionStorage.setItem('approvalBannerDismissed', 'true');
        }, 10000);
        return () => clearTimeout(timer);
      }
    }
  }, [userData]);

  // Load all role-appropriate data upfront when user data is available
  useEffect(() => {
    if (!userData) return;

    if (userData.role === 'customer') {
      fetchOrders();
      fetchCompletedJobs();
      fetchGameAccounts();
    } else if (userData.role === 'booster' && userData.booster_approval_status === 'approved') {
      fetchBoosterJobs();
      fetchBoosterReviews();
      fetchConnectStatus();
      fetchIdentityStatus();
    }
  }, [userData, fetchOrders, fetchCompletedJobs, fetchGameAccounts, fetchBoosterJobs, fetchBoosterReviews, fetchConnectStatus, fetchIdentityStatus]);

  return (
    <AccountContext.Provider
      value={{
        // User data
        user,
        userData,
        loading,
        editedFullName,
        setEditedFullName,
        editedPhone,
        setEditedPhone,
        showApprovalBanner,
        setShowApprovalBanner,
        refreshUserData,

        // Customer: Orders
        orders,
        orderJobs,
        ordersLoading,
        ordersFetched: ordersFetchedRef.current,
        fetchOrders,

        // Customer: Completed Jobs
        completedJobs,
        completedJobsLoading,
        completedJobsFetched: completedJobsFetchedRef.current,
        fetchCompletedJobs,

        // Booster: Jobs
        boosterJobs,
        boosterJobsLoading,
        boosterJobsFetched: boosterJobsFetchedRef.current,
        fetchBoosterJobs,

        // Booster: Reviews
        boosterReviews,
        boosterReviewsLoading,
        boosterReviewsFetched: boosterReviewsFetchedRef.current,
        fetchBoosterReviews,

        // Booster: Earnings
        connectStatus,
        identityStatus,
        earningsLoading,
        fetchConnectStatus,
        fetchIdentityStatus,

        // Customer: Game Accounts
        gameAccounts,
        gameAccountsLoading,
        fetchGameAccounts,
      }}
    >
      {children}
    </AccountContext.Provider>
  );
}

export function useAccount() {
  const context = useContext(AccountContext);
  if (!context) {
    throw new Error('useAccount must be used within an AccountProvider');
  }
  return context;
}

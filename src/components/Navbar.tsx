'use client';

import Link from "next/link";
import Image from "next/image";
import { useCart } from "@/contexts/CartContext";
import { createClient } from "@/lib/supabase/client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function Navbar() {
  const { getTotalItems } = useCart();
  const [user, setUser] = useState<any>(null);
  const [userRole, setUserRole] = useState<'customer' | 'booster' | 'admin' | null>(null);
  const [userName, setUserName] = useState<string | null>(null);
  const [boosterApprovalStatus, setBoosterApprovalStatus] = useState<'pending' | 'approved' | 'rejected' | null>(null);
  const [showAccountMenu, setShowAccountMenu] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const router = useRouter();

  useEffect(() => {
    const supabase = createClient();

    const fetchUserData = async () => {
      try {
        const response = await fetch('/api/user/me');

        if (response.ok) {
          const data = await response.json();
          setUser(data.user);
          setUserRole(data.userData?.role || null);
          setUserName(data.userData?.full_name || null);
          setBoosterApprovalStatus(data.userData?.booster_approval_status || null);
        } else {
          setUser(null);
          setUserRole(null);
          setUserName(null);
          setBoosterApprovalStatus(null);
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
        setUser(null);
        setUserRole(null);
        setUserName(null);
        setBoosterApprovalStatus(null);
      }
    };

    fetchUserData();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        // Re-fetch user data when auth state changes
        fetchUserData();
      } else {
        setUser(null);
        setUserRole(null);
        setUserName(null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  // Fetch unread message count
  useEffect(() => {
    if (!user) return;

    const fetchUnreadCount = async () => {
      try {
        const res = await fetch('/api/conversations/unread-count');
        if (res.ok) {
          const data = await res.json();
          setUnreadCount(data.unread_count || 0);
        }
      } catch (error) {
        console.error('Error fetching unread count:', error);
      }
    };

    fetchUnreadCount();

    // Poll every 30 seconds
    const interval = setInterval(fetchUnreadCount, 30000);
    return () => clearInterval(interval);
  }, [user]);

  // Close account menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest('.account-menu-container')) {
        setShowAccountMenu(false);
      }
    };

    if (showAccountMenu) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showAccountMenu]);

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    setShowAccountMenu(false);
    router.push('/');
  };

  return (
    <nav className="fixed top-0 left-0 right-0 w-full py-1 px-3 border-b border-primary-900/20 bg-black/90 backdrop-blur-sm shadow-lg z-50">
      <div className="max-w-[1400px] mx-auto flex items-center justify-between gap-3">
        {/* Left side - Logo and Role-based Navigation Links */}
        <div className="flex items-center gap-3">
          <Link href="/" className="flex items-center font-bold text-2xl text-white hover:text-primary-400 transition-colors duration-200">
            <Image
              src="/altura_logo.webp"
              alt="Altura Boost Logo"
              width={64}
              height={64}
              className="w-16 h-16 object-contain"
            />
            Altura Boost
          </Link>

          {userRole === 'admin' && (
            <Link href="/admin" className="px-2 py-1 bg-yellow-600 text-white rounded-md hover:bg-yellow-700 transition-all duration-200 font-semibold text-xs tracking-wide">
              ADMIN PANEL
            </Link>
          )}
          {((userRole === 'booster' && boosterApprovalStatus === 'approved') || userRole === 'admin') && (
            <Link href="/hub" className="px-2 py-1 bg-primary-600 text-white rounded-md hover:bg-primary-700 transition-all duration-200 font-semibold text-xs tracking-wide">
              BOOSTER HUB
            </Link>
          )}
        </div>

        {/* Right side - Info Links, Login, Cart */}
        <div className="flex items-center gap-3">
          <div className="relative group">
            <Link href="/games" className="text-gray-300 hover:text-white transition-colors duration-200 text-sm font-medium">
              Games
            </Link>

            {/* Mega Menu Dropdown */}
            <div className="absolute left-0 top-full mt-1 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
              <div className="bg-gray-900 border border-primary-700/50 rounded-lg shadow-2xl p-2 min-w-[200px]">
                {/* Game Item */}
                <Link
                  href="/games/black-ops-7"
                  className="flex items-center gap-2 px-2 py-1 rounded-lg hover:bg-primary-700/30 transition-colors duration-200 group/item"
                >
                  <span className="text-2xl">🎯</span>
                  <span className="text-white text-sm font-medium group-hover/item:text-primary-400">
                    Black Ops 7
                  </span>
                </Link>
              </div>
            </div>
          </div>
          <Link href="/work-with-us" className="text-gray-300 hover:text-white transition-colors duration-200 text-sm font-medium">
            Work with us
          </Link>
          <Link href="/faq" className="text-gray-300 hover:text-white transition-colors duration-200 text-sm font-medium">
            FAQ
          </Link>
          <Link href="/terms" className="text-gray-300 hover:text-white transition-colors duration-200 text-sm font-medium">
            Terms of Service
          </Link>

          {/* Divider */}
          <div className="h-5 w-px bg-gray-700"></div>

          {/* Login Button or Account Icon */}
          {user ? (
            <div className="relative account-menu-container">
              <button
                onClick={() => setShowAccountMenu(!showAccountMenu)}
                className="p-1 hover:bg-gray-800/50 rounded-lg transition-all duration-200 group"
              >
                <svg className="w-5 h-5 text-gray-300 group-hover:text-primary-400 transition-colors duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </button>

              {/* Account Dropdown Menu */}
              {showAccountMenu && (
                <div className="absolute right-0 top-full mt-1 w-44 bg-gray-900 border border-primary-700/50 rounded-lg shadow-2xl p-1.5 z-50">
                  <div className="px-2 py-1 border-b border-gray-700 mb-1">
                    <p className="text-xs text-gray-400">Signed in as</p>
                    <p className="text-sm text-white font-medium truncate">{userName}</p>
                  </div>
                  <Link
                    href="/account"
                    className="block px-2 py-1 text-sm text-gray-300 hover:bg-primary-700/30 hover:text-white rounded-md transition-colors duration-200"
                    onClick={() => setShowAccountMenu(false)}
                  >
                    My Account
                  </Link>
                  <Link
                    href="/messages"
                    className="block px-2 py-1 text-sm text-gray-300 hover:bg-primary-700/30 hover:text-white rounded-md transition-colors duration-200"
                    onClick={() => setShowAccountMenu(false)}
                  >
                    Messages{unreadCount > 0 ? ` (${unreadCount})` : ''}
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="w-full text-left px-2 py-1 text-sm text-gray-300 hover:bg-red-900/30 hover:text-red-400 rounded-md transition-colors duration-200"
                  >
                    Logout
                  </button>
                </div>
              )}
            </div>
          ) : (
            <Link href="/login" className="px-3 py-1 bg-gray-800/50 text-white border border-primary-600/50 rounded-md hover:bg-primary-600/20 hover:border-primary-600 transition-all duration-200 font-semibold text-sm tracking-wide">
              LOGIN
            </Link>
          )}

          {/* Cart Icon */}
          <Link href="/cart" className="relative p-1 hover:bg-gray-800/50 rounded-lg transition-all duration-200 group">
            <svg className="w-5 h-5 text-gray-300 group-hover:text-primary-400 transition-colors duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            {getTotalItems() > 0 && (
              <span className="absolute -top-1 -right-1 bg-primary-600 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center font-bold shadow-lg">
                {getTotalItems()}
              </span>
            )}
          </Link>
        </div>
      </div>
    </nav>
  );
}

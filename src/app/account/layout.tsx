'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { AccountProvider, useAccount } from '@/contexts/AccountContext';

function AccountLayoutContent({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { loading, userData } = useAccount();

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center" role="status" aria-live="polite">
          <svg className="w-16 h-16 text-primary-500 mx-auto animate-spin mb-4" fill="none" viewBox="0 0 24 24" aria-hidden="true">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <p className="text-white text-xl">Loading...</p>
        </div>
      </div>
    );
  }

  if (!userData) {
    return null;
  }

  const isActive = (path: string) => pathname === path;

  const linkClass = (path: string) =>
    `w-full text-left px-4 py-3 rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-primary-500 block ${isActive(path)
      ? 'bg-primary-600 text-white'
      : 'text-gray-300 hover:bg-gray-800 hover:text-white'
    }`;

  const appealLinkClass = (path: string) =>
    `w-full text-left px-4 py-3 rounded-lg transition-colors duration-200 border-2 focus:outline-none focus:ring-2 focus:ring-red-500 block ${isActive(path)
      ? 'bg-red-600 text-white border-red-500'
      : 'text-red-400 border-red-700 hover:bg-red-900/20 hover:text-red-300'
    }`;

  return (
    <div className="min-h-screen bg-black pb-12">
      <div className="max-w-7xl mx-auto px-6">
        <h1 className="text-4xl font-bold text-white mb-8">My Account</h1>

        <div className="flex gap-8">
          {/* Sidebar */}
          <div className="w-64 flex-shrink-0">
            <div className="bg-gray-900 border border-primary-700 rounded-lg p-4">
              <nav className="space-y-2" aria-label="Account navigation">
                <Link
                  href="/account/profile"
                  aria-current={isActive('/account/profile') ? 'page' : undefined}
                  className={linkClass('/account/profile')}
                >
                  Profile
                </Link>
                {userData.role === 'customer' && (
                  <>
                    <Link
                      href="/account/orders"
                      aria-current={isActive('/account/orders') ? 'page' : undefined}
                      className={linkClass('/account/orders')}
                    >
                      My Orders
                    </Link>
                    <Link
                      href="/account/completed"
                      aria-current={isActive('/account/completed') ? 'page' : undefined}
                      className={linkClass('/account/completed')}
                    >
                      Completed Jobs
                    </Link>
                    <Link
                      href="/account/game-accounts"
                      aria-current={isActive('/account/game-accounts') ? 'page' : undefined}
                      className={linkClass('/account/game-accounts')}
                    >
                      Game Accounts
                    </Link>
                  </>
                )}
                {userData.role === 'booster' && userData.booster_approval_status === 'approved' && (
                  <>
                    <Link
                      href="/account/jobs"
                      aria-current={isActive('/account/jobs') ? 'page' : undefined}
                      className={linkClass('/account/jobs')}
                    >
                      My Jobs
                    </Link>
                    <Link
                      href="/account/reviews"
                      aria-current={isActive('/account/reviews') ? 'page' : undefined}
                      className={linkClass('/account/reviews')}
                    >
                      My Reviews
                    </Link>
                    <Link
                      href="/account/earnings"
                      aria-current={isActive('/account/earnings') ? 'page' : undefined}
                      className={linkClass('/account/earnings')}
                    >
                      Earnings
                    </Link>
                  </>
                )}
                {userData.role === 'booster' && userData.is_suspended && userData.can_appeal && (
                  <Link
                    href="/account/appeals"
                    aria-current={isActive('/account/appeals') ? 'page' : undefined}
                    className={appealLinkClass('/account/appeals')}
                  >
                    Submit Appeal
                  </Link>
                )}
              </nav>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1">
            <div className="bg-gray-900 border border-primary-700 rounded-lg p-6">
              {children}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function AccountLayout({ children }: { children: React.ReactNode }) {
  return (
    <AccountProvider>
      <AccountLayoutContent>{children}</AccountLayoutContent>
    </AccountProvider>
  );
}

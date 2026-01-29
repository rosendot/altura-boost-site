'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAccount } from '@/contexts/AccountContext';

export default function OrdersPage() {
  const router = useRouter();
  const { userData, orders, orderJobs, ordersLoading, fetchOrders } = useAccount();

  // Redirect non-customers
  useEffect(() => {
    if (userData && userData.role !== 'customer') {
      router.replace('/account/profile');
    }
  }, [userData, router]);

  if (!userData || userData.role !== 'customer') {
    return null;
  }

  return (
    <div>
      <h2 className="text-2xl font-bold text-white mb-6">My Orders</h2>

      {ordersLoading ? (
        <div className="space-y-4">
          {[1, 2].map((i) => (
            <div key={i} className="bg-gray-800 border border-gray-700 rounded-lg p-6 animate-pulse">
              {/* Header skeleton */}
              <div className="flex justify-between items-start mb-4">
                <div>
                  <div className="h-6 bg-gray-700 rounded w-32 mb-2"></div>
                  <div className="h-4 bg-gray-700 rounded w-48"></div>
                </div>
                <div className="text-right">
                  <div className="h-8 bg-gray-700 rounded w-24 mb-2"></div>
                  <div className="h-6 bg-gray-700 rounded w-28"></div>
                </div>
              </div>
              {/* Progress bar skeleton */}
              <div className="mb-4">
                <div className="flex justify-between items-center mb-2">
                  <div className="h-4 bg-gray-700 rounded w-16"></div>
                  <div className="h-4 bg-gray-700 rounded w-10"></div>
                </div>
                <div className="w-full bg-gray-700 rounded-full h-2"></div>
              </div>
              {/* Jobs skeleton */}
              <div className="border-t border-gray-700 pt-4">
                <div className="h-4 bg-gray-700 rounded w-24 mb-3"></div>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <div>
                      <div className="h-5 bg-gray-700 rounded w-40 mb-1"></div>
                      <div className="h-4 bg-gray-700 rounded w-24"></div>
                    </div>
                    <div className="h-6 bg-gray-700 rounded w-20"></div>
                  </div>
                </div>
              </div>
            </div>
          ))}
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
                      <span aria-hidden="true">
                        {order.status === 'completed' ? '✓' : order.status === 'in_progress' ? '⏳' : order.status === 'paid' ? '💳' : '⏱️'}
                      </span> {order.status.toUpperCase().replace('_', ' ')}
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
                              <span aria-hidden="true">
                                {job.status === 'completed' ? '✓' : job.status === 'in_progress' ? '⏳' : job.status === 'accepted' ? '✓' : job.status === 'available' ? '📋' : job.status === 'assigned' ? '👤' : '⏱️'}
                              </span> {job.status.toUpperCase().replace('_', ' ')}
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
  );
}

'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAccount } from '@/contexts/AccountContext';

export default function ReviewsPage() {
  const router = useRouter();
  const { userData, boosterReviews, boosterReviewsLoading, fetchBoosterReviews } = useAccount();

  // Redirect if not approved booster
  useEffect(() => {
    if (userData && (userData.role !== 'booster' || userData.booster_approval_status !== 'approved')) {
      router.replace('/account/profile');
    }
  }, [userData, router]);

  if (!userData || userData.role !== 'booster' || userData.booster_approval_status !== 'approved') {
    return null;
  }

  const StrikeCountCard = () => (
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
  );

  return (
    <div>
      <h2 className="text-2xl font-bold text-white mb-6">My Reviews</h2>

      {boosterReviewsLoading ? (
        <div>
          {/* Stats Cards Skeleton */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div className="bg-gray-800 rounded-lg p-6 animate-pulse">
              <div className="h-4 bg-gray-700 rounded w-24 mb-2"></div>
              <div className="h-12 bg-gray-700 rounded w-20 mb-2"></div>
              <div className="h-4 bg-gray-700 rounded w-32"></div>
            </div>
            <div className="bg-gray-800 rounded-lg p-6 animate-pulse">
              <div className="h-4 bg-gray-700 rounded w-24 mb-2"></div>
              <div className="h-12 bg-gray-700 rounded w-16 mb-2"></div>
              <div className="h-4 bg-gray-700 rounded w-40"></div>
            </div>
          </div>
          {/* Review Cards Skeleton */}
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-gray-800 border border-gray-700 rounded-lg p-6 animate-pulse">
                {/* Header skeleton */}
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <div className="h-6 bg-gray-700 rounded w-48 mb-2"></div>
                    <div className="h-4 bg-gray-700 rounded w-32 mb-1"></div>
                    <div className="h-3 bg-gray-700 rounded w-20 mt-2"></div>
                  </div>
                  <div className="text-right">
                    <div className="h-8 bg-gray-700 rounded w-32 mb-2"></div>
                    <div className="h-6 bg-gray-700 rounded w-20"></div>
                  </div>
                </div>
                {/* Review text skeleton */}
                <div className="mb-4">
                  <div className="h-4 bg-gray-700 rounded w-full mb-2"></div>
                  <div className="h-4 bg-gray-700 rounded w-3/4"></div>
                </div>
                {/* Footer skeleton */}
                <div className="border-t border-gray-700 pt-4 flex justify-between">
                  <div className="h-3 bg-gray-700 rounded w-28"></div>
                  <div className="h-3 bg-gray-700 rounded w-24"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : boosterReviews.length === 0 ? (
        <div>
          {/* Strike Count Card (show even when no reviews) */}
          <div className="mb-6">
            <StrikeCountCard />
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
            <StrikeCountCard />
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
  );
}

'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAccount, CompletedJob } from '@/contexts/AccountContext';
import ReviewModal from '@/components/ReviewModal';

export default function CompletedPage() {
  const router = useRouter();
  const { userData, completedJobs, completedJobsLoading, fetchCompletedJobs } = useAccount();
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [selectedJobForReview, setSelectedJobForReview] = useState<CompletedJob | null>(null);

  // Redirect non-customers
  useEffect(() => {
    if (userData && userData.role !== 'customer') {
      router.replace('/account/profile');
    }
  }, [userData, router]);

  const handleOpenReviewModal = (job: CompletedJob) => {
    setSelectedJobForReview(job);
    setShowReviewModal(true);
  };

  const handleCloseReviewModal = () => {
    setShowReviewModal(false);
    setSelectedJobForReview(null);
  };

  const handleReviewSubmitted = () => {
    // Force refresh completed jobs list after review submission
    fetchCompletedJobs(true);
  };

  if (!userData || userData.role !== 'customer') {
    return null;
  }

  return (
    <div>
      <h2 className="text-2xl font-bold text-white mb-6">Completed Jobs</h2>

      {completedJobsLoading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-gray-800 border border-gray-700 rounded-lg p-6 animate-pulse">
              {/* Header skeleton */}
              <div className="flex justify-between items-start mb-4">
                <div>
                  <div className="h-6 bg-gray-700 rounded w-48 mb-2"></div>
                  <div className="h-4 bg-gray-700 rounded w-32 mb-1"></div>
                  <div className="h-3 bg-gray-700 rounded w-24 mt-2"></div>
                  <div className="h-3 bg-gray-700 rounded w-36 mt-1"></div>
                </div>
                <div className="h-6 bg-gray-700 rounded w-24"></div>
              </div>
              {/* Booster info skeleton */}
              <div className="border-t border-gray-700 pt-4 mb-4">
                <div className="h-3 bg-gray-700 rounded w-16 mb-1"></div>
                <div className="h-4 bg-gray-700 rounded w-32"></div>
              </div>
              {/* Review button skeleton */}
              <div className="border-t border-gray-700 pt-4">
                <div className="h-10 bg-gray-700 rounded w-full"></div>
              </div>
            </div>
          ))}
        </div>
      ) : completedJobs.length === 0 ? (
        <div className="bg-gray-800 border border-gray-700 rounded-lg p-6 text-center">
          <svg className="w-16 h-16 text-gray-600 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <h3 className="text-lg font-semibold text-white mb-2">No Completed Jobs Yet</h3>
          <p className="text-gray-400 text-sm">
            When your jobs are completed, they will appear here for you to review.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {completedJobs.map((job) => (
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
                  <p className="text-xs text-gray-500 mt-1">Job #{job.job_number}</p>
                  <p className="text-xs text-gray-500">
                    Completed on {new Date(job.completed_at).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </p>
                </div>
                <div className="text-right">
                  <span className="inline-block px-3 py-1 rounded-full text-xs font-semibold bg-green-900/50 text-green-400 border border-green-500">
                    COMPLETED
                  </span>
                </div>
              </div>

              {/* Booster Info */}
              <div className="border-t border-gray-700 pt-4 mb-4">
                <p className="text-xs text-gray-500 mb-1">Booster</p>
                <p className="text-sm text-white">{job.booster.full_name || job.booster.email}</p>
              </div>

              {/* Review Section */}
              {job.has_review && job.review ? (
                <div className="border-t border-gray-700 pt-4">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="text-sm font-semibold text-gray-400">Your Review</h4>
                    <div className="flex items-center gap-1">
                      {[...Array(5)].map((_, i) => (
                        <span
                          key={i}
                          className={`text-lg ${
                            i < job.review!.rating ? 'text-yellow-400' : 'text-gray-600'
                          }`}
                        >
                          ★
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="mb-2">
                    <span className={`inline-block px-2 py-1 rounded text-xs font-semibold ${
                      job.review.delivery_status === 'complete'
                        ? 'bg-green-900/50 text-green-400'
                        : job.review.delivery_status === 'incomplete'
                        ? 'bg-yellow-900/50 text-yellow-400'
                        : 'bg-red-900/50 text-red-400'
                    }`}>
                      <span aria-hidden="true">
                        {job.review.delivery_status === 'complete' ? '✓' : job.review.delivery_status === 'incomplete' ? '⚠️' : '✕'}
                      </span> {job.review.delivery_status === 'complete' ? 'Complete Delivery' :
                       job.review.delivery_status === 'incomplete' ? 'Incomplete Delivery' :
                       'Poor Quality'}
                    </span>
                  </div>
                  {job.review.review_text && (
                    <p className="text-sm text-gray-300 mb-2">{job.review.review_text}</p>
                  )}
                  <p className="text-xs text-gray-500">
                    Reviewed on {new Date(job.review.created_at).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </p>
                </div>
              ) : (
                <div className="border-t border-gray-700 pt-4">
                  <button
                    onClick={() => handleOpenReviewModal(job)}
                    className="w-full py-2.5 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition font-bold focus:outline-none focus:ring-2 focus:ring-primary-500"
                  >
                    LEAVE A REVIEW
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Review Modal */}
      {showReviewModal && selectedJobForReview && (
        <ReviewModal
          isOpen={showReviewModal}
          onClose={handleCloseReviewModal}
          jobId={selectedJobForReview.id}
          jobNumber={selectedJobForReview.job_number}
          gameName={selectedJobForReview.game_name}
          serviceName={selectedJobForReview.service_name}
          boosterName={selectedJobForReview.booster.full_name || selectedJobForReview.booster.email}
          onReviewSubmitted={handleReviewSubmitted}
        />
      )}
    </div>
  );
}

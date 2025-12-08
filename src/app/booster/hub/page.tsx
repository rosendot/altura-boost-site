'use client';

import { useState } from 'react';

// Mock available jobs
const mockAvailableJobs = [
  {
    id: 'JOB-NEW-001',
    serviceName: 'Weapon Camos - SMGs',
    game: 'Call of Duty: Black Ops 7',
    payout: '$20.00',
    estimatedHours: 10,
    weaponClass: 'SMGs',
    requirements: '3 SMGs to Diamond Camo',
    details: [
      '3 weapons to Diamond camo',
      'All challenges completed',
      'Completion within 4 days',
    ],
  },
  {
    id: 'JOB-NEW-002',
    serviceName: 'Rank Boost - Level 50-100',
    game: 'Call of Duty: Black Ops 7',
    payout: '$30.00',
    estimatedHours: 15,
    weaponClass: 'N/A',
    requirements: 'Level 50 to Level 100',
    details: [
      'Level from 50 to 100',
      'All daily challenges during progression',
      'Completion within 5 days',
    ],
  },
  {
    id: 'JOB-NEW-003',
    serviceName: 'Challenge Completion - Seasonal',
    game: 'Call of Duty: Black Ops 7',
    payout: '$18.00',
    estimatedHours: 6,
    weaponClass: 'Mixed',
    requirements: 'Complete 20 Seasonal Challenges',
    details: [
      '20 seasonal challenges',
      'Any weapon class',
      'Completion within 3 days',
    ],
  },
];

export default function BoosterHub() {
  const [expandedJob, setExpandedJob] = useState<string | null>(null);
  const [selectedJob, setSelectedJob] = useState<string | null>(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  const toggleExpand = (jobId: string) => {
    setExpandedJob(expandedJob === jobId ? null : jobId);
  };

  const handleAcceptJob = (jobId: string) => {
    setSelectedJob(jobId);
    setShowConfirmModal(true);
  };

  const confirmAcceptance = () => {
    // In real app, this would make API call to accept the job
    setShowConfirmModal(false);
    setSelectedJob(null);
    alert('Job accepted! Redirecting to My Jobs...');
  };

  return (
    <main className="min-h-screen bg-black pt-24 pb-12">
      <div className="max-w-7xl mx-auto px-4">
        <h1 className="text-4xl font-bold mb-4 text-white">Booster Hub</h1>
        <p className="text-gray-400 mb-8">
          Browse available jobs and accept ones that match your skills
        </p>

        {/* Available Jobs List */}
        <div className="space-y-2">
          {mockAvailableJobs.map((job) => (
            <div
              key={job.id}
              className="bg-gray-900 border border-primary-700 rounded-lg overflow-hidden card-glow transition hover:border-primary-500"
            >
              {/* Compact Row */}
              <div
                onClick={() => toggleExpand(job.id)}
                className="flex items-center gap-4 p-4 cursor-pointer hover:bg-gray-800 transition"
              >
                <div className="flex-1 min-w-0">
                  <h3 className="text-lg font-semibold text-white truncate">
                    {job.serviceName}
                  </h3>
                  <p className="text-sm text-gray-400">{job.game}</p>
                </div>
                <div className="flex items-center gap-6 shrink-0">
                  <div className="text-right">
                    <p className="text-xl font-bold text-green-400">
                      {job.payout}
                    </p>
                  </div>
                  <div className="text-right min-w-[80px]">
                    <p className="text-sm text-gray-400">Est. Hours</p>
                    <p className="text-white font-semibold">{job.estimatedHours}h</p>
                  </div>
                  <div className="text-gray-400">
                    <svg
                      className={`w-5 h-5 transition-transform ${
                        expandedJob === job.id ? 'rotate-180' : ''
                      }`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 9l-7 7-7-7"
                      />
                    </svg>
                  </div>
                </div>
              </div>

              {/* Expanded Details */}
              {expandedJob === job.id && (
                <div className="border-t border-gray-700 p-4 bg-gray-800/50">
                  <div className="mb-4">
                    <p className="text-xs text-gray-500 mb-1">Job ID</p>
                    <p className="text-sm text-gray-300">{job.id}</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Requirements</p>
                      <p className="text-sm text-white">{job.requirements}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Weapon Class</p>
                      <p className="text-sm text-white">{job.weaponClass}</p>
                    </div>
                  </div>

                  <div className="mb-4">
                    <p className="text-xs text-gray-500 mb-2">Job Details</p>
                    <ul className="list-disc list-inside text-gray-300 space-y-1 text-sm">
                      {job.details.map((detail, index) => (
                        <li key={index}>{detail}</li>
                      ))}
                    </ul>
                  </div>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleAcceptJob(job.id);
                    }}
                    className="w-full py-2.5 gradient-purple text-white rounded-lg hover:opacity-90 transition font-bold"
                  >
                    ACCEPT JOB
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Confirmation Modal */}
        {showConfirmModal && (
          <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
            <div className="bg-gray-900 border border-primary-700 rounded-lg p-8 max-w-md w-full">
              <h3 className="text-2xl font-bold mb-4 text-white">
                Confirm Job Acceptance
              </h3>
              <p className="text-gray-400 mb-6">
                Are you sure you want to accept this job? Once accepted, you&apos;ll be
                responsible for completing it within the estimated timeframe.
              </p>
              <div className="flex gap-4">
                <button
                  onClick={() => setShowConfirmModal(false)}
                  className="flex-1 py-3 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition font-semibold"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmAcceptance}
                  className="flex-1 py-3 gradient-purple text-white rounded-lg hover:opacity-90 transition font-bold"
                >
                  Yes, Accept
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}

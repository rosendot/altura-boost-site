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
  const [selectedJob, setSelectedJob] = useState<string | null>(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);

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
        <div className="space-y-4">
          {mockAvailableJobs.map((job) => (
            <div
              key={job.id}
              className="bg-gray-900 border border-primary-700 rounded-lg p-6 card-glow transition hover:border-primary-500"
            >
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-2xl font-semibold mb-2 text-white">
                    {job.serviceName}
                  </h3>
                  <p className="text-gray-400 text-sm">{job.game}</p>
                  <p className="text-gray-500 text-sm">Job ID: {job.id}</p>
                </div>
                <div className="text-right">
                  <p className="text-3xl font-bold text-green-400 mb-1">
                    {job.payout}
                  </p>
                  <p className="text-sm text-gray-500">Your payout</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <div>
                  <p className="text-sm text-gray-500">Requirements</p>
                  <p className="font-semibold text-white">{job.requirements}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Estimated Hours</p>
                  <p className="font-semibold text-white">{job.estimatedHours} hours</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Weapon Class</p>
                  <p className="font-semibold text-white">{job.weaponClass}</p>
                </div>
              </div>

              <div className="mb-4">
                <p className="text-sm text-gray-500 mb-2 font-semibold">
                  Job Details:
                </p>
                <ul className="list-disc list-inside text-gray-300 space-y-1">
                  {job.details.map((detail, index) => (
                    <li key={index}>{detail}</li>
                  ))}
                </ul>
              </div>

              <button
                onClick={() => handleAcceptJob(job.id)}
                className="w-full py-3 gradient-purple text-white rounded-lg hover:opacity-90 transition font-bold"
              >
                ACCEPT JOB
              </button>
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
                Are you sure you want to accept this job? Once accepted, you'll be
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

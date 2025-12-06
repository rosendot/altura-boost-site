export default function BoosterHub() {
  return (
    <main className="min-h-screen max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold mb-8">Booster Hub</h1>
      <p className="text-gray-600 mb-8">
        Available jobs for qualified boosters
      </p>

      {/* Available Jobs List */}
      <div className="space-y-4">
        {/* Sample Job Card - Multiple can be rendered here */}
        <div className="border rounded-lg p-6 hover:shadow-lg transition">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h3 className="text-2xl font-semibold mb-2">Black Ops 7 - Weapon Leveling</h3>
              <p className="text-gray-600">5 Weapons to Max Level</p>
            </div>
            <div className="text-right">
              <p className="text-3xl font-bold text-green-600 mb-1">$35.00</p>
              <p className="text-sm text-gray-500">Your payout</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div>
              <p className="text-sm text-gray-500">Service Type</p>
              <p className="font-semibold">Weapon Leveling</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Estimated Time</p>
              <p className="font-semibold">8-10 hours</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Weapon Class</p>
              <p className="font-semibold">Assault Rifles</p>
            </div>
          </div>

          <div className="mb-4">
            <p className="text-sm text-gray-500 mb-1">Requirements</p>
            <ul className="list-disc list-inside text-gray-700">
              <li>5 weapons to max level</li>
              <li>All attachments unlocked</li>
              <li>Completion within 3 days</li>
            </ul>
          </div>

          <button className="w-full py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-semibold">
            Accept Job
          </button>
        </div>

        {/* Empty State when no jobs available */}
        <div className="border rounded-lg p-8 text-center text-gray-500">
          <p className="text-xl mb-2">No jobs available at the moment</p>
          <p>Check back later for new opportunities</p>
        </div>
      </div>

      {/* Confirmation Modal Placeholder */}
      {/*
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
        <div className="bg-white rounded-lg p-8 max-w-md">
          <h3 className="text-2xl font-bold mb-4">Confirm Job Acceptance</h3>
          <p className="text-gray-600 mb-6">
            Are you sure you want to accept this job? Once accepted, you'll be responsible for completing it within the estimated timeframe.
          </p>
          <div className="flex gap-4">
            <button className="flex-1 py-3 bg-gray-200 rounded-lg hover:bg-gray-300 transition">
              Cancel
            </button>
            <button className="flex-1 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition">
              Yes, Accept
            </button>
          </div>
        </div>
      </div>
      */}
    </main>
  );
}

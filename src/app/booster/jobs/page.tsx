"use client";

import { useState } from "react";

export default function BoosterJobs() {
  const [activeTab, setActiveTab] = useState<"active" | "past" | "earnings">("active");
  const [earningsFilter, setEarningsFilter] = useState({ month: "12", year: "2024" });

  return (
    <main className="min-h-screen max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold mb-8">My Jobs</h1>

      {/* Tab Navigation */}
      <div className="flex gap-4 mb-8 border-b">
        <button
          onClick={() => setActiveTab("active")}
          className={`pb-4 px-6 font-semibold transition ${
            activeTab === "active"
              ? "border-b-2 border-blue-600 text-blue-600"
              : "text-gray-600 hover:text-gray-900"
          }`}
        >
          Active Jobs
        </button>
        <button
          onClick={() => setActiveTab("past")}
          className={`pb-4 px-6 font-semibold transition ${
            activeTab === "past"
              ? "border-b-2 border-blue-600 text-blue-600"
              : "text-gray-600 hover:text-gray-900"
          }`}
        >
          Past Jobs
        </button>
        <button
          onClick={() => setActiveTab("earnings")}
          className={`pb-4 px-6 font-semibold transition ${
            activeTab === "earnings"
              ? "border-b-2 border-blue-600 text-blue-600"
              : "text-gray-600 hover:text-gray-900"
          }`}
        >
          Earnings
        </button>
      </div>

      {/* Active Jobs Tab */}
      {activeTab === "active" && (
        <div className="space-y-4">
          {/* Sample Active Job */}
          <div className="border rounded-lg p-6">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-xl font-semibold mb-1">Black Ops 7 - Weapon Leveling</h3>
                <p className="text-gray-600">5 Weapons to Max Level</p>
              </div>
              <div className="text-right">
                <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-semibold">
                  In Progress
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <div>
                <p className="text-sm text-gray-500">Payout</p>
                <p className="text-xl font-bold text-green-600">$35.00</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Started</p>
                <p className="font-semibold">Dec 6, 2024</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Due Date</p>
                <p className="font-semibold">Dec 9, 2024</p>
              </div>
            </div>

            <div className="mb-4">
              <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-600">Progress</span>
                <span className="font-semibold">60%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div className="bg-blue-600 h-3 rounded-full" style={{ width: "60%" }}></div>
              </div>
            </div>

            <button className="w-full py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition">
              Update Progress
            </button>
          </div>

          {/* Empty State */}
          <div className="border rounded-lg p-8 text-center text-gray-500">
            <p className="text-xl">No active jobs</p>
            <p className="text-sm mt-2">Visit the Booster Hub to accept new jobs</p>
          </div>
        </div>
      )}

      {/* Past Jobs Tab */}
      {activeTab === "past" && (
        <div className="space-y-4">
          {/* Sample Past Job */}
          <div className="border rounded-lg p-6 bg-gray-50">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-xl font-semibold mb-1">Black Ops 7 - Camo Unlock</h3>
                <p className="text-gray-600">Gold Camo for 3 Weapons</p>
              </div>
              <div className="text-right">
                <span className="px-3 py-1 bg-gray-200 text-gray-800 rounded-full text-sm font-semibold">
                  Completed
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <p className="text-sm text-gray-500">Earned</p>
                <p className="text-xl font-bold text-green-600">$45.00</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Completed On</p>
                <p className="font-semibold">Dec 4, 2024</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Duration</p>
                <p className="font-semibold">2 days</p>
              </div>
            </div>
          </div>

          {/* Empty State */}
          <div className="border rounded-lg p-8 text-center text-gray-500">
            <p className="text-xl">No past jobs</p>
          </div>
        </div>
      )}

      {/* Earnings Tab */}
      {activeTab === "earnings" && (
        <div>
          {/* Filter Controls */}
          <div className="flex gap-4 mb-6">
            <div>
              <label className="block text-sm text-gray-600 mb-1">Month</label>
              <select
                value={earningsFilter.month}
                onChange={(e) => setEarningsFilter({ ...earningsFilter, month: e.target.value })}
                className="border rounded-lg px-4 py-2"
              >
                <option value="1">January</option>
                <option value="2">February</option>
                <option value="3">March</option>
                <option value="4">April</option>
                <option value="5">May</option>
                <option value="6">June</option>
                <option value="7">July</option>
                <option value="8">August</option>
                <option value="9">September</option>
                <option value="10">October</option>
                <option value="11">November</option>
                <option value="12">December</option>
              </select>
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-1">Year</label>
              <select
                value={earningsFilter.year}
                onChange={(e) => setEarningsFilter({ ...earningsFilter, year: e.target.value })}
                className="border rounded-lg px-4 py-2"
              >
                <option value="2024">2024</option>
                <option value="2025">2025</option>
              </select>
            </div>
          </div>

          {/* Earnings Summary */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="border rounded-lg p-6">
              <p className="text-gray-600 mb-2">Total Earnings</p>
              <p className="text-4xl font-bold text-green-600">$0.00</p>
            </div>
            <div className="border rounded-lg p-6">
              <p className="text-gray-600 mb-2">Jobs Completed</p>
              <p className="text-4xl font-bold">0</p>
            </div>
            <div className="border rounded-lg p-6">
              <p className="text-gray-600 mb-2">Average Per Job</p>
              <p className="text-4xl font-bold">$0.00</p>
            </div>
          </div>

          {/* Earnings History */}
          <div className="border rounded-lg">
            <div className="p-4 border-b bg-gray-50">
              <h3 className="font-semibold">Earnings History</h3>
            </div>
            <div className="p-8 text-center text-gray-500">
              <p>No earnings data for the selected period</p>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}

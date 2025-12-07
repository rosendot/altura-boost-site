"use client";

import { useState } from "react";

export default function BoosterJobs() {
  const [activeTab, setActiveTab] = useState<"active" | "past" | "earnings">("active");
  const [earningsFilter, setEarningsFilter] = useState({ month: "12", year: "2024" });

  return (
    <main className="min-h-screen bg-black max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold mb-8 text-white">My Jobs</h1>

      {/* Tab Navigation */}
      <div className="flex gap-4 mb-8 border-b border-primary-700">
        <button
          onClick={() => setActiveTab("active")}
          className={`pb-4 px-6 font-semibold transition ${
            activeTab === "active"
              ? "border-b-2 border-primary-500 text-primary-400"
              : "text-gray-400 hover:text-white"
          }`}
        >
          Active Jobs
        </button>
        <button
          onClick={() => setActiveTab("past")}
          className={`pb-4 px-6 font-semibold transition ${
            activeTab === "past"
              ? "border-b-2 border-primary-500 text-primary-400"
              : "text-gray-400 hover:text-white"
          }`}
        >
          Past Jobs
        </button>
        <button
          onClick={() => setActiveTab("earnings")}
          className={`pb-4 px-6 font-semibold transition ${
            activeTab === "earnings"
              ? "border-b-2 border-primary-500 text-primary-400"
              : "text-gray-400 hover:text-white"
          }`}
        >
          Earnings
        </button>
      </div>

      {/* Active Jobs Tab */}
      {activeTab === "active" && (
        <div className="space-y-4">
          {/* Active Job 1 */}
          <div className="bg-gray-900 border border-primary-700 rounded-lg p-6 card-glow">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-xl font-semibold mb-1 text-white">Weapon Camos - Assault Rifles</h3>
                <p className="text-gray-400 text-sm">Call of Duty: Black Ops 7</p>
                <p className="text-gray-500 text-sm">Job #JOB-001 | Order #ORD-001</p>
              </div>
              <div className="text-right">
                <span className="px-3 py-1 bg-green-900/30 border border-green-600 text-green-400 rounded-full text-sm font-semibold">
                  In Progress
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <div>
                <p className="text-sm text-gray-500">Payout</p>
                <p className="text-xl font-bold text-green-400">$15.00</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Est. Hours</p>
                <p className="font-semibold text-white">8 hours</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Accepted</p>
                <p className="font-semibold text-white">Dec 2, 2025</p>
              </div>
            </div>

            <div className="mb-4">
              <p className="text-gray-400 text-sm mb-2">
                <span className="font-semibold">Requirements:</span> 2 Assault Rifles to Gold Camo
              </p>
            </div>

            <div className="mb-4">
              <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-400">Progress</span>
                <span className="font-semibold text-primary-400">65%</span>
              </div>
              <div className="w-full bg-gray-700 rounded-full h-3">
                <div className="gradient-purple h-3 rounded-full" style={{ width: "65%" }}></div>
              </div>
            </div>

            <div className="flex gap-3">
              <button className="flex-1 py-3 bg-gray-800 text-white rounded-lg hover:bg-gray-700 transition font-bold">
                UPDATE PROGRESS
              </button>
              <button className="flex-1 py-3 gradient-purple text-white rounded-lg hover:opacity-90 transition font-bold">
                MARK COMPLETE
              </button>
            </div>
          </div>

          {/* Active Job 2 */}
          <div className="bg-gray-900 border border-primary-700 rounded-lg p-6 card-glow">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-xl font-semibold mb-1 text-white">Rank Boost - Levels 1-50</h3>
                <p className="text-gray-400 text-sm">Call of Duty: Black Ops 7</p>
                <p className="text-gray-500 text-sm">Job #JOB-002 | Order #ORD-002</p>
              </div>
              <div className="text-right">
                <span className="px-3 py-1 bg-green-900/30 border border-green-600 text-green-400 rounded-full text-sm font-semibold">
                  In Progress
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <div>
                <p className="text-sm text-gray-500">Payout</p>
                <p className="text-xl font-bold text-green-400">$25.00</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Est. Hours</p>
                <p className="font-semibold text-white">12 hours</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Accepted</p>
                <p className="font-semibold text-white">Dec 4, 2025</p>
              </div>
            </div>

            <div className="mb-4">
              <p className="text-gray-400 text-sm mb-2">
                <span className="font-semibold">Requirements:</span> Level 1 to Level 50
              </p>
            </div>

            <div className="mb-4">
              <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-400">Progress</span>
                <span className="font-semibold text-primary-400">30%</span>
              </div>
              <div className="w-full bg-gray-700 rounded-full h-3">
                <div className="gradient-purple h-3 rounded-full" style={{ width: "30%" }}></div>
              </div>
            </div>

            <div className="flex gap-3">
              <button className="flex-1 py-3 bg-gray-800 text-white rounded-lg hover:bg-gray-700 transition font-bold">
                UPDATE PROGRESS
              </button>
              <button className="flex-1 py-3 gradient-purple text-white rounded-lg hover:opacity-90 transition font-bold">
                MARK COMPLETE
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Past Jobs Tab */}
      {activeTab === "past" && (
        <div className="space-y-4">
          {/* Past Job 1 */}
          <div className="bg-gray-900 border border-primary-700 rounded-lg p-6">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-xl font-semibold mb-1 text-white">Battle Pass Tier 1-100</h3>
                <p className="text-gray-400 text-sm">Call of Duty: Black Ops 7</p>
                <p className="text-gray-500 text-sm">Job #JOB-000 | Order #ORD-000</p>
              </div>
              <div className="text-right">
                <span className="px-3 py-1 bg-green-900/30 border border-green-700/50 rounded-full text-green-400 text-xs font-semibold">
                  Completed
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <p className="text-sm text-gray-500">Earned</p>
                <p className="text-xl font-bold text-green-400">$35.00</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Hours Worked</p>
                <p className="font-semibold text-white">15 hours</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Accepted</p>
                <p className="font-semibold text-white">Nov 15, 2025</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Completed</p>
                <p className="font-semibold text-white">Nov 20, 2025</p>
              </div>
            </div>

            <div className="mt-4">
              <p className="text-gray-400 text-sm">
                <span className="font-semibold">Requirements:</span> Complete Battle Pass Season 1
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Earnings Tab */}
      {activeTab === "earnings" && (
        <div>
          {/* Filter Controls */}
          <div className="flex gap-4 mb-6">
            <div>
              <label className="block text-sm text-gray-400 mb-1">Month</label>
              <select
                value={earningsFilter.month}
                onChange={(e) => setEarningsFilter({ ...earningsFilter, month: e.target.value })}
                className="bg-gray-900 border border-primary-700 text-white rounded-lg px-4 py-2"
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
              <label className="block text-sm text-gray-400 mb-1">Year</label>
              <select
                value={earningsFilter.year}
                onChange={(e) => setEarningsFilter({ ...earningsFilter, year: e.target.value })}
                className="bg-gray-900 border border-primary-700 text-white rounded-lg px-4 py-2"
              >
                <option value="2024">2024</option>
                <option value="2025">2025</option>
              </select>
            </div>
          </div>

          {/* Earnings Summary */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-gray-900 border border-primary-700 rounded-lg p-6 card-glow">
              <p className="text-gray-400 mb-2">Total Earnings</p>
              <p className="text-4xl font-bold text-green-400">$350.00</p>
            </div>
            <div className="bg-gray-900 border border-primary-700 rounded-lg p-6 card-glow">
              <p className="text-gray-400 mb-2">Jobs Completed</p>
              <p className="text-4xl font-bold text-primary-400">11</p>
            </div>
            <div className="bg-gray-900 border border-primary-700 rounded-lg p-6 card-glow">
              <p className="text-gray-400 mb-2">Average Per Job</p>
              <p className="text-4xl font-bold text-white">$31.82</p>
            </div>
          </div>

          {/* Earnings History */}
          <div className="bg-gray-900 border border-primary-700 rounded-lg">
            <div className="p-4 border-b border-primary-700">
              <h3 className="font-semibold text-white">Earnings by Month</h3>
            </div>
            <div className="p-6 space-y-4">
              <div className="flex justify-between items-center p-4 bg-gray-800 rounded-lg">
                <div>
                  <p className="text-white font-semibold">December 2025</p>
                  <p className="text-gray-400 text-sm">3 jobs completed</p>
                </div>
                <p className="text-2xl font-bold text-green-400">$100.00</p>
              </div>
              <div className="flex justify-between items-center p-4 bg-gray-800 rounded-lg">
                <div>
                  <p className="text-white font-semibold">November 2025</p>
                  <p className="text-gray-400 text-sm">8 jobs completed</p>
                </div>
                <p className="text-2xl font-bold text-green-400">$250.00</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}

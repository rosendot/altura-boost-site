'use client';

import { useState } from 'react';

// Mock data for customer orders
const mockActiveOrders = [
  {
    id: 'ORD-001',
    serviceName: 'Weapon Camos',
    gameName: 'Call of Duty: Black Ops 7',
    orderDate: '2025-12-01',
    status: 65,
    estimatedCompletion: '2025-12-08',
    totalPrice: '$49.99',
    details: '5 Weapons to Gold Camo',
  },
  {
    id: 'ORD-002',
    serviceName: 'Rank Boost',
    gameName: 'Call of Duty: Black Ops 7',
    orderDate: '2025-12-03',
    status: 30,
    estimatedCompletion: '2025-12-10',
    totalPrice: '$79.99',
    details: 'Level 1 to Prestige Master',
  },
];

const mockPastOrders = [
  {
    id: 'ORD-000',
    serviceName: 'Battle Pass',
    gameName: 'Call of Duty: Black Ops 7',
    orderDate: '2025-11-15',
    completedDate: '2025-11-20',
    totalPrice: '$59.99',
    details: 'Season 1 Battle Pass Complete',
  },
  {
    id: 'ORD-999',
    serviceName: 'Challenge Completion',
    gameName: 'Call of Duty: Black Ops 7',
    orderDate: '2025-11-10',
    completedDate: '2025-11-13',
    totalPrice: '$39.99',
    details: 'Seasonal Challenges',
  },
];

export default function CustomerOrdersPage() {
  const [activeTab, setActiveTab] = useState<'active' | 'past'>('active');

  return (
    <main className="min-h-screen bg-black pt-24 pb-12">
      <div className="max-w-7xl mx-auto px-4">
        <h1 className="text-4xl font-bold text-white mb-8">My Orders</h1>

        {/* Tabs */}
        <div className="flex gap-4 mb-8 border-b border-gray-800">
          <button
            onClick={() => setActiveTab('active')}
            className={`px-6 py-3 font-semibold transition-colors ${
              activeTab === 'active'
                ? 'text-primary-400 border-b-2 border-primary-400'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            Active Orders
          </button>
          <button
            onClick={() => setActiveTab('past')}
            className={`px-6 py-3 font-semibold transition-colors ${
              activeTab === 'past'
                ? 'text-primary-400 border-b-2 border-primary-400'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            Past Orders
          </button>
        </div>

        {/* Active Orders */}
        {activeTab === 'active' && (
          <div className="space-y-4">
            {mockActiveOrders.length === 0 ? (
              <div className="bg-gray-900 border border-primary-700 rounded-lg p-8 text-center">
                <p className="text-gray-400">No active orders</p>
              </div>
            ) : (
              mockActiveOrders.map((order) => (
                <div
                  key={order.id}
                  className="bg-gray-900 border border-primary-700 rounded-lg p-6"
                >
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-xl font-bold text-white mb-1">
                        {order.serviceName}
                      </h3>
                      <p className="text-gray-400 text-sm">{order.gameName}</p>
                      <p className="text-gray-500 text-sm">Order #{order.id}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-primary-400">
                        {order.totalPrice}
                      </p>
                      <p className="text-gray-500 text-sm">
                        Ordered: {order.orderDate}
                      </p>
                    </div>
                  </div>

                  <div className="mb-4">
                    <p className="text-gray-400 text-sm mb-2">{order.details}</p>
                    <p className="text-gray-500 text-sm">
                      Est. Completion: {order.estimatedCompletion}
                    </p>
                  </div>

                  {/* Progress Bar */}
                  <div className="mb-2">
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-gray-400">Progress</span>
                      <span className="text-primary-400 font-semibold">
                        {order.status}%
                      </span>
                    </div>
                    <div className="w-full bg-gray-800 rounded-full h-3 overflow-hidden">
                      <div
                        className="h-full gradient-purple transition-all duration-500"
                        style={{ width: `${order.status}%` }}
                      ></div>
                    </div>
                  </div>

                  <div className="flex gap-3 mt-4">
                    <button className="flex-1 py-2 px-4 bg-gray-800 text-white rounded-lg hover:bg-gray-700 transition">
                      View Details
                    </button>
                    <button className="flex-1 py-2 px-4 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition">
                      Contact Support
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* Past Orders */}
        {activeTab === 'past' && (
          <div className="space-y-4">
            {mockPastOrders.length === 0 ? (
              <div className="bg-gray-900 border border-primary-700 rounded-lg p-8 text-center">
                <p className="text-gray-400">No past orders</p>
              </div>
            ) : (
              mockPastOrders.map((order) => (
                <div
                  key={order.id}
                  className="bg-gray-900 border border-primary-700 rounded-lg p-6"
                >
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-xl font-bold text-white mb-1">
                        {order.serviceName}
                      </h3>
                      <p className="text-gray-400 text-sm">{order.gameName}</p>
                      <p className="text-gray-500 text-sm">Order #{order.id}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-primary-400">
                        {order.totalPrice}
                      </p>
                      <span className="inline-block px-3 py-1 bg-green-900/30 border border-green-700/50 rounded-full text-green-400 text-xs font-semibold">
                        Completed
                      </span>
                    </div>
                  </div>

                  <div className="mb-4">
                    <p className="text-gray-400 text-sm mb-2">{order.details}</p>
                    <p className="text-gray-500 text-sm">
                      Ordered: {order.orderDate}
                    </p>
                    <p className="text-gray-500 text-sm">
                      Completed: {order.completedDate}
                    </p>
                  </div>

                  <div className="flex gap-3">
                    <button className="flex-1 py-2 px-4 bg-gray-800 text-white rounded-lg hover:bg-gray-700 transition">
                      View Receipt
                    </button>
                    <button className="flex-1 py-2 px-4 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition">
                      Order Again
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </main>
  );
}

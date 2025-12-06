import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-screen bg-black">
      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-4 py-20">
        <div className="text-center">
          <h1 className="text-6xl font-bold mb-6 text-transparent bg-clip-text gradient-purple">
            DOMINATE EVERY MATCH
          </h1>
          <p className="text-xl text-gray-300 mb-8">
            Professional camo boosting, secure & fast. Unlock your full potential.
          </p>
          <Link
            href="/games/black-ops-7"
            className="inline-block px-10 py-4 gradient-purple text-white text-lg font-bold rounded-lg hover:opacity-90 transition shadow-lg"
          >
            GET STARTED
          </Link>
        </div>
      </section>

      {/* Money-Back Guarantee */}
      <section className="max-w-7xl mx-auto px-4 py-12">
        <div className="bg-gradient-to-r from-primary-900/50 to-primary-800/50 border border-primary-700 rounded-lg p-8 text-center">
          <div className="flex justify-center mb-4">
            <svg className="w-12 h-12 text-primary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
          </div>
          <h2 className="text-3xl font-bold mb-4 text-primary-300">MONEY-BACK GUARANTEE</h2>
          <p className="text-gray-300 text-lg">
            Either you&apos;re satisfied with your results or your money back!
          </p>
        </div>
      </section>

      {/* Featured Games */}
      <section className="max-w-7xl mx-auto px-4 py-16">
        <h2 className="text-4xl font-bold mb-8 text-white">Available Games</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Link
            href="/games/black-ops-7"
            className="bg-gray-900 border border-primary-700 rounded-lg p-6 hover:border-primary-500 card-glow transition"
          >
            <h3 className="text-2xl font-semibold mb-2 text-white">Black Ops 7</h3>
            <p className="text-gray-400">Weapon leveling, camo unlocks, and more</p>
          </Link>
        </div>
      </section>

      {/* How It Works */}
      <section className="max-w-7xl mx-auto px-4 py-16">
        <h2 className="text-4xl font-bold mb-12 text-center text-white">How It Works</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-gray-900 border border-primary-700 rounded-lg p-8 text-center card-glow">
            <div className="text-5xl mb-4 text-primary-400 font-bold">1</div>
            <h3 className="text-xl font-semibold mb-3 text-white">Choose Your Service</h3>
            <p className="text-gray-400">Select the game and service you need</p>
          </div>
          <div className="bg-gray-900 border border-primary-700 rounded-lg p-8 text-center card-glow">
            <div className="text-5xl mb-4 text-primary-400 font-bold">2</div>
            <h3 className="text-xl font-semibold mb-3 text-white">Complete Your Order</h3>
            <p className="text-gray-400">Add to cart and checkout securely</p>
          </div>
          <div className="bg-gray-900 border border-primary-700 rounded-lg p-8 text-center card-glow">
            <div className="text-5xl mb-4 text-primary-400 font-bold">3</div>
            <h3 className="text-xl font-semibold mb-3 text-white">Track Progress</h3>
            <p className="text-gray-400">Monitor your order in real-time</p>
          </div>
        </div>
      </section>
    </main>
  );
}

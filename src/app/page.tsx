import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-screen">
      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-4 py-16">
        <div className="text-center">
          <h1 className="text-5xl font-bold mb-6">Welcome to Altura Boost</h1>
          <p className="text-xl text-gray-600 mb-8">
            Professional gaming services for your favorite titles
          </p>
          <Link
            href="/games/black-ops-7"
            className="inline-block px-8 py-4 bg-blue-600 text-white text-lg font-semibold rounded-lg hover:bg-blue-700 transition"
          >
            Get Started
          </Link>
        </div>
      </section>

      {/* Featured Games */}
      <section className="max-w-7xl mx-auto px-4 py-16">
        <h2 className="text-3xl font-bold mb-8">Available Games</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Link
            href="/games/black-ops-7"
            className="border rounded-lg p-6 hover:shadow-lg transition"
          >
            <h3 className="text-xl font-semibold mb-2">Black Ops 7</h3>
            <p className="text-gray-600">Weapon leveling, camo unlocks, and more</p>
          </Link>
        </div>
      </section>

      {/* How It Works */}
      <section className="max-w-7xl mx-auto px-4 py-16">
        <h2 className="text-3xl font-bold mb-8 text-center">How It Works</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="text-center">
            <div className="text-4xl mb-4">1️⃣</div>
            <h3 className="text-xl font-semibold mb-2">Choose Your Service</h3>
            <p className="text-gray-600">Select the game and service you need</p>
          </div>
          <div className="text-center">
            <div className="text-4xl mb-4">2️⃣</div>
            <h3 className="text-xl font-semibold mb-2">Complete Your Order</h3>
            <p className="text-gray-600">Add to cart and checkout securely</p>
          </div>
          <div className="text-center">
            <div className="text-4xl mb-4">3️⃣</div>
            <h3 className="text-xl font-semibold mb-2">Track Progress</h3>
            <p className="text-gray-600">Monitor your order in real-time</p>
          </div>
        </div>
      </section>
    </main>
  );
}

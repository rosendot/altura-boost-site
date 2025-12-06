import Link from "next/link";

// Mock game data
const games = [
  {
    id: "black-ops-7",
    title: "Call of Duty: Black Ops 7",
    description: "Weapon camos, rank boosts, challenges & more",
    category: "FPS",
    trending: true,
    icon: "🎯",
  },
];

export default function GamesPage() {
  return (
    <main className="min-h-screen bg-black">
      {/* Header */}
      <section className="max-w-7xl mx-auto px-4 py-16 md:py-24">
        <div className="text-center space-y-4">
          <h1 className="text-5xl md:text-6xl font-bold text-white">
            Our <span className="bg-clip-text gradient-purple">Games</span>
          </h1>
          <p className="text-lg md:text-xl text-gray-400 max-w-2xl mx-auto">
            Choose your game and explore our premium boosting services
          </p>
        </div>
      </section>

      {/* Games Grid */}
      <section className="max-w-7xl mx-auto px-4 pb-20">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {games.map((game) => (
            <Link
              key={game.id}
              href={`/games/${game.id}`}
              className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-gray-900 via-gray-800 to-black border border-gray-800 hover:border-primary-500 transition-all duration-300 transform hover:scale-105"
            >
              {/* Background Pattern */}
              <div className="absolute inset-0 opacity-10">
                <div
                  className="absolute inset-0"
                  style={{
                    backgroundImage:
                      "radial-gradient(circle at 2px 2px, rgb(139, 92, 246) 1px, transparent 0)",
                    backgroundSize: "40px 40px",
                  }}
                ></div>
              </div>

              {/* Content */}
              <div className="relative z-10 p-8">
                {/* Trending Badge */}
                {game.trending && (
                  <div className="absolute top-4 right-4">
                    <div className="inline-flex items-center gap-2 px-3 py-1 bg-red-600 rounded-full text-xs font-bold">
                      <span className="w-2 h-2 bg-white rounded-full animate-pulse"></span>
                      TRENDING
                    </div>
                  </div>
                )}

                {/* Icon */}
                <div className="text-6xl mb-4">{game.icon}</div>

                {/* Category Tag */}
                <div className="inline-block px-3 py-1 bg-primary-900/30 border border-primary-700/50 rounded-full text-primary-400 text-xs font-semibold mb-3">
                  {game.category}
                </div>

                {/* Title */}
                <h2 className="text-2xl font-bold text-white mb-2 group-hover:text-primary-400 transition-colors">
                  {game.title}
                </h2>

                {/* Description */}
                <p className="text-gray-400 text-sm mb-4">{game.description}</p>

                {/* CTA */}
                <div className="inline-flex items-center gap-2 text-primary-400 font-semibold text-sm group-hover:gap-3 transition-all">
                  View Services
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M17 8l4 4m0 0l-4 4m4-4H3"
                    />
                  </svg>
                </div>
              </div>

              {/* Glow Effect */}
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                <div className="absolute inset-0 bg-gradient-to-r from-primary-600/10 to-primary-400/10"></div>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </main>
  );
}

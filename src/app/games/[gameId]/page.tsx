'use client';

import { use } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { useCart } from "@/contexts/CartContext";

// Mock game data with detailed information
const gamesData: Record<string, GameData> = {
  "black-ops-7": {
    id: "black-ops-7",
    title: "Call of Duty: Black Ops 7",
    description: "Premium boosting services for Black Ops 7",
    longDescription:
      "Unlock the full potential of Black Ops 7 with our professional boosting services. Our team of expert players will help you achieve your gaming goals faster and more efficiently.",
    category: "FPS",
    releaseYear: 2025,
    icon: "🎯",
    bannerColor: "from-red-900/50 to-orange-900/50",
    services: [
      {
        id: "weapon-camos",
        name: "Weapon Camos",
        description: "Unlock all weapon camos including Gold, Diamond, and Dark Matter",
        price: "$49.99",
        duration: "3-5 days",
      },
      {
        id: "rank-boost",
        name: "Rank Boost",
        description: "Level up your account to Prestige Master",
        price: "$79.99",
        duration: "5-7 days",
      },
      {
        id: "challenges",
        name: "Challenge Completion",
        description: "Complete seasonal and weapon challenges",
        price: "$39.99",
        duration: "2-4 days",
      },
      {
        id: "battle-pass",
        name: "Battle Pass",
        description: "Complete the entire battle pass",
        price: "$59.99",
        duration: "3-5 days",
      },
    ],
    features: [
      "100% Hand-played by professionals",
      "VPN Protection included",
      "24/7 progress updates",
      "Account security guaranteed",
      "Money-back guarantee",
    ],
  },
};

interface Service {
  id: string;
  name: string;
  description: string;
  price: string;
  duration: string;
}

interface GameData {
  id: string;
  title: string;
  description: string;
  longDescription: string;
  category: string;
  releaseYear: number;
  icon: string;
  bannerColor: string;
  services: Service[];
  features: string[];
}

export default function GameDetailPage({
  params,
}: {
  params: Promise<{ gameId: string }>;
}) {
  const { gameId } = use(params);
  const game = gamesData[gameId];
  const { addToCart } = useCart();

  if (!game) {
    notFound();
  }

  const handleAddToCart = (service: Service) => {
    addToCart({
      id: `${game.id}-${service.id}`,
      gameId: game.id,
      gameName: game.title,
      serviceName: service.name,
      price: parseFloat(service.price.replace('$', '')),
      deliveryTime: service.duration,
    });
  };

  return (
    <main className="min-h-screen bg-black">
      {/* Hero Banner */}
      <section
        className={`relative overflow-hidden bg-gradient-to-r ${game.bannerColor}`}
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

        <div className="relative z-10 max-w-7xl mx-auto px-4 py-16 md:py-24">
          <div className="flex items-center gap-4 mb-6">
            <Link
              href="/games"
              className="inline-flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 19l-7-7 7-7"
                />
              </svg>
              Back to Games
            </Link>
          </div>

          <div className="flex flex-col md:flex-row items-center gap-8">
            <div className="text-8xl">{game.icon}</div>
            <div className="flex-1 text-center md:text-left">
              <div className="inline-block px-3 py-1 bg-primary-900/30 border border-primary-700/50 rounded-full text-primary-400 text-sm font-semibold mb-3">
                {game.category} • {game.releaseYear}
              </div>
              <h1 className="text-4xl md:text-6xl font-bold text-white mb-4">
                {game.title}
              </h1>
              <p className="text-lg md:text-xl text-gray-300 mb-6">
                {game.longDescription}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section className="max-w-7xl mx-auto px-4 py-16">
        <div className="mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Available <span className="bg-clip-text gradient-purple">Services</span>
          </h2>
          <p className="text-gray-400">
            Choose from our range of professional boosting services
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {game.services.map((service) => (
            <div
              key={service.id}
              className="group bg-gray-900/50 border border-gray-800 rounded-xl p-6 hover:border-primary-500 transition-all duration-300 hover:transform hover:scale-105"
            >
              <h3 className="text-xl font-bold text-white mb-2 group-hover:text-primary-400 transition-colors">
                {service.name}
              </h3>
              <p className="text-gray-400 text-sm mb-4">{service.description}</p>

              <div className="flex items-center justify-between mb-4">
                <div className="text-2xl font-bold bg-clip-text gradient-purple">
                  {service.price}
                </div>
                <div className="text-sm text-gray-500">⏱️ {service.duration}</div>
              </div>

              <button
                onClick={() => handleAddToCart(service)}
                className="w-full py-3 px-4 gradient-purple text-white font-semibold rounded-lg hover:opacity-90 transition-opacity"
              >
                Order Now
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* Features Section */}
      <section className="max-w-7xl mx-auto px-4 pb-20">
        <div className="bg-gray-900/50 border border-gray-800 rounded-2xl p-8 md:p-12">
          <h2 className="text-3xl font-bold text-white mb-8">
            Why Choose Our{" "}
            <span className="bg-clip-text gradient-purple">{game.title}</span>{" "}
            Services?
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {game.features.map((feature, index) => (
              <div key={index} className="flex items-start gap-3">
                <div className="flex-shrink-0 w-6 h-6 rounded-full gradient-purple flex items-center justify-center mt-1">
                  <svg
                    className="w-4 h-4 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                </div>
                <span className="text-gray-300">{feature}</span>
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}

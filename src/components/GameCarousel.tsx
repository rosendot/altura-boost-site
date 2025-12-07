"use client";

import { useState } from "react";
import Link from "next/link";

const games = [
  {
    title: "Call of Duty",
    subtitle: "Black Ops 7",
    description: "Weapon camos, rank boosts, challenges & more",
    href: "/games/black-ops-7",
    badge: "TRENDING NOW"
  },
  {
    title: "Call of Duty",
    subtitle: "Black Ops 7",
    description: "Weapon camos, rank boosts, challenges & more",
    href: "/games/black-ops-7",
    badge: "TRENDING NOW"
  },
  {
    title: "Call of Duty",
    subtitle: "Black Ops 7",
    description: "Weapon camos, rank boosts, challenges & more",
    href: "/games/black-ops-7",
    badge: "TRENDING NOW"
  }, {
    title: "Call of Duty",
    subtitle: "Black Ops 7",
    description: "Weapon camos, rank boosts, challenges & more",
    href: "/games/black-ops-7",
    badge: "TRENDING NOW"
  }, {
    title: "Call of Duty",
    subtitle: "Black Ops 7",
    description: "Weapon camos, rank boosts, challenges & more",
    href: "/games/black-ops-7",
    badge: "TRENDING NOW"
  }, {
    title: "Call of Duty",
    subtitle: "Black Ops 7",
    description: "Weapon camos, rank boosts, challenges & more",
    href: "/games/black-ops-7",
    badge: "TRENDING NOW"
  }, {
    title: "Call of Duty",
    subtitle: "Black Ops 7",
    description: "Weapon camos, rank boosts, challenges & more",
    href: "/games/black-ops-7",
    badge: "TRENDING NOW"
  }, {
    title: "Call of Duty",
    subtitle: "Black Ops 7",
    description: "Weapon camos, rank boosts, challenges & more",
    href: "/games/black-ops-7",
    badge: "TRENDING NOW"
  }
];

export default function GameCarousel() {
  const [currentIndex, setCurrentIndex] = useState(0);

  const cardsPerPage = 4;
  const totalPages = Math.ceil(games.length / cardsPerPage);

  const scrollPrev = () => {
    setCurrentIndex((prev) => (prev === 0 ? totalPages - 1 : prev - 1));
  };

  const scrollNext = () => {
    setCurrentIndex((prev) => (prev === totalPages - 1 ? 0 : prev + 1));
  };

  return (
    <div className="relative">
      <div className="overflow-hidden">
        <div
          className="flex gap-6 transition-transform duration-500 ease-out"
          style={{ transform: `translateX(-${currentIndex * 100}%)` }}
        >
          {games.map((game, index) => (
            <div key={index} className="flex-shrink-0 w-64">
              <Link
                href={game.href}
                className="group block relative overflow-hidden rounded-xl bg-gradient-to-br from-gray-900 via-gray-800 to-black border border-primary-700/50 hover:border-primary-500 transition-all duration-500 aspect-square"
              >
                <div className="absolute inset-0 p-6 flex flex-col items-center justify-center text-center">
                  {/* Background Pattern */}
                  <div className="absolute inset-0 opacity-10">
                    <div className="absolute inset-0" style={{
                      backgroundImage: 'radial-gradient(circle at 2px 2px, rgb(139, 92, 246) 1px, transparent 0)',
                      backgroundSize: '30px 30px'
                    }}></div>
                  </div>

                  {/* Content */}
                  <div className="relative z-10">
                    <div className="inline-flex items-center gap-1.5 px-2 py-0.5 bg-red-600 rounded-full text-xs font-bold mb-3">
                      <span className="w-1.5 h-1.5 bg-white rounded-full animate-pulse"></span>
                      {game.badge}
                    </div>
                    <h2 className="text-xl font-bold text-white mb-1">
                      {game.title}
                    </h2>
                    <h3 className="text-2xl font-bold bg-clip-text gradient-purple mb-3">
                      {game.subtitle}
                    </h3>
                    <p className="text-gray-400 text-sm mb-4">
                      {game.description}
                    </p>
                    <div className="inline-flex items-center gap-1.5 text-primary-400 text-sm font-semibold group-hover:gap-2 transition-all">
                      View Services
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                      </svg>
                    </div>
                  </div>

                  {/* Icon/Visual Element */}
                  <div className="absolute bottom-4 right-4">
                    <div className="w-16 h-16 rounded-full gradient-purple opacity-20 blur-xl absolute -top-4 -right-4"></div>
                    <div className="relative w-12 h-12 rounded-xl gradient-purple flex items-center justify-center shadow-xl transform group-hover:scale-110 transition-transform">
                      <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </svg>
                    </div>
                  </div>

                  {/* Glow Effect */}
                  <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                    <div className="absolute inset-0 bg-gradient-to-r from-primary-600/10 to-primary-400/10"></div>
                  </div>
                </div>
              </Link>
            </div>
          ))}
        </div>
      </div>

      {/* Navigation Buttons */}
      {games.length > 1 && (
        <>
          <button
            onClick={scrollPrev}
            className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 w-12 h-12 rounded-full bg-gray-900 border border-gray-800 hover:border-primary-700 flex items-center justify-center transition-all hover:scale-110 z-10"
            aria-label="Previous game"
          >
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <button
            onClick={scrollNext}
            className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 w-12 h-12 rounded-full bg-gray-900 border border-gray-800 hover:border-primary-700 flex items-center justify-center transition-all hover:scale-110 z-10"
            aria-label="Next game"
          >
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>

          {/* Dots Indicator */}
          <div className="flex justify-center gap-2 mt-6">
            {Array.from({ length: totalPages }).map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentIndex(index)}
                className={`w-2 h-2 rounded-full transition-all ${
                  index === currentIndex ? "bg-primary-500 w-8" : "bg-gray-600"
                }`}
                aria-label={`Go to page ${index + 1}`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}

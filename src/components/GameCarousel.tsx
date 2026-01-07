"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { getGameImageUrl } from "@/lib/supabase/storage";

interface Game {
  id: string;
  name: string;
  slug: string;
  image_url: string | null;
  active: boolean;
  created_at: string;
}

interface GameCarouselProps {
  games: Game[];
  onGameClick?: (gameId: string) => void;
}

export default function GameCarousel({ games, onGameClick }: GameCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);

  const cardsPerPage = 4;
  const totalPages = Math.ceil(games.length / cardsPerPage);

  const scrollPrev = () => {
    setCurrentIndex((prev) => (prev === 0 ? totalPages - 1 : prev - 1));
  };

  const scrollNext = () => {
    setCurrentIndex((prev) => (prev === totalPages - 1 ? 0 : prev + 1));
  };

  // Show empty state if no games
  if (games.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-400">No games available at the moment.</p>
      </div>
    );
  }

  return (
    <div className="relative" role="region" aria-label="Game carousel" aria-roledescription="carousel">
      <div className="overflow-hidden">
        <div
          className="flex gap-6 transition-transform duration-500 ease-out"
          style={{ transform: `translateX(-${currentIndex * 100}%)` }}
          role="group"
          aria-live="polite"
          aria-atomic="false"
        >
          {games.map((game) => {
            const imageUrl = getGameImageUrl(game.image_url);

            return (
              <div key={game.id} className="flex-shrink-0 w-64">
                {onGameClick ? (
                  <button
                    onClick={() => onGameClick(game.id)}
                    className="group block relative overflow-hidden rounded-xl border border-primary-700/50 hover:border-primary-500 transition-all duration-500 aspect-[2/3] w-full text-left"
                  >
                  {/* Game Cover Image */}
                  <div className="absolute inset-0">
                    <Image
                      src={imageUrl}
                      alt={game.name}
                      fill
                      className="object-cover transition-transform duration-500 group-hover:scale-110"
                      sizes="256px"
                    />
                    {/* Overlay gradient for text readability */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent"></div>
                  </div>

                  {/* Content Overlay */}
                  <div className="absolute inset-0 p-6 flex flex-col justify-end">
                    <div className="relative z-10">
                      <div className="inline-flex items-center gap-1.5 px-2 py-0.5 bg-red-600 rounded-full text-xs font-bold mb-3">
                        <span className="w-1.5 h-1.5 bg-white rounded-full animate-pulse"></span>
                        AVAILABLE NOW
                      </div>
                      <h2 className="text-2xl font-bold text-white mb-2">
                        {game.name}
                      </h2>
                      <div className="inline-flex items-center gap-1.5 text-primary-400 text-sm font-semibold group-hover:gap-2 transition-all">
                        View Services
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                        </svg>
                      </div>
                    </div>
                  </div>

                  {/* Glow Effect */}
                  <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                    <div className="absolute inset-0 bg-gradient-to-r from-primary-600/20 to-primary-400/20"></div>
                  </div>
                </button>
                ) : (
                <Link
                  href={`/games/${game.slug}`}
                  className="group block relative overflow-hidden rounded-xl border border-primary-700/50 hover:border-primary-500 transition-all duration-500 aspect-[2/3]"
                >
                  {/* Game Cover Image */}
                  <div className="absolute inset-0">
                    <Image
                      src={imageUrl}
                      alt={game.name}
                      fill
                      className="object-cover transition-transform duration-500 group-hover:scale-110"
                      sizes="256px"
                    />
                    {/* Overlay gradient for text readability */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent"></div>
                  </div>

                  {/* Content Overlay */}
                  <div className="absolute inset-0 p-6 flex flex-col justify-end">
                    <div className="relative z-10">
                      <div className="inline-flex items-center gap-1.5 px-2 py-0.5 bg-red-600 rounded-full text-xs font-bold mb-3">
                        <span className="w-1.5 h-1.5 bg-white rounded-full animate-pulse"></span>
                        AVAILABLE NOW
                      </div>
                      <h2 className="text-2xl font-bold text-white mb-2">
                        {game.name}
                      </h2>
                      <div className="inline-flex items-center gap-1.5 text-primary-400 text-sm font-semibold group-hover:gap-2 transition-all">
                        View Services
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                        </svg>
                      </div>
                    </div>
                  </div>

                  {/* Glow Effect */}
                  <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                    <div className="absolute inset-0 bg-gradient-to-r from-primary-600/20 to-primary-400/20"></div>
                  </div>
                </Link>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Navigation Buttons */}
      {games.length > 1 && (
        <>
          <button
            onClick={scrollPrev}
            onKeyDown={(e) => {
              if (e.key === 'ArrowLeft') {
                e.preventDefault();
                scrollPrev();
              }
            }}
            className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 w-12 h-12 rounded-full bg-gray-900 border border-gray-800 hover:border-primary-700 flex items-center justify-center transition-all hover:scale-110 z-10 focus:outline-none focus:ring-2 focus:ring-primary-500"
            aria-label={`Previous game, currently showing page ${currentIndex + 1} of ${totalPages}`}
            aria-controls="carousel-content"
          >
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <button
            onClick={scrollNext}
            onKeyDown={(e) => {
              if (e.key === 'ArrowRight') {
                e.preventDefault();
                scrollNext();
              }
            }}
            className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 w-12 h-12 rounded-full bg-gray-900 border border-gray-800 hover:border-primary-700 flex items-center justify-center transition-all hover:scale-110 z-10 focus:outline-none focus:ring-2 focus:ring-primary-500"
            aria-label={`Next game, currently showing page ${currentIndex + 1} of ${totalPages}`}
            aria-controls="carousel-content"
          >
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>

          {/* Dots Indicator */}
          <div className="flex justify-center gap-2 mt-6" role="group" aria-label="Carousel page indicators">
            {Array.from({ length: totalPages }).map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentIndex(index)}
                className={`w-2 h-2 rounded-full transition-all focus:outline-none focus:ring-2 focus:ring-primary-500 ${
                  index === currentIndex ? "bg-primary-500 w-8" : "bg-gray-600"
                }`}
                aria-label={`Go to page ${index + 1} of ${totalPages}`}
                aria-current={index === currentIndex ? "true" : "false"}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}

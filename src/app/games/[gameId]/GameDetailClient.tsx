'use client';

import { useCart } from "@/contexts/CartContext";

interface Service {
  id: string;
  name: string;
  description: string | null;
  price: number;
  delivery_time_hours: number;
  game_id: string;
}

interface Game {
  id: string;
  name: string;
  slug: string;
  image_url: string | null;
  active: boolean;
}

interface GameDetailClientProps {
  game: Game;
  services: Service[];
  features: string[];
}

export default function GameDetailClient({ game, services, features }: GameDetailClientProps) {
  const { addToCart } = useCart();

  const handleAddToCart = (service: Service) => {
    addToCart({
      id: `${game.id}-${service.id}`,
      serviceId: service.id, // Real service UUID for checkout
      gameId: game.id,
      gameName: game.name,
      serviceName: service.name,
      price: service.price,
      deliveryTime: `${Math.ceil(service.delivery_time_hours / 24)} days`,
    });
  };

  return (
    <>
      {/* Services Section */}
      <section className="max-w-7xl mx-auto px-4 py-16" aria-labelledby="services-heading">
        <div className="mb-12">
          <h2 id="services-heading" className="text-3xl md:text-4xl font-bold text-white mb-4">
            Available Services
          </h2>
          <p className="text-gray-400">
            Choose from our range of professional boosting services
          </p>
        </div>

        {!services || services.length === 0 ? (
          <div className="text-center py-12" role="status">
            <p className="text-gray-400">No services available for this game at the moment.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {services.map((service) => (
              <div
                key={service.id}
                className="group bg-gray-900/50 border border-gray-800 rounded-xl p-6 hover:border-primary-500 transition-all duration-300 hover:transform hover:scale-105"
              >
                <h3 className="text-xl font-bold text-white mb-2 group-hover:text-primary-400 transition-colors">
                  {service.name}
                </h3>
                <p className="text-gray-400 text-sm mb-4">
                  {service.description || 'Professional boosting service'}
                </p>

                <div className="flex items-center justify-between mb-4">
                  <div className="text-2xl font-bold text-white">
                    ${service.price.toFixed(2)}
                  </div>
                  <div className="text-sm text-gray-500" aria-label={`Delivery time: ${Math.ceil(service.delivery_time_hours / 24)} days`}>
                    ⏱️ {Math.ceil(service.delivery_time_hours / 24)} days
                  </div>
                </div>

                <button
                  onClick={() => handleAddToCart(service)}
                  className="w-full py-3 px-4 gradient-purple text-white font-semibold rounded-lg hover:opacity-90 transition-opacity focus:outline-none focus:ring-2 focus:ring-primary-500"
                  aria-label={`Order ${service.name} for $${service.price.toFixed(2)}`}
                >
                  Order Now
                </button>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Features Section */}
      <section className="max-w-7xl mx-auto px-4 pb-20" aria-labelledby="features-heading">
        <div className="bg-gray-900/50 border border-gray-800 rounded-2xl p-8 md:p-12">
          <h2 id="features-heading" className="text-3xl font-bold text-white mb-8">
            Why Choose Our {game.name} Services?
          </h2>

          <ul className="grid grid-cols-1 md:grid-cols-2 gap-4 list-none">
            {features.map((feature, index) => (
              <li key={index} className="flex items-start gap-3">
                <div className="flex-shrink-0 w-6 h-6 rounded-full gradient-purple flex items-center justify-center mt-1" aria-hidden="true">
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
              </li>
            ))}
          </ul>
        </div>
      </section>
    </>
  );
}

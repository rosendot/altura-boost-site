'use client';

import { useState } from 'react';
import { useCart } from "@/contexts/CartContext";
import { calculateTieredPrice, getStartingPrice, type PricingTier } from "@/lib/pricing/calculateTieredPrice";

interface ServicePricingTier {
  id: string;
  service_id: string;
  min_quantity: number;
  max_quantity: number;
  price_per_unit: number;
  booster_payout_per_unit: number;
}

interface Service {
  id: string;
  name: string;
  description: string | null;
  price: number;
  game_id: string;
  pricing_type: 'fixed' | 'tiered';
  unit_name: string | null;
  max_quantity: number | null;
  batch_size: number | null;
  pricing_tiers?: ServicePricingTier[];
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
}

// Component for tiered service with quantity selector
function TieredServiceCard({ service, onAddToCart }: {
  service: Service;
  onAddToCart: (service: Service, quantity: number, calculatedPrice: number) => void;
}) {
  const [quantity, setQuantity] = useState(1);

  const tiers: PricingTier[] = (service.pricing_tiers || []).map(t => ({
    min_quantity: t.min_quantity,
    max_quantity: t.max_quantity,
    price_per_unit: t.price_per_unit,
    booster_payout_per_unit: t.booster_payout_per_unit,
  }));

  const priceCalc = calculateTieredPrice(quantity, tiers);
  const startingPrice = getStartingPrice(tiers);
  const maxQty = service.max_quantity || 30;
  const unitName = service.unit_name || 'unit';

  const handleQuantityChange = (newQty: number) => {
    if (newQty >= 1 && newQty <= maxQty) {
      setQuantity(newQty);
    }
  };

  return (
    <div className="group bg-gray-900/50 border border-gray-800 rounded-xl p-6 hover:border-primary-500 transition-all duration-300">
      <h3 className="text-xl font-bold text-white mb-2 group-hover:text-primary-400 transition-colors">
        {service.name}
      </h3>
      <p className="text-gray-400 text-sm mb-4">
        {service.description || 'Professional boosting service'}
      </p>

      {/* Starting Price Display */}
      <div className="text-sm text-gray-500 mb-2">
        From ${startingPrice.toFixed(2)} per {unitName}
      </div>

      {/* Quantity Selector */}
      <div className="mb-4">
        <label htmlFor={`qty-${service.id}`} className="block text-sm text-gray-400 mb-2">
          Number of {unitName}s:
        </label>
        <div className="flex items-center gap-3">
          <button
            onClick={() => handleQuantityChange(quantity - 1)}
            disabled={quantity <= 1}
            className="w-10 h-10 bg-gray-800 hover:bg-gray-700 text-white rounded-lg flex items-center justify-center transition disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-primary-500"
            aria-label={`Decrease ${unitName} count`}
          >
            -
          </button>
          <input
            id={`qty-${service.id}`}
            type="number"
            min={1}
            max={maxQty}
            value={quantity}
            onChange={(e) => handleQuantityChange(parseInt(e.target.value) || 1)}
            className="w-20 h-10 bg-gray-800 text-white text-center rounded-lg border border-gray-700 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
          <button
            onClick={() => handleQuantityChange(quantity + 1)}
            disabled={quantity >= maxQty}
            className="w-10 h-10 bg-gray-800 hover:bg-gray-700 text-white rounded-lg flex items-center justify-center transition disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-primary-500"
            aria-label={`Increase ${unitName} count`}
          >
            +
          </button>
          <span className="text-gray-500 text-sm">/ {maxQty} max</span>
        </div>
      </div>

      {/* Total Price */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <div className="text-2xl font-bold text-white">
            ${priceCalc.totalPrice.toFixed(2)}
          </div>
          <div className="text-sm text-gray-500">
            {quantity} × ${priceCalc.breakdown[0]?.pricePerUnit.toFixed(2) || '0.00'} per {unitName}
          </div>
        </div>
      </div>

      <button
        onClick={() => onAddToCart(service, quantity, priceCalc.totalPrice)}
        className="w-full py-3 px-4 gradient-purple text-white font-semibold rounded-lg hover:opacity-90 transition-opacity focus:outline-none focus:ring-2 focus:ring-primary-500"
        aria-label={`Order ${quantity} ${unitName}${quantity > 1 ? 's' : ''} of ${service.name} for $${priceCalc.totalPrice.toFixed(2)}`}
      >
        Order {quantity} {unitName}{quantity > 1 ? 's' : ''} - ${priceCalc.totalPrice.toFixed(2)}
      </button>
    </div>
  );
}

// Component for fixed price service
function FixedServiceCard({ service, onAddToCart }: {
  service: Service;
  onAddToCart: (service: Service) => void;
}) {
  return (
    <div className="group bg-gray-900/50 border border-gray-800 rounded-xl p-6 hover:border-primary-500 transition-all duration-300 hover:transform hover:scale-105">
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
      </div>

      <button
        onClick={() => onAddToCart(service)}
        className="w-full py-3 px-4 gradient-purple text-white font-semibold rounded-lg hover:opacity-90 transition-opacity focus:outline-none focus:ring-2 focus:ring-primary-500"
        aria-label={`Order ${service.name} for $${service.price.toFixed(2)}`}
      >
        Order Now
      </button>
    </div>
  );
}

export default function GameDetailClient({ game, services }: GameDetailClientProps) {
  const { addToCart } = useCart();

  const handleAddFixedToCart = (service: Service) => {
    addToCart({
      id: `${game.id}-${service.id}`,
      serviceId: service.id,
      gameId: game.id,
      gameName: game.name,
      serviceName: service.name,
      price: service.price,
      pricingType: 'fixed',
    });
  };

  const handleAddTieredToCart = (service: Service, quantity: number, calculatedPrice: number) => {
    addToCart({
      id: `${game.id}-${service.id}`,
      serviceId: service.id,
      gameId: game.id,
      gameName: game.name,
      serviceName: service.name,
      price: calculatedPrice,
      pricingType: 'tiered',
      unitCount: quantity,
      unitName: service.unit_name || 'unit',
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
              service.pricing_type === 'tiered' ? (
                <TieredServiceCard
                  key={service.id}
                  service={service}
                  onAddToCart={handleAddTieredToCart}
                />
              ) : (
                <FixedServiceCard
                  key={service.id}
                  service={service}
                  onAddToCart={handleAddFixedToCart}
                />
              )
            ))}
          </div>
        )}
      </section>
    </>
  );
}

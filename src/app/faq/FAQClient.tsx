"use client";

import { useState } from "react";

interface FAQ {
  question: string;
  answer: string;
}

interface FAQCategory {
  category: string;
  faqs: FAQ[];
}

interface FAQClientProps {
  faqCategories: FAQCategory[];
}

export default function FAQClient({ faqCategories }: FAQClientProps) {
  const [openItems, setOpenItems] = useState<Set<string>>(new Set());

  const toggleItem = (id: string) => {
    setOpenItems((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  return (
    <div className="space-y-8">
      {faqCategories.map((category) => (
        <section key={category.category} aria-labelledby={`category-${category.category}`}>
          <h2
            id={`category-${category.category}`}
            className="text-2xl font-bold text-primary-400 mb-4"
          >
            {category.category}
          </h2>
          <div className="space-y-4">
            {category.faqs.map((faq, index) => {
              const uniqueId = `${category.category}-${index}`;
              const isOpen = openItems.has(uniqueId);
              return (
                <div key={uniqueId} className="bg-gray-900 border border-primary-700 rounded-lg">
                  <button
                    onClick={() => toggleItem(uniqueId)}
                    aria-expanded={isOpen}
                    aria-controls={`faq-answer-${uniqueId}`}
                    id={`faq-question-${uniqueId}`}
                    className={`w-full px-6 py-4 text-left flex justify-between items-center hover:bg-gray-800 transition focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 ${isOpen ? 'rounded-t-lg' : 'rounded-lg'}`}
                  >
                    <span className="font-semibold text-lg text-white">{faq.question}</span>
                    <svg
                      className={`w-5 h-5 transition-transform text-primary-400 ${
                        isOpen ? "transform rotate-180" : ""
                      }`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      aria-hidden="true"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 9l-7 7-7-7"
                      />
                    </svg>
                  </button>
                  {isOpen && (
                    <div
                      id={`faq-answer-${uniqueId}`}
                      role="region"
                      aria-labelledby={`faq-question-${uniqueId}`}
                      className="px-6 pb-4 text-gray-300"
                    >
                      <p>{faq.answer}</p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </section>
      ))}
    </div>
  );
}

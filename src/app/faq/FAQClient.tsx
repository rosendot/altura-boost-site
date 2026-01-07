"use client";

import { useState } from "react";

interface FAQ {
  question: string;
  answer: string;
}

interface FAQClientProps {
  faqs: FAQ[];
}

export default function FAQClient({ faqs }: FAQClientProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <div className="space-y-4">
      {faqs.map((faq, index) => (
        <div key={index} className="bg-gray-900 border border-primary-700 rounded-lg">
          <button
            onClick={() => setOpenIndex(openIndex === index ? null : index)}
            aria-expanded={openIndex === index}
            aria-controls={`faq-answer-${index}`}
            id={`faq-question-${index}`}
            className="w-full px-6 py-4 text-left flex justify-between items-center hover:bg-gray-800 transition focus:outline-none focus:ring-2 focus:ring-primary-500 rounded-lg"
          >
            <span className="font-semibold text-lg text-white">{faq.question}</span>
            <svg
              className={`w-5 h-5 transition-transform text-primary-400 ${
                openIndex === index ? "transform rotate-180" : ""
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
          {openIndex === index && (
            <div
              id={`faq-answer-${index}`}
              role="region"
              aria-labelledby={`faq-question-${index}`}
              className="px-6 pb-4 text-gray-300"
            >
              <p>{faq.answer}</p>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

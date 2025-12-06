"use client";

import { useState } from "react";

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const faqs = [
    {
      question: "How does Altura Boost work?",
      answer:
        "Altura Boost connects skilled gamers (boosters) with customers who need gaming services. Customers select the service they need, place an order, and our verified boosters complete the work professionally and securely.",
    },
    {
      question: "Is my account safe?",
      answer:
        "Yes! We take account security very seriously. All boosters are verified professionals who sign NDAs. We use encrypted password management and never store your credentials in plain text. Your account information is protected at all times.",
    },
    {
      question: "How long does an order take?",
      answer:
        "Completion time varies based on the service. Each service listing shows an estimated completion time. Once your order is accepted by a booster, you can track progress in real-time through your orders page.",
    },
    {
      question: "How do I track my order?",
      answer:
        "After placing an order, you can visit the 'Orders' page from your account menu. You'll see all active orders with a progress bar showing completion status, updated by the booster as they work.",
    },
    {
      question: "What payment methods do you accept?",
      answer:
        "We accept all major credit cards, debit cards, and PayPal through our secure Stripe payment system. All transactions are encrypted and secure.",
    },
    {
      question: "Can I become a booster?",
      answer:
        "Yes! We're always looking for skilled gamers. Visit our 'Work with Us' page to learn about requirements and start your application. You'll need to pass verification and skill assessments.",
    },
    {
      question: "What if I'm not satisfied with my order?",
      answer:
        "Customer satisfaction is our priority. If there's an issue with your order, contact our support team immediately. We'll work to resolve the issue or provide a refund according to our terms of service.",
    },
    {
      question: "How do boosters get paid?",
      answer:
        "Boosters are paid per completed job. Earnings are tracked in the Jobs page and payouts are processed on a regular schedule. All payment details are handled securely through Stripe.",
    },
  ];

  return (
    <main className="min-h-screen max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold mb-6">Frequently Asked Questions</h1>
      <p className="text-gray-600 mb-8">
        Find answers to common questions about our services
      </p>

      <div className="space-y-4">
        {faqs.map((faq, index) => (
          <div key={index} className="border rounded-lg">
            <button
              onClick={() => setOpenIndex(openIndex === index ? null : index)}
              className="w-full px-6 py-4 text-left flex justify-between items-center hover:bg-gray-50 transition"
            >
              <span className="font-semibold text-lg">{faq.question}</span>
              <svg
                className={`w-5 h-5 transition-transform ${
                  openIndex === index ? "transform rotate-180" : ""
                }`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
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
              <div className="px-6 pb-4 text-gray-700">
                <p>{faq.answer}</p>
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="mt-12 bg-blue-50 border border-blue-200 rounded-lg p-6">
        <h2 className="text-2xl font-semibold mb-2">Still have questions?</h2>
        <p className="text-gray-700 mb-4">
          Can't find what you're looking for? Feel free to reach out to our support team.
        </p>
        <button className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition">
          Contact Support
        </button>
      </div>
    </main>
  );
}

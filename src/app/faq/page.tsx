import type { Metadata } from "next";
import FAQClient from "./FAQClient";
import { getFAQPageSchema, StructuredData } from "@/lib/structuredData";

export const metadata: Metadata = {
  title: 'FAQ',
  description: 'Frequently asked questions about Altura Boost. Learn about our game boosting services, account security, payment methods, order tracking, and how to become a booster.',
  alternates: {
    canonical: '/faq',
  },
  openGraph: {
    title: 'Frequently Asked Questions - Altura Boost',
    description: 'Find answers to common questions about our game boosting services, account security, payments, and more.',
    url: '/faq',
  },
  twitter: {
    title: 'Frequently Asked Questions - Altura Boost',
    description: 'Find answers to common questions about our game boosting services, account security, payments, and more.',
  },
};

export default function FAQ() {
  const faqCategories = [
    {
      category: "Customers",
      faqs: [
        {
          question: "How long does an order take?",
          answer:
            "Order completion time varies based on the service requested. Different services require different amounts of time depending on factors like type of service (camos, levels, ranks, challenges, etc.), difficulty and grind length, current order volume, and game updates or playlist availability. Once your order is accepted and in progress, it is worked on as efficiently as possible while maintaining consistency and account safety. You'll be able to track progress inside your orders page, so you're never left guessing where your order stands.",
        },
        {
          question: "Can I play on the account during the order?",
          answer:
            "No. The account cannot be used while an order is in progress. To avoid conflicts, delays, or progress issues, the account must remain unused during active work. You'll be able to schedule approved time windows in the intake form we send you, letting us know when you do not want the account accessed. Outside of those scheduled windows, the account should remain untouched until the order is completed. The less time you want the account logged in, the longer an order will take.",
        },
        {
          question: "What platforms do you support?",
          answer:
            "We support all major platforms, including PlayStation, Xbox, and PC. If the game or service is available on your platform, we can support it.",
        },
        {
          question: "What happens if it takes longer than expected?",
          answer:
            "If an order takes longer than expected, it is reviewed internally and may be assigned to one of our top-performing pros to ensure quality and completion standards are met. This allows us to maintain consistent results, protect account safety, and ensure the service is completed correctly, not rushed. While this may slightly extend completion time, it ensures the final result meets our standards. As always, you can request a refund to be processed if you are not satisfied.",
        },
      ],
    },
    {
      category: "Boosters",
      faqs: [
        {
          question: "How do I become a booster?",
          answer:
            'To become a booster, click the "Work With Us" button and complete the application form. Once submitted, your information is securely sent to Stripe for identity verification. After verification, your application is manually reviewed and approved by our admin team. Approval is not automatic. This process ensures quality, accountability, and consistency across our platform.',
        },
        {
          question: "How are orders accepted?",
          answer:
            "Once approved, boosters gain access to the Booster Hub from their home screen. Inside the Booster Hub, boosters can view a list of available active orders, review the necessary order details, and accept an order they want to work on. After accepting an order, the booster logs into the account only during the designated time frames provided by the client and begins work.",
        },
        {
          question: "Why do some orders pay more than others?",
          answer:
            "Order payouts vary based on the time, difficulty, and complexity of the service requested. Factors that influence payout include type of service being completed, estimated completion time, difficulty or grind intensity, and risk or precision required. Higher-effort or more demanding orders are priced accordingly to ensure quality, consistency, and fair compensation.",
        },
        {
          question: "What if I can't finish an order I accepted?",
          answer:
            "If you're unable to complete an order you've accepted, you can unassign yourself from the order. You will be paid for the portion of work completed, based on the number of weapons finished at the time of unassignment. Once unassigned, the order is reviewed and reassigned to another booster to ensure completion and quality standards are met.",
        },
      ],
    },
  ];

  // Flatten FAQs for structured data schema
  const flatFaqs = faqCategories.flatMap((category) => category.faqs);

  // Generate FAQ structured data
  const faqSchema = getFAQPageSchema(flatFaqs);

  return (
    <main className="min-h-screen bg-black max-w-4xl mx-auto px-4 py-8">
      <StructuredData data={faqSchema} />
      <h1 className="text-4xl font-bold mb-6 text-white">Frequently Asked Questions</h1>
      <p className="text-gray-400 mb-8">
        Find answers to common questions about our services
      </p>

      <FAQClient faqCategories={faqCategories} />

      <div className="mt-12 bg-gradient-to-r from-primary-900/50 to-primary-800/50 border border-primary-700 rounded-lg p-6" aria-labelledby="contact-heading">
        <h2 id="contact-heading" className="text-2xl font-semibold mb-2 text-white">Still have questions?</h2>
        <p className="text-gray-300 mb-4">
          Can&apos;t find what you&apos;re looking for? Feel free to reach out to our support team.
        </p>
        <button className="px-6 py-3 gradient-purple text-white rounded-lg hover:opacity-90 transition font-bold focus:outline-none focus:ring-2 focus:ring-primary-500">
          CONTACT SUPPORT
        </button>
      </div>
    </main>
  );
}

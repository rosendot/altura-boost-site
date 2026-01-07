import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: 'Work With Us',
  description: 'Join our team of professional game boosters. Earn competitive pay with a flexible schedule. Requirements: high skill level, reliable internet, professional communication. Apply to become a booster today.',
  alternates: {
    canonical: '/work-with-us',
  },
  openGraph: {
    title: 'Work With Us - Altura Boost',
    description: 'Join our team of professional game boosters. Flexible schedule, competitive pay, and regular payouts. Apply today!',
    url: '/work-with-us',
  },
  twitter: {
    title: 'Work With Us - Altura Boost',
    description: 'Join our team of professional game boosters. Flexible schedule, competitive pay, and regular payouts. Apply today!',
  },
};

export default function WorkWithUs() {
  return (
    <main className="min-h-screen bg-black max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold mb-6 text-white">Work With Us</h1>

      <div className="prose max-w-none">
        <section aria-labelledby="intro-heading" className="mb-8">
          <h2 id="intro-heading" className="text-2xl font-semibold mb-4 text-primary-400">Join Our Team of Professional Boosters</h2>
          <p className="text-gray-300 mb-4">
            Are you a skilled gamer looking to turn your passion into profit? Altura Boost is always
            looking for dedicated and talented boosters to join our team.
          </p>
        </section>

        <section aria-labelledby="benefits-heading" className="mb-8">
          <h2 id="benefits-heading" className="text-2xl font-semibold mb-4 text-primary-400">Why Work With Us?</h2>
          <ul className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6 list-none">
            <li className="bg-gray-900 border border-primary-700 rounded-lg p-6 card-glow">
              <h3 className="text-xl font-semibold mb-2 text-white">Flexible Schedule</h3>
              <p className="text-gray-300">
                Work on your own time. Accept jobs when you&apos;re available and set your own hours.
              </p>
            </li>
            <li className="bg-gray-900 border border-primary-700 rounded-lg p-6 card-glow">
              <h3 className="text-xl font-semibold mb-2 text-white">Competitive Pay</h3>
              <p className="text-gray-300">
                Earn competitive rates for your skills. Get paid per job with transparent pricing.
              </p>
            </li>
            <li className="bg-gray-900 border border-primary-700 rounded-lg p-6 card-glow">
              <h3 className="text-xl font-semibold mb-2 text-white">Professional Environment</h3>
              <p className="text-gray-300">
                Work with a professional team and management system that respects your time.
              </p>
            </li>
            <li className="bg-gray-900 border border-primary-700 rounded-lg p-6 card-glow">
              <h3 className="text-xl font-semibold mb-2 text-white">Regular Payouts</h3>
              <p className="text-gray-300">
                Receive timely payments for completed work. Track all your earnings in one place.
              </p>
            </li>
          </ul>
        </section>

        <section aria-labelledby="requirements-heading" className="mb-8">
          <h2 id="requirements-heading" className="text-2xl font-semibold mb-4 text-primary-400">Requirements</h2>
          <ul className="list-disc list-inside space-y-2 text-gray-300 mb-6">
            <li>High skill level in the games you apply for</li>
            <li>Reliable internet connection</li>
            <li>Ability to complete jobs within estimated timeframes</li>
            <li>Professional communication skills</li>
            <li>18 years or older</li>
            <li>Valid government-issued ID for verification</li>
          </ul>
        </section>

        <section aria-labelledby="apply-heading" className="mb-8">
          <h2 id="apply-heading" className="text-2xl font-semibold mb-4 text-primary-400">How to Apply</h2>
          <p className="text-gray-300 mb-6">
            Ready to join our team? Click the button below to start your application. You&apos;ll need to:
          </p>
          <ol className="list-decimal list-inside space-y-2 text-gray-300 mb-6">
            <li>Complete our booster application form</li>
            <li>Provide verification information (ID and social security)</li>
            <li>Pass a skill assessment for your chosen game(s)</li>
            <li>Complete a brief orientation</li>
          </ol>

          <Link
            href="/signup/booster"
            className="inline-block px-8 py-4 gradient-purple text-white text-lg font-bold rounded-lg hover:opacity-90 transition focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            APPLY TO BECOME A BOOSTER
          </Link>
        </section>

        <section aria-labelledby="questions-heading" className="bg-gray-900 border border-primary-700 rounded-lg p-6">
          <h2 id="questions-heading" className="text-2xl font-semibold mb-4 text-white">Questions?</h2>
          <p className="text-gray-300 mb-4">
            Have questions about working with us? Check out our{" "}
            <Link href="/faq" className="text-primary-400 hover:text-primary-300 transition focus:outline-none focus:ring-2 focus:ring-primary-500 rounded">
              FAQ page
            </Link>{" "}
            or contact our team for more information.
          </p>
        </section>
      </div>
    </main>
  );
}

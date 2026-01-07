import type { Metadata } from "next";

export const metadata: Metadata = {
  title: 'Terms of Service',
  description: 'Terms of Service for Altura Boost. Read our terms regarding gaming services, account security, payment terms, booster requirements, prohibited activities, and liability.',
  openGraph: {
    title: 'Terms of Service - Altura Boost',
    description: 'Read our Terms of Service for game boosting services, account security, payments, and user agreements.',
  },
  twitter: {
    title: 'Terms of Service - Altura Boost',
    description: 'Read our Terms of Service for game boosting services, account security, payments, and user agreements.',
  },
};

export default function TermsOfService() {
  return (
    <main className="min-h-screen bg-black max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold mb-6 text-white">Terms of Service</h1>
      <p className="text-gray-400 mb-8">Last updated: December 6, 2024</p>

      <div className="prose max-w-none space-y-8">
        <section>
          <h2 className="text-2xl font-semibold mb-4 text-primary-400">1. Acceptance of Terms</h2>
          <p className="text-gray-300">
            By accessing and using Altura Boost&apos;s services, you agree to be bound by these Terms of
            Service. If you do not agree to these terms, please do not use our services.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4 text-primary-400">2. Service Description</h2>
          <p className="text-gray-300 mb-4">
            Altura Boost provides gaming services including but not limited to:
          </p>
          <ul className="list-disc list-inside space-y-2 text-gray-300">
            <li>Weapon leveling and progression</li>
            <li>Camo and achievement unlocks</li>
            <li>Rank boosting</li>
            <li>Other game-related services as listed on our platform</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4 text-primary-400">3. User Accounts</h2>
          <p className="text-gray-300 mb-4">
            When creating an account, you agree to:
          </p>
          <ul className="list-disc list-inside space-y-2 text-gray-300">
            <li>Provide accurate and current information</li>
            <li>Maintain the security of your account credentials</li>
            <li>Accept responsibility for all activities under your account</li>
            <li>Notify us immediately of any unauthorized use</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4 text-primary-400">4. Account Security</h2>
          <p className="text-gray-300 mb-4">
            For services requiring account access, you understand and agree that:
          </p>
          <ul className="list-disc list-inside space-y-2 text-gray-300">
            <li>Your game account credentials will be encrypted and securely stored</li>
            <li>Only verified boosters will have access to your account</li>
            <li>We are not responsible for actions taken by game publishers against your account</li>
            <li>
              You should review the terms of service of the game being boosted to understand potential
              risks
            </li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4 text-primary-400">5. Payment Terms</h2>
          <p className="text-gray-300 mb-4">
            All payments are processed securely through Stripe. By making a purchase:
          </p>
          <ul className="list-disc list-inside space-y-2 text-gray-300">
            <li>You agree to pay all fees associated with your order</li>
            <li>Prices are subject to change but locked at time of purchase</li>
            <li>Refunds are handled on a case-by-case basis per our refund policy</li>
            <li>Failed payments may result in order cancellation</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4 text-primary-400">6. Booster Terms</h2>
          <p className="text-gray-300 mb-4">If you are working as a booster, you agree to:</p>
          <ul className="list-disc list-inside space-y-2 text-gray-300">
            <li>Complete all accepted jobs within the estimated timeframe</li>
            <li>Maintain professional conduct at all times</li>
            <li>Protect customer account information</li>
            <li>Provide accurate progress updates</li>
            <li>Complete verification requirements including ID and tax information</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4 text-primary-400">7. Prohibited Activities</h2>
          <p className="text-gray-300 mb-4">Users may not:</p>
          <ul className="list-disc list-inside space-y-2 text-gray-300">
            <li>Use the service for fraudulent purposes</li>
            <li>Share account credentials with unauthorized parties</li>
            <li>Attempt to circumvent our payment systems</li>
            <li>Harass or abuse boosters or customers</li>
            <li>Violate any applicable laws or regulations</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4 text-primary-400">8. Limitation of Liability</h2>
          <p className="text-gray-300">
            Altura Boost is not liable for any damages resulting from use of our services, including
            but not limited to account suspensions, bans, or loss of in-game items. Our maximum
            liability is limited to the amount paid for the specific service in question.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4 text-primary-400">9. Privacy</h2>
          <p className="text-gray-300">
            Your privacy is important to us. We collect and use information as described in our Privacy
            Policy. By using our services, you consent to our data practices.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4 text-primary-400">10. Changes to Terms</h2>
          <p className="text-gray-300">
            We reserve the right to modify these terms at any time. Continued use of our services after
            changes constitutes acceptance of the new terms.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4 text-primary-400">11. Contact Information</h2>
          <p className="text-gray-300">
            For questions about these Terms of Service, please contact us through our support channels.
          </p>
        </section>
      </div>

      <div className="mt-12 pt-8 border-t border-primary-700 text-gray-400 text-sm">
        <p>
          These terms constitute the entire agreement between you and Altura Boost regarding the use of
          our services.
        </p>
      </div>
    </main>
  );
}

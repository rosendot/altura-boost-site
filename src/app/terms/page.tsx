import type { Metadata } from "next";

export const metadata: Metadata = {
  title: 'Terms of Service & Refund Policy',
  description: 'Terms of Service and Refund Policy for Altura Boost. Read our terms regarding gaming services, account security, payment terms, refunds, booster requirements, prohibited activities, and liability.',
  alternates: {
    canonical: '/terms',
  },
  openGraph: {
    title: 'Terms of Service & Refund Policy - Altura Boost',
    description: 'Read our Terms of Service and Refund Policy for game boosting services, account security, payments, and user agreements.',
    url: '/terms',
  },
  twitter: {
    title: 'Terms of Service & Refund Policy - Altura Boost',
    description: 'Read our Terms of Service and Refund Policy for game boosting services, account security, payments, and user agreements.',
  },
};

export default function TermsOfService() {
  return (
    <main className="min-h-screen bg-black max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold mb-6 text-white">Terms of Service</h1>
      <p className="text-gray-400 mb-8">Last updated: December 6, 2024</p>

      <div className="prose max-w-none space-y-8">
        <section aria-labelledby="section-1">
          <h2 id="section-1" className="text-2xl font-semibold mb-4 text-primary-400">1. Acceptance of Terms</h2>
          <p className="text-gray-300">
            By accessing and using Altura Boost&apos;s services, you agree to be bound by these Terms of
            Service. If you do not agree to these terms, please do not use our services.
          </p>
        </section>

        <section aria-labelledby="section-2">
          <h2 id="section-2" className="text-2xl font-semibold mb-4 text-primary-400">2. Service Description</h2>
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

        <section aria-labelledby="section-3">
          <h2 id="section-3" className="text-2xl font-semibold mb-4 text-primary-400">3. User Accounts</h2>
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

        <section aria-labelledby="section-4">
          <h2 id="section-4" className="text-2xl font-semibold mb-4 text-primary-400">4. Account Security</h2>
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

        <section aria-labelledby="section-5">
          <h2 id="section-5" className="text-2xl font-semibold mb-4 text-primary-400">5. Payment Terms</h2>
          <p className="text-gray-300 mb-4">
            All payments are processed securely through Stripe. By making a purchase:
          </p>
          <ul className="list-disc list-inside space-y-2 text-gray-300">
            <li>You agree to pay all fees associated with your order</li>
            <li>Prices are subject to change but locked at time of purchase</li>
            <li>Refunds are subject to our Refund Policy (see Sections 12-19 below)</li>
            <li>Failed payments may result in order cancellation</li>
          </ul>
        </section>

        <section aria-labelledby="section-6">
          <h2 id="section-6" className="text-2xl font-semibold mb-4 text-primary-400">6. Booster Terms</h2>
          <p className="text-gray-300 mb-4">If you are working as a booster, you agree to:</p>
          <ul className="list-disc list-inside space-y-2 text-gray-300">
            <li>Complete all accepted jobs within the estimated timeframe</li>
            <li>Maintain professional conduct at all times</li>
            <li>Protect customer account information</li>
            <li>Provide accurate progress updates</li>
            <li>Complete verification requirements including ID and tax information</li>
          </ul>
        </section>

        <section aria-labelledby="section-7">
          <h2 id="section-7" className="text-2xl font-semibold mb-4 text-primary-400">7. Prohibited Activities</h2>
          <p className="text-gray-300 mb-4">Users may not:</p>
          <ul className="list-disc list-inside space-y-2 text-gray-300">
            <li>Use the service for fraudulent purposes</li>
            <li>Share account credentials with unauthorized parties</li>
            <li>Attempt to circumvent our payment systems</li>
            <li>Harass or abuse boosters or customers</li>
            <li>Violate any applicable laws or regulations</li>
          </ul>
        </section>

        <section aria-labelledby="section-8">
          <h2 id="section-8" className="text-2xl font-semibold mb-4 text-primary-400">8. Limitation of Liability</h2>
          <p className="text-gray-300">
            Altura Boost is not liable for any damages resulting from use of our services, including
            but not limited to account suspensions, bans, or loss of in-game items. Our maximum
            liability is limited to the amount paid for the specific service in question.
          </p>
        </section>

        <section aria-labelledby="section-9">
          <h2 id="section-9" className="text-2xl font-semibold mb-4 text-primary-400">9. Privacy</h2>
          <p className="text-gray-300">
            Your privacy is important to us. We collect and use information as described in our Privacy
            Policy. By using our services, you consent to our data practices.
          </p>
        </section>

        <section aria-labelledby="section-10">
          <h2 id="section-10" className="text-2xl font-semibold mb-4 text-primary-400">10. Changes to Terms</h2>
          <p className="text-gray-300">
            We reserve the right to modify these terms at any time. Continued use of our services after
            changes constitutes acceptance of the new terms.
          </p>
        </section>

        <section aria-labelledby="section-11">
          <h2 id="section-11" className="text-2xl font-semibold mb-4 text-primary-400">11. Contact Information</h2>
          <p className="text-gray-300">
            For questions about these Terms of Service, please contact us through our support channels.
          </p>
        </section>

        {/* Refund Policy Sections */}
        <div className="mt-12 pt-8 border-t border-primary-700">
          <h2 className="text-3xl font-bold mb-8 text-white">Refund Policy</h2>
        </div>

        <section aria-labelledby="section-12">
          <h2 id="section-12" className="text-2xl font-semibold mb-4 text-primary-400">12. All Sales Are Final Once Work Begins</h2>
          <p className="text-gray-300 mb-4">
            Due to the nature of digital services and time-based labor, all boosting services are non-refundable once work has started on an order.
          </p>
          <p className="text-gray-300 mb-4">
            Once a booster logs into an account, begins progress, or allocates time to the order, the service is considered in progress and <strong className="text-white">cannot be reversed</strong>.
          </p>
        </section>

        <section aria-labelledby="section-13">
          <h2 id="section-13" className="text-2xl font-semibold mb-4 text-primary-400">13. Partial Refunds (Unstarted Work Only)</h2>
          <p className="text-gray-300 mb-4">
            A <strong className="text-white">partial or full refund</strong> may be issued only if:
          </p>
          <ul className="list-disc list-inside space-y-2 text-gray-300 mb-4">
            <li>The order has <strong className="text-white">not yet been started</strong></li>
            <li>No progress has been made</li>
            <li>No booster has logged into the account</li>
          </ul>
          <p className="text-gray-300">
            Once progress begins, refunds are no longer available.
          </p>
        </section>

        <section aria-labelledby="section-14">
          <h2 id="section-14" className="text-2xl font-semibold mb-4 text-primary-400">14. Progress-Based Credit (Not Cash Refunds)</h2>
          <p className="text-gray-300 mb-4">
            If an order is <strong className="text-white">unable to be completed</strong> due to internal issues (booster availability, system errors, etc.), you may receive:
          </p>
          <ul className="list-disc list-inside space-y-2 text-gray-300 mb-4">
            <li>A <strong className="text-white">store credit</strong> for the remaining, unfinished portion of the order</li>
            <li>Or reassignment to a top-performing booster to complete the job</li>
          </ul>
          <p className="text-gray-300">
            Credits are non-transferable and non-redeemable for cash.
          </p>
        </section>

        <section aria-labelledby="section-15">
          <h2 id="section-15" className="text-2xl font-semibold mb-4 text-primary-400">15. No Refunds for Delays</h2>
          <p className="text-gray-300 mb-4">
            Estimated completion times are <strong className="text-white">not guaranteed</strong>. Refunds will not be issued for:
          </p>
          <ul className="list-disc list-inside space-y-2 text-gray-300">
            <li>Delays caused by high demand</li>
            <li>Game updates, patches, or server outages</li>
            <li>Skill-based difficulty variations</li>
            <li>Platform or matchmaking inconsistencies</li>
          </ul>
        </section>

        <section aria-labelledby="section-16">
          <h2 id="section-16" className="text-2xl font-semibold mb-4 text-primary-400">16. Customer-Caused Issues Void Refunds</h2>
          <p className="text-gray-300 mb-4">
            Refunds will not be granted if issues arise due to:
          </p>
          <ul className="list-disc list-inside space-y-2 text-gray-300 mb-4">
            <li>Incorrect or incomplete login information</li>
            <li>Customer logging into the account during the service window</li>
            <li>Account bans, restrictions, or penalties unrelated to our actions</li>
            <li>Failure to follow scheduling or availability guidelines</li>
          </ul>
          <p className="text-gray-300">
            If a customer interferes with the service, the order may be <strong className="text-white">paused or canceled without a refund</strong>.
          </p>
        </section>

        <section aria-labelledby="section-17">
          <h2 id="section-17" className="text-2xl font-semibold mb-4 text-primary-400">17. Account Bans &amp; Risk Disclaimer</h2>
          <p className="text-gray-300 mb-4">
            By purchasing, you acknowledge:
          </p>
          <ul className="list-disc list-inside space-y-2 text-gray-300 mb-4">
            <li>Boosting carries <strong className="text-white">inherent risk</strong></li>
            <li>We are <strong className="text-white">not responsible</strong> for bans, warnings, or penalties caused by:
              <ul className="list-disc list-inside ml-6 mt-2 space-y-1">
                <li>Prior account history</li>
                <li>Third-party software</li>
                <li>Actions outside our control</li>
              </ul>
            </li>
          </ul>
          <p className="text-gray-300">
            Refunds will <strong className="text-white">not</strong> be issued for bans unless proven to be caused directly by our service and verified internally.
          </p>
        </section>

        <section aria-labelledby="section-18">
          <h2 id="section-18" className="text-2xl font-semibold mb-4 text-primary-400">18. Chargebacks &amp; Payment Disputes</h2>
          <p className="text-gray-300 mb-4">
            Unauthorized chargebacks or disputes will result in:
          </p>
          <ul className="list-disc list-inside space-y-2 text-gray-300 mb-4">
            <li>Immediate service termination</li>
            <li>Permanent account ban from our platform</li>
            <li>Loss of any remaining progress or credits</li>
          </ul>
          <p className="text-gray-300">
            We strongly encourage contacting support before disputing a charge.
          </p>
        </section>

        <section aria-labelledby="section-19">
          <h2 id="section-19" className="text-2xl font-semibold mb-4 text-primary-400">19. Refund Decision Authority</h2>
          <p className="text-gray-300 mb-4">
            All refund and credit decisions are made at <strong className="text-white">our sole discretion</strong> after internal review of:
          </p>
          <ul className="list-disc list-inside space-y-2 text-gray-300">
            <li>Order progress</li>
            <li>Booster logs</li>
            <li>System timestamps</li>
            <li>Account activity</li>
          </ul>
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

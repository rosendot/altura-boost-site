'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface UserData {
  role: 'customer' | 'booster' | 'admin';
  contract_signed_at: string | null;
}

const CONTRACT_VERSION = '1.0';

export default function BoosterAgreementClient() {
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const [agreed, setAgreed] = useState(false);
  const [signing, setSigning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    fetchUserData();
  }, []);

  const fetchUserData = async () => {
    try {
      const res = await fetch('/api/user/me');
      if (res.ok) {
        const data = await res.json();
        setUserData(data.userData);
      }
    } catch {
      // User not logged in, that's fine
    } finally {
      setLoading(false);
    }
  };

  const handleSign = async () => {
    if (!agreed) {
      setError('You must agree to the terms before signing.');
      return;
    }

    setSigning(true);
    setError(null);

    try {
      const res = await fetch('/api/boosters/sign-contract', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ version: CONTRACT_VERSION }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to sign contract');
      }

      // Refresh user data to show signed status
      await fetchUserData();

      // Redirect to hub after signing
      router.push('/hub');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to sign contract');
    } finally {
      setSigning(false);
    }
  };

  const isBooster = userData?.role === 'booster';
  const hasSigned = userData?.contract_signed_at != null;

  return (
    <main className="min-h-screen bg-black max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold mb-6 text-white">Independent Contractor Boosting Agreement</h1>

      {hasSigned && (
        <div className="mb-8 p-4 bg-green-900/30 border border-green-700 rounded-lg">
          <p className="text-green-400 font-medium">
            Contract signed on {new Date(userData.contract_signed_at!).toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })}
          </p>
        </div>
      )}

      <p className="text-gray-400 mb-8">Version {CONTRACT_VERSION}</p>

      <div className="prose max-w-none space-y-8">
        <p className="text-gray-300">
          This Agreement is entered into between Altura Boost and the individual accepting this Agreement (&quot;Contractor&quot;).
        </p>
        <p className="text-gray-300">
          By signing up, accessing the booster hub, or accepting any order, Contractor agrees to the following:
        </p>

        {/* Section 1 */}
        <section aria-labelledby="section-1">
          <h2 id="section-1" className="text-2xl font-semibold mb-4 text-primary-400">1. Independent Contractor Relationship</h2>
          <p className="text-gray-300">
            Contractor is an independent contractor and not an employee, partner, or agent of the Company.
            Contractor is responsible for all taxes, insurance, and legal obligations arising from payments received.
          </p>
        </section>

        {/* Section 2 */}
        <section aria-labelledby="section-2">
          <h2 id="section-2" className="text-2xl font-semibold mb-4 text-primary-400">2. Scope of Services</h2>
          <p className="text-gray-300">
            Contractor agrees to perform in-game progression services (&quot;Boosting Services&quot;) strictly as assigned
            through the Company platform and only within the parameters of each order.
          </p>
        </section>

        {/* Section 3 */}
        <section aria-labelledby="section-3">
          <h2 id="section-3" className="text-2xl font-semibold mb-4 text-primary-400">3. Account Access &amp; Security</h2>
          <ul className="list-disc list-inside space-y-2 text-gray-300">
            <li>Contractor may access customer accounts <strong className="text-white">only during approved time windows</strong></li>
            <li>Contractor may not change account credentials or recovery details</li>
            <li>Contractor may not share account access with any third party</li>
            <li>Contractor must log out immediately upon completing assigned tasks</li>
            <li>Contractor may not document any account credentials, settings, or recovery details</li>
          </ul>
        </section>

        {/* Section 4 */}
        <section aria-labelledby="section-4">
          <h2 id="section-4" className="text-2xl font-semibold mb-4 text-primary-400">4. Prohibited Conduct</h2>
          <p className="text-gray-300 mb-4">Contractor <strong className="text-white">may not</strong>, under any circumstances:</p>
          <ul className="list-disc list-inside space-y-2 text-gray-300 mb-4">
            <li>Use cheats, exploits, scripts, macros, or unauthorized software</li>
            <li>Contact customers directly outside the platform</li>
            <li>Offer private services to Company customers</li>
            <li>Accept payment outside the platform</li>
            <li>Sell, transfer, or reuse customer information</li>
            <li>Attempt to reverse-engineer or copy Company systems</li>
          </ul>
          <p className="text-gray-300 font-semibold text-yellow-400">
            Violation = immediate removal + forfeiture of unpaid earnings.
          </p>
        </section>

        {/* Section 5 */}
        <section aria-labelledby="section-5">
          <h2 id="section-5" className="text-2xl font-semibold mb-4 text-primary-400">5. Payments &amp; Compensation</h2>
          <ul className="list-disc list-inside space-y-2 text-gray-300">
            <li>Contractor is paid per completed task or weapon, as displayed at acceptance</li>
            <li>If an order is unassigned or reassigned, Contractor is paid <strong className="text-white">only for completed work</strong></li>
            <li>Company may withhold or revoke payment for violations, fraud, or quality failures</li>
            <li>Payments are processed through the Company&apos;s approved payment provider only</li>
          </ul>
        </section>

        {/* Section 6 */}
        <section aria-labelledby="section-6">
          <h2 id="section-6" className="text-2xl font-semibold mb-4 text-primary-400">6. Quality Standards &amp; Completion</h2>
          <p className="text-gray-300 mb-4">Contractor agrees to:</p>
          <ul className="list-disc list-inside space-y-2 text-gray-300 mb-4">
            <li>Complete work within reasonable timeframes</li>
            <li>Maintain customer account integrity</li>
            <li>Follow all platform-specific rules</li>
            <li>Perform services to a professional standard</li>
          </ul>
          <p className="text-gray-300">
            Failure to meet standards may result in reassignment, reduced priority access, or potential removal from platform.
          </p>
        </section>

        {/* Section 7 */}
        <section aria-labelledby="section-7">
          <h2 id="section-7" className="text-2xl font-semibold mb-4 text-primary-400">7. Confidentiality &amp; Non-Circumvention</h2>
          <p className="text-gray-300 mb-4">
            Contractor agrees to keep all platform data, customer information, pricing, and internal processes confidential.
          </p>
          <p className="text-gray-300">
            Contractors may not solicit, divert, or accept work from Company customers during or after their participation on the platform.
          </p>
        </section>

        {/* Section 8 */}
        <section aria-labelledby="section-8">
          <h2 id="section-8" className="text-2xl font-semibold mb-4 text-primary-400">8. Termination &amp; Removal</h2>
          <p className="text-gray-300 mb-4">
            Company may suspend or terminate Contractor access <strong className="text-white">at any time, with or without notice</strong>,
            for any violation or business reason.
          </p>
          <p className="text-gray-300">
            Contractor may stop accepting orders at any time but must complete or unassign active work.
          </p>
        </section>

        {/* Section 9 */}
        <section aria-labelledby="section-9">
          <h2 id="section-9" className="text-2xl font-semibold mb-4 text-primary-400">9. Limitation of Liability</h2>
          <p className="text-gray-300">
            The Company shall not be liable for any indirect, incidental, special, consequential, or punitive damages
            arising out of or related to this Agreement or the services provided hereunder.
          </p>
        </section>

        {/* Section 10 */}
        <section aria-labelledby="section-10">
          <h2 id="section-10" className="text-2xl font-semibold mb-4 text-primary-400">10. Indemnification</h2>
          <p className="text-gray-300">
            Contractor agrees to indemnify and hold harmless the Company from any claims, damages, or losses
            arising from Contractor&apos;s actions, misconduct, or violations.
          </p>
        </section>

        {/* Section 11 */}
        <section aria-labelledby="section-11">
          <h2 id="section-11" className="text-2xl font-semibold mb-4 text-primary-400">11. Governing Law</h2>
          <p className="text-gray-300">
            This Agreement shall be governed by the laws of Ohio, United States.
          </p>
        </section>

        {/* Section 12 */}
        <section aria-labelledby="section-12">
          <h2 id="section-12" className="text-2xl font-semibold mb-4 text-primary-400">12. Acceptance</h2>
          <p className="text-gray-300">
            By checking the acceptance box or accessing the platform, Contractor agrees to be legally bound by this Agreement.
          </p>
        </section>
      </div>

      {/* Agreement Checkbox - Only show for unsigned boosters */}
      {!loading && isBooster && !hasSigned && (
        <div className="mt-12 pt-8 border-t border-primary-700">
          {error && (
            <div className="mb-4 p-3 bg-red-900/30 border border-red-700 rounded text-red-400">
              {error}
            </div>
          )}

          <label className="flex items-start gap-3 cursor-pointer mb-6">
            <input
              type="checkbox"
              checked={agreed}
              onChange={(e) => setAgreed(e.target.checked)}
              className="mt-1 w-5 h-5 rounded border-gray-600 bg-gray-800 text-primary-500 focus:ring-primary-500"
            />
            <span className="text-gray-300">
              I acknowledge that I have read and understood this Independent Contractor Boosting Agreement,
              and I agree to be legally bound by all terms and conditions stated herein.
            </span>
          </label>

          <button
            onClick={handleSign}
            disabled={!agreed || signing}
            className="w-full sm:w-auto px-8 py-3 bg-primary-500 hover:bg-primary-600 disabled:bg-gray-700 disabled:cursor-not-allowed text-white font-semibold rounded-lg transition-colors"
          >
            {signing ? 'Submitting...' : 'I Agree'}
          </button>
        </div>
      )}

      {/* Footer */}
      <div className="mt-12 pt-8 border-t border-primary-700 text-gray-400 text-sm">
        <p>
          This agreement constitutes the entire agreement between you and Altura Boost regarding your work as a contractor on our platform.
        </p>
      </div>
    </main>
  );
}

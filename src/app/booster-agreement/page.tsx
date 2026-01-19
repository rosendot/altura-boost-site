import type { Metadata } from "next";
import BoosterAgreementClient from "./BoosterAgreementClient";

export const metadata: Metadata = {
  title: 'Independent Contractor Agreement',
  description: 'Independent Contractor Boosting Agreement for Altura Boost boosters. Review the terms and conditions for working as a booster on our platform.',
  alternates: {
    canonical: '/booster-agreement',
  },
  openGraph: {
    title: 'Independent Contractor Agreement - Altura Boost',
    description: 'Review the Independent Contractor Boosting Agreement for Altura Boost boosters.',
    url: '/booster-agreement',
  },
  twitter: {
    title: 'Independent Contractor Agreement - Altura Boost',
    description: 'Review the Independent Contractor Boosting Agreement for Altura Boost boosters.',
  },
};

export default function BoosterAgreementPage() {
  return <BoosterAgreementClient />;
}

import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Apply as a Booster',
  description: 'Join our network of professional gamers. Apply to become a booster and earn money playing games.',
  robots: { index: false, follow: false },
};

export default function BoosterSignupLayout({ children }: { children: React.ReactNode }) {
  return children;
}

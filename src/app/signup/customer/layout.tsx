import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Create Your Account',
  description: 'Sign up as a customer to browse and purchase professional game boosting services for Call of Duty and other popular games. Fast, secure, and reliable.',
  openGraph: {
    title: 'Create Your Account - Altura Boost',
    description: 'Sign up to access premium game boosting services.',
  },
  twitter: {
    title: 'Create Your Account - Altura Boost',
    description: 'Sign up to access premium game boosting services.',
  },
  robots: { index: true, follow: true },
};

export default function CustomerSignupLayout({ children }: { children: React.ReactNode }) {
  return children;
}

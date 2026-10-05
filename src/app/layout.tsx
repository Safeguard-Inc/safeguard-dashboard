import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Safeguard Pay | Policy-Guarded Payments on Soroban',
  description: 'Non-custodial, policy-guarded payment gateway and deterministic compliance engine on Stellar.',
  icons: {
    icon: '/favicon.ico',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className="antialiased selection:bg-indigo-500 selection:text-white">
        {children}
      </body>
    </html>
  );
}

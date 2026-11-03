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
    <html lang="en" className="dark" style={{ colorScheme: 'dark' }}>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              try {
                document.documentElement.classList.add('dark');
                document.documentElement.classList.remove('light');
                document.documentElement.style.colorScheme = 'dark';
              } catch (_) {}
            `,
          }}
        />
      </head>
      <body className="bg-slate-950 text-slate-100 antialiased selection:bg-indigo-500 selection:text-white min-h-screen">
        {children}
      </body>
    </html>
  );
}

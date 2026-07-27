import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Experience Engine | RM Studio',
  description: 'Smart Experience Page per Ristoranti e Attività Locali',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="it">
      <body className="bg-[#050508] text-gray-100 antialiased">
        {children}
      </body>
    </html>
  );
}

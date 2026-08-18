import type { Metadata } from 'next';
import Script from 'next/script';
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

        {/* 1. TRACCIAMENTO GOOGLE ANALYTICS */}
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-53780QW7VV"
          strategy="afterInteractive"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());

            gtag('config', 'G-53780QW7VV');
          `}
        </Script>

        {/* 2. BANNER COOKIE RM STUDIO */}
        <Script src="https://rmstudio.app/cookie-banner.js" strategy="afterInteractive" />
      </body>
    </html>
  );
}

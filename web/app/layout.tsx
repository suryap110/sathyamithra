import React from 'react';
import './globals.css';
import { Providers } from '@/components/providers';
import { Navbar } from '@/components/ui/navbar';
import { Footer } from '@/components/ui/footer';
import { EntryWrapper } from '@/components/entry-wrapper';
import { PageTransition } from '@/components/ui/page-transition';
import { AnimatedBackground } from '@/components/ui/animated-background';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Sathyamithra | Honest Guide to Every Benefit You Deserve',
  description: 'AI-powered multilingual government-scheme discovery, eligibility, document-readiness, and citizen-support platform.',
  icons: {
    icon: [
      { url: '/favicon-32.png', sizes: '32x32', type: 'image/png' },
      { url: '/logo-square.png', sizes: '512x512', type: 'image/png' },
      { url: '/logo.jpg' },
    ],
    apple: [
      { url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' },
    ],
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="h-full dark">
      <head>
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#10b981" />
        <link rel="icon" href="/favicon-32.png" sizes="32x32" type="image/png" />
        <link rel="icon" href="/logo-square.png" type="image/png" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <link rel="shortcut icon" href="/favicon.ico" />
      </head>
      <body className="min-h-screen flex flex-col text-slate-100 antialiased font-sans bg-[#03070d] selection:bg-emerald-500/30 selection:text-emerald-200">
        {/* Atmospheric cosmic auroras & vignette */}
        <div className="aurora-top pointer-events-none" />
        <div className="aurora-mid pointer-events-none" />
        <div className="aurora-accent pointer-events-none" />
        <div className="aurora-bottom pointer-events-none" />
        <div className="cosmic-vignette pointer-events-none" />
        {/* Canvas cosmic particle, starfield & chakra animation */}
        <AnimatedBackground />
        {/* Page content */}
        <div className="relative flex flex-col min-h-screen" style={{ zIndex: 1 }}>
          <Providers>
            <EntryWrapper>
              <Navbar />
              <PageTransition>
                <main className="flex-1">
                  {children}
                </main>
              </PageTransition>
              <Footer />
            </EntryWrapper>
          </Providers>
        </div>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              if ('serviceWorker' in navigator) {
                window.addEventListener('load', function() {
                  navigator.serviceWorker.register('/sw.js');
                });
              }
            `,
          }}
        />
      </body>
    </html>
  );
}


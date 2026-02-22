import type { Metadata } from 'next';
import { Cinzel, Lora } from 'next/font/google';
import { UserProvider } from '@/components/providers/UserProvider';
import { LanguageProvider } from '@/components/providers/LanguageProvider';
import { SnitchProvider } from '@/components/snitch/SnitchProvider';
import { MaintenanceProvider } from '@/components/maintenance/MaintenanceProvider';
import MagicalBackground from '@/components/layout/MagicalBackground';
import './globals.css';

const cinzel = Cinzel({
  variable: '--font-cinzel',
  subsets: ['latin'],
  display: 'swap',
  weight: ['400', '500', '600', '700', '800', '900'],
});

const lora = Lora({
  variable: '--font-lora',
  subsets: ['latin'],
  display: 'swap',
  weight: ['400', '500', '600', '700'],
});

export const metadata: Metadata = {
  title: 'Eva Potter - Harry Potter Quiz',
  description:
    'A magical Harry Potter quiz adventure! Test your knowledge of the Wizarding World, earn points, and unlock all seven books.',
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${cinzel.variable} ${lora.variable} antialiased bg-slate-900 text-amber-50 min-h-screen`}
      >
        <LanguageProvider>
          <UserProvider>
            <SnitchProvider>
              <MaintenanceProvider>
                <MagicalBackground>
                  {children}
                </MagicalBackground>
              </MaintenanceProvider>
            </SnitchProvider>
          </UserProvider>
        </LanguageProvider>
      </body>
    </html>
  );
}

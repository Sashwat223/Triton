import type { Metadata } from 'next';
import { Inter, JetBrains_Mono } from 'next/font/google';
import './globals.css';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });
const mono = JetBrains_Mono({ subsets: ['latin'], variable: '--font-mono' });

export const metadata: Metadata = {
  title: 'TRITON — Hear Beyond. | Flagship Wireless Earbuds',
  description: 'Experience TRITON flagship wireless earbuds. Cinematic scrollytelling, custom 11mm titanium acoustic drivers, 36-hour endurance, and precision-engineered acoustic craft.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${inter.variable} ${mono.variable} dark scroll-smooth`}>
      <body className="bg-[#050505] text-white selection:bg-[#00D6FF] selection:text-black antialiased overflow-x-hidden">
        {children}
      </body>
    </html>
  );
}

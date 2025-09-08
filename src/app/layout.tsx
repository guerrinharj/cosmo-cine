'use client';

import { useEffect } from 'react';
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import NavBar from '../components/NavBar';
import { usePathname } from 'next/navigation';

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

export default function RootLayout({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    document.title = '| COSMO CINE DO BRASIL | Produção Audiovisual';
  }, []);

  const pathname = usePathname();
  const hideNavBar = pathname.startsWith('/filmes/') && pathname !== '/filmes';

  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/logos/OUTLINE/sem_letras.png" />
      </head>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        {!hideNavBar && <NavBar key={pathname} />}
        {children}
      </body>
    </html>
  );
}

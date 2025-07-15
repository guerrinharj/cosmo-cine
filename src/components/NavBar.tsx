'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter, usePathname } from 'next/navigation';
import { messages } from '@/lib/i18n';

type Locale = 'pt' | 'en';

export default function NavBar() {
    const [locale, setLocale] = useState<Locale>('pt');
    const [authenticated, setAuthenticated] = useState(false);
    const [mounted, setMounted] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    const router = useRouter();
    const pathname = usePathname();

    useEffect(() => {
        const saved = localStorage.getItem('locale');
        if (saved === 'pt' || saved === 'en') {
            setLocale(saved);
        } else {
            setLocale('pt');
        }
        setMounted(true);

        fetch('/api/auth/me', { credentials: 'include' })
            .then(res => res.ok ? res.json() : Promise.resolve({ authenticated: false }))
            .then(data => setAuthenticated(data.authenticated));
    }, []);

    if (!mounted) return null;

    const t = messages[locale];

    const switchLocale = () => {
        const newLocale = locale === 'pt' ? 'en' : 'pt';
        localStorage.setItem('locale', newLocale);
        window.location.reload();
    };

    const handleLogout = async () => {
        await fetch('/api/auth/logout', {
            method: 'POST',
            credentials: 'include',
        });
        setAuthenticated(false);
        router.push('/login');
    };

    const linkClass = (href: string) =>
        `border-b-2 px-2 py-1 transition-all duration-300 ${
            pathname === href ? 'border-white' : 'border-transparent hover:border-white'
        }`;

    return (
        <nav className="fixed top-0 left-0 z-50 w-full bg-black border-b border-gray-700 p-4 flex items-center justify-between">
            {/* Left: Logo (always visible) */}
            <div className="z-50">
                <Link href="/" className="block mx-auto">
                    <Image
                        src="/logos/COM%20ICONE/Cosmo_H_negativo_Icone.png"
                        alt="Cosmo Cine"
                        width={200}
                        height={200}
                        className="transition-transform duration-300 hover:scale-x-[-1] hover:opacity-80"
                        priority
                    />
                </Link>
            </div>

            {/* Desktop Nav Links */}
            <div className="hidden md:flex gap-6 items-center text-white text-4xl uppercase thunder absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
                <Link href="/" className={linkClass('/')}>
                    {t.nav.films}
                </Link>
                <Link href="/contato" className={linkClass('/contato')}>
                    {t.nav.contact}
                </Link>
            </div>

            {/* Desktop Right Controls */}
            <div className="hidden md:flex items-center gap-4 text-white">
                <button onClick={switchLocale} className="hover:underline">
                    {locale === 'pt' ? 'EN' : 'PT'}
                </button>
                {authenticated && (
                    <button onClick={handleLogout} className="text-red-400 hover:underline">
                        {t.nav.logout}
                    </button>
                )}
            </div>

            {/* Mobile Hamburger Button */}
            <button
                className="md:hidden text-white text-3xl z-50"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
                ☰
            </button>

            {/* Mobile Modal Menu */}
            {isMobileMenuOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-95 flex flex-col items-center justify-center z-40 text-white text-4xl uppercase thunder space-y-10">
                    <Link href="/" onClick={() => setIsMobileMenuOpen(false)}>{t.nav.films}</Link>
                    <Link href="/contato" onClick={() => setIsMobileMenuOpen(false)}>{t.nav.contact}</Link>
                    <button onClick={switchLocale}>{locale === 'pt' ? 'EN' : 'PT'}</button>
                    {authenticated && (
                        <button onClick={handleLogout} className="text-red-400">
                            {t.nav.logout}
                        </button>
                    )}
                </div>
            )}
        </nav>
    );
}

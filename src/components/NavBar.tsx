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

    const router = useRouter();
    const pathname = usePathname();

    useEffect(() => {
        const saved = localStorage.getItem('locale');
        setLocale(saved === 'pt' || saved === 'en' ? saved : 'pt');
        setMounted(true);

        fetch('/api/auth/me', { credentials: 'include' })
            .then(res => res.ok ? res.json() : { authenticated: false })
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
        <>
            <nav className="fixed top-0 left-0 z-50 w-full h-20 bg-black flex items-center justify-between px-4">
                {/* Mobile Nav */}
                <div className="flex md:hidden items-center justify-between w-full text-white h-20 relative">
                    {/* Centered: FILMES - LOGO - CONTATO */}
                    <div className="absolute left-0 right-0 flex justify-center gap-6 text-2xl uppercase thunder items-center">
                        <Link href="/" className={linkClass('/')}>
                            {t.nav.films}
                        </Link>
                        <Link href="/" className="w-14 h-14 flex items-center justify-center">
                            <Image
                                src="/logos/COM%20ICONE/Cosmo_V_negativo_Icone.png"
                                alt="Cosmo Cine"
                                width={60}
                                height={60}
                                className="transition-transform duration-300 hover:scale-110"
                            />
                        </Link>
                        <Link href="/contato" className={linkClass('/contato')}>
                            {t.nav.contact}
                        </Link>
                    </div>

                    {/* Locale toggle */}
                    <div className="ml-auto text-sm uppercase tracking-wider z-10">
                        <button onClick={switchLocale} className="hover:underline">
                            {locale === 'pt' ? 'EN' : 'PT'}
                        </button>
                    </div>
                </div>

                {/* Desktop Nav Centered */}
                <div className="hidden md:flex gap-6 items-center text-white text-4xl uppercase thunder absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
                    <Link href="/" className={linkClass('/')}>
                        {t.nav.films}
                    </Link>
                    <Link href="/contato" className={linkClass('/contato')}>
                        {t.nav.contact}
                    </Link>
                </div>

                {/* Desktop Left Logo */}
                <div className="hidden md:block z-50">
                    <Link href="/" className="block">
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

                {/* Desktop Controls */}
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
            </nav>

            {/* Criar (+) Button for Authenticated Users */}
            {authenticated && (
                <Link
                    href="/criar"
                    className="fixed bottom-6 right-6 bg-white text-black text-3xl rounded-full w-12 h-12 flex items-center justify-center shadow-lg hover:bg-gray-300 transition z-40"
                >
                    +
                </Link>
            )}
        </>
    );
}

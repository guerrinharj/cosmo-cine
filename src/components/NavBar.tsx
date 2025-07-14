'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter, usePathname } from 'next/navigation';
import { messages } from '@/lib/i18n';

export default function NavBar() {
    const [locale, setLocale] = useState('pt');
    const [authenticated, setAuthenticated] = useState(false);
    const [mounted, setMounted] = useState(false);

    const router = useRouter();
    const pathname = usePathname();

    useEffect(() => {
        const savedLocale = localStorage.getItem('locale') || 'pt';
        setLocale(savedLocale);
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
        <nav className="fixed top-0 left-0 z-50 thunder text-4xl uppercase w-full p-4 border-b border-gray-700 flex items-center justify-center bg-black">
            <div className="absolute left-4 top-1/2 -translate-y-1/2">
                <Link href="/">
                    <Image
                        src="/logos/COM%20ICONE/Cosmo_H_negativo_Icone.png"
                        alt="Cosmo Cine"
                        width={80}
                        height={80}
                        className="transition-transform duration-300 hover:scale-x-[-1] hover:opacity-80"
                        priority
                    />
                </Link>
            </div>

            <div className="flex gap-6 items-center text-white">
                <Link href="/" className={linkClass('/')}>
                    {t.nav.films}
                </Link>
                <Link href="/contato" className={linkClass('/contato')}>
                    {t.nav.contact}
                </Link>
            </div>

            <div className="text-white absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-4">
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
    );
}

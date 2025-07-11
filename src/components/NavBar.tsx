'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { messages } from '@/lib/i18n';

export default function NavBar() {
    const [locale, setLocale] = useState('pt');
    const [authenticated, setAuthenticated] = useState(false);
    const router = useRouter();

    useEffect(() => {
        const savedLocale = localStorage.getItem('locale') || 'pt';
        setLocale(savedLocale);

        fetch('/api/auth/me', { credentials: 'include' })
            .then(res => res.ok ? res.json() : Promise.resolve({ authenticated: false }))
            .then(data => setAuthenticated(data.authenticated));
    }, []);

    const t = messages[locale];

    const switchLocale = () => {
        const newLocale = locale === 'pt' ? 'en' : 'pt';
        localStorage.setItem('locale', newLocale);
        window.location.reload(); // força recarregar toda a página
    };

    const handleLogout = async () => {
        await fetch('/api/auth/logout', {
            method: 'POST',
            credentials: 'include',
        });
        setAuthenticated(false);
        router.push('/login');
    };

    return (
        <nav className="w-full flex justify-between items-center p-4 border-b border-gray-700">
            <Link href="/">
                <img
                    src="/logos/COM%20ICONE/Cosmo_H_negativo_Icone.png"
                    alt="Cosmo Cine"
                    className="h-10"
                />
            </Link>
            <div className="flex gap-6 items-center">
                <Link href="/">{t.nav.films}</Link>
                <Link href="/contato">{t.nav.contact}</Link>

                <button onClick={switchLocale} className="underline">
                    {locale === 'pt' ? 'EN' : 'PT'}
                </button>

                {authenticated && (
                    <button
                        onClick={handleLogout}
                        className="text-red-400 hover:underline"
                    >
                        {t.nav.logout}
                    </button>
                )}
            </div>
        </nav>
    );
}

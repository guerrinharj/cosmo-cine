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
            .then(res => (res.ok ? res.json() : { authenticated: false }))
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
        await fetch('/api/auth/logout', { method: 'POST', credentials: 'include' });
        setAuthenticated(false);
        router.push('/login');
    };

    const linkClass = (href: string) =>
        `border-b-2 px-2 py-1 transition-all duration-300 ${
            pathname === href ? 'border-white' : 'border-transparent hover:border-white'
        }`;

    return (
        <>
            <nav className="sticky top-0 left-0 z-50 w-full h-20 bg-black/90 backdrop-blur-sm flex items-center px-4 relative border-b border-white">
                {/* Mobile center group */}
                <div className="flex md:hidden items-center justify-center w-full text-white h-20">
                    <div className="absolute left-0 right-0 flex justify-center gap-6 text-lg uppercase paralucent items-center">
                        <Link href="/filmes" className={linkClass('/filmes')}>
                            {t.nav.films}
                        </Link>
                        <Link href="/contato" className={linkClass('/contato')}>
                            {t.nav.contact}
                        </Link>
                    </div>
                </div>

                {/* Desktop centered links */}
                <div className="hidden md:flex gap-6 items-center text-white text-lg uppercase paralucent absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
                    <Link href="/filmes" className={linkClass('/filmes')}>
                        {t.nav.films}
                    </Link>
                    <Link href="/contato" className={linkClass('/contato')}>
                        {t.nav.contact}
                    </Link>
                </div>

                {/* Desktop left logo */}
                <div className="hidden md:block">
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

                {/* Locale toggle — absolute on the right */}
                <div className="absolute right-4 top-1/2 -translate-y-1/2 z-50">
                    <button
                        onClick={switchLocale}
                        className="text-white text-sm md:text-base uppercase tracking-wider hover:underline"
                    >
                        {locale === 'pt' ? 'EN' : 'PT'}
                    </button>
                </div>

                {/* Logout — absolute, left of locale */}
                {authenticated && (
                    <div className="absolute right-16 top-1/2 -translate-y-1/2 z-50 hidden md:block">
                        <button onClick={handleLogout} className="text-red-400 hover:underline">
                            {t.nav.logout}
                        </button>
                    </div>
                )}
            </nav>
        </>
    );
}

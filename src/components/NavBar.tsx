'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function NavBar() {
    const [authenticated, setAuthenticated] = useState(false);
    const router = useRouter();

    useEffect(() => {
        fetch('/api/auth/me', { credentials: 'include' })
            .then(res => res.ok ? res.json() : Promise.resolve({ authenticated: false }))
            .then(data => setAuthenticated(data.authenticated));
    }, []);

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
                <img src="/logos/COM%20ICONE/Cosmo_H_negativo_Icone.png" alt="Cosmo Cine" className="h-10" />
            </Link>
            <div className="flex gap-6 items-center">
                <Link href="/">Filmes</Link>
                <Link href="/contato">Contato</Link>
                {authenticated && (
                    <button
                        onClick={handleLogout}
                        className="text-red-400 hover:underline"
                    >
                        Logout
                    </button>
                )}
            </div>
        </nav>
    );
}

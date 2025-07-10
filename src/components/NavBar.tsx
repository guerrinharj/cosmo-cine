// app/components/NavBar.tsx
'use client';

import Link from 'next/link';

export default function NavBar() {
    return (
        <nav className="w-full flex justify-between items-center p-4 border-b border-gray-700">
            <Link href="/">
                <img src="/logos/COM%20ICONE/Cosmo_H_negativo_Icone.png" alt="Cosmo Cine" className="h-10" />
            </Link>
            <div className="flex gap-6">
                <Link href="/">Filmes</Link>
                <Link href="/contato">Contato</Link>
            </div>
        </nav>
    );
}
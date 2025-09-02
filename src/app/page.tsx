'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import './HomePage.css';

export default function HomePage() {
    const [ready, setReady] = useState(false);

    useEffect(() => {
        setReady(true);
    }, []);

    if (!ready) return null;

    return (
        <div
            className="fixed inset-0 bg-black flex items-center justify-center"
            style={{ height: '100vh', width: '100vw' }}
        >
            <Link href="/filmes" className="focus:outline-none fade-in">
                <Image
                    src="/logos/COM ICONE/Cosmo_V_negativo_Icone.png"
                    alt="Cosmo Cine Logo"
                    width={200}
                    height={200}
                    className="w-48 h-auto md:w-64"
                />
            </Link>
        </div>
    );
}

'use client';

import { useEffect, useState } from 'react';
import NavBar from '@/components/NavBar';
import Image from 'next/image';
import { messages } from '@/lib/i18n';

export default function NotFound() {
    const [locale, setLocale] = useState('pt');

    useEffect(() => {
        const savedLocale = localStorage.getItem('locale') || 'pt';
        setLocale(savedLocale);
    }, []);

    const t = messages[locale];

    return (
        <div className="bg-black text-white min-h-screen flex flex-col items-center">
            <NavBar />
            <div className="flex flex-col items-center justify-center flex-1 gap-6 mt-16">
                <Image
                    src="/logos/COM ICONE/Cosmo_V_negativo_Icone.png"
                    alt="Logo Cosmo Cine"
                    width={300}
                    height={300}
                    priority
                />
                <div className="text-center">
                    <h1 className="thunder text-5xl font-bold">404</h1>
                    <h3 className="paralucent text-lg mt-2 text-gray-300">
                        {t.notFound.notFound}
                    </h3>
                </div>
            </div>
        </div>
    );
}

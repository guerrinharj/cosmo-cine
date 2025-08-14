'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

export default function HomePage() {
    const router = useRouter();
    const [isMobile, setIsMobile] = useState<boolean | null>(null);

    useEffect(() => {
        const mobileCheck = window.innerWidth <= 768;
        setIsMobile(mobileCheck);

        if (!mobileCheck) {
            router.replace('/filmes');
        }
    }, [router]);

    const handleClick = () => {
        router.push('/filmes');
    };

    if (isMobile === false) return null; // Prevent flash on desktop redirect

    return (
        <div
            className="fixed inset-0 bg-black flex items-center justify-center"
            style={{ height: '100vh', width: '100vw' }}
        >
            <button onClick={handleClick} className="focus:outline-none">
                <Image
                    src="/logos/COM ICONE/Cosmo_V_negativo_Icone.png"
                    alt="Cosmo Cine Logo"
                    width={200}
                    height={200}
                    className="w-48 h-auto md:w-64"
                />
            </button>
        </div>
    );
}

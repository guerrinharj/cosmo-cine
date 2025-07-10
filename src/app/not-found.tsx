'use client';

import NavBar from '@/components/NavBar';
import Image from 'next/image';

export default function NotFound() {
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
                    <h1 className="text-5xl font-bold">404</h1>
                    <h3 className="text-lg mt-2 text-gray-300">Não há nada a ser visto aqui.</h3>
                </div>
            </div>
        </div>
    );
}

'use client';

import { useEffect, useState } from 'react';

type CategoriaFiltroProps = {
    categorias: string[];
    filtro: string | null;
    setFiltro: (categoria: string | null) => void;
    locale: 'pt' | 'en';
    messages: any;
};

export default function CategoriaFiltro({
    categorias,
    filtro,
    setFiltro,
    locale,
    messages
}: CategoriaFiltroProps) {
    const t = messages[locale];

    return (
        <div className="sticky top-16 bg-black z-40">
            <div className="text-center py-4">
                <div className="inline-flex gap-4 justify-center items-center">
                    {categorias.map((cat) => {
                        const key = cat.toLowerCase() as keyof typeof t.filmes;
                        const label = t.filmes[key];
                        return (
                            <button
                                key={cat}
                                onClick={() => setFiltro(filtro === cat ? null : cat)}
                                className={`paralucent text-base md:text-xl uppercase px-3 py-1 border-b-2 transition-all duration-300 ${
                                    filtro === cat
                                        ? 'border-white'
                                        : 'border-transparent hover:border-white'
                                }`}
                            >
                                {label}
                            </button>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}

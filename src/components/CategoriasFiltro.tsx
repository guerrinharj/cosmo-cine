'use client';

import { useEffect, useState } from 'react';

type CategoriaFiltroProps = {
    categorias: string[];
    filtro: string[]; // agora é um array
    setFiltro: (categoria: string[]) => void;
    isService: boolean | null;
    setIsService: (value: boolean | null) => void;
    locale: 'pt' | 'en';
    messages: any;
};

export default function CategoriaFiltro({
    categorias,
    filtro,
    setFiltro,
    isService,
    setIsService,
    locale,
    messages
}: CategoriaFiltroProps) {
    const t = messages[locale];

    const toggleCategoria = (cat: string) => {
        if (filtro.includes(cat)) {
            setFiltro(filtro.filter(c => c !== cat));
        } else {
            setFiltro([...filtro, cat]);
        }
    };

    return (
        <div className="sticky top-16 bg-black z-40 px-4 py-4">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                {/* Categoria buttons (left) */}
                <div className="flex flex-wrap gap-2 justify-center md:justify-start">
                    {categorias.map((cat) => {
                        const key = cat.toLowerCase() as keyof typeof t.filmes;
                        const label = t.filmes[key] || cat;

                        const isActive = filtro.includes(cat);

                        return (
                            <button
                                key={cat}
                                onClick={() => toggleCategoria(cat)}
                                className={`text-sm md:text-base px-3 py-1 rounded-full border transition-all duration-300 ${
                                    isActive
                                        ? 'bg-white text-black border-white'
                                        : 'bg-transparent text-white border-white hover:bg-white hover:text-black'
                                }`}
                            >
                                {label}
                            </button>
                        );
                    })}
                </div>

                {/* is_service buttons (right) */}
                <div className="flex gap-2 justify-center md:justify-end">
                    <button
                        onClick={() => setIsService(isService === true ? null : true)}
                        className={`text-sm md:text-base px-3 py-1 rounded-full border transition-all duration-300 ${
                            isService === true
                                ? 'bg-white text-black border-white'
                                : 'bg-transparent text-white border-white hover:bg-white hover:text-black'
                        }`}
                    >
                        {t.filmes.service}
                    </button>
                    <button
                        onClick={() => setIsService(isService === false ? null : false)}
                        className={`text-sm md:text-base px-3 py-1 rounded-full border transition-all duration-300 ${
                            isService === false
                                ? 'bg-white text-black border-white'
                                : 'bg-transparent text-white border-white hover:bg-white hover:text-black'
                        }`}
                    >
                        {t.filmes.not_service}
                    </button>
                </div>
            </div>
        </div>
    );
}

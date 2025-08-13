'use client';

import { useEffect, useState } from 'react';

type CategoriaFiltroProps = {
    categorias: string[];
    filtro: string[];
    setFiltro: (categoria: string[]) => void;
    isService: boolean[];
    setIsService: (value: boolean[]) => void;
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

    const toggleIsService = (value: boolean) => {
        if (isService.includes(value)) {
            setIsService(isService.filter(v => v !== value));
        } else {
            setIsService([...isService, value]);
        }
    };

    return (
        <div className="fixed bottom-0 left-0 w-full border-t border-white bg-black bg-opacity-90 z-50 px-4 py-3">
            <div className="flex flex-col md:flex-row justify-between items-center gap-3 w-full max-w-screen-xl mx-auto">
                
                {/* Categoria buttons */}
                <div className="flex flex-wrap gap-2 justify-center md:justify-start w-full md:w-auto">
                    {categorias.map((cat) => {
                        const key = cat.toLowerCase() as keyof typeof t.filmes;
                        const label = t.filmes[key] || cat;
                        const isActive = filtro.includes(cat);

                        return (
                            <button
                                key={cat}
                                onClick={() => toggleCategoria(cat)}
                                className={`paralucent flex items-center gap-1 text-xs md:text-sm px-3 py-1 rounded-full transition-all duration-300 ${
                                    isActive
                                        ? 'bg-white text-black border border-white'
                                        : 'bg-transparent text-white hover:bg-white hover:text-black'
                                }`}
                            >
                                <span className="paralucent text-sm md:text-lg">{label}</span>
                                {isActive && (
                                    <span className="font-bold text-lg leading-none">×</span>
                                )}
                            </button>
                        );
                    })}
                </div>

                {/* is_service buttons */}
                <div className="flex flex-wrap gap-2 justify-center md:justify-end w-full md:w-auto">
                    <button
                        onClick={() => toggleIsService(false)}
                        className={`flex items-center gap-1 text-xs md:text-sm px-3 py-1 rounded-full transition-all duration-300 ${
                            isService.includes(false)
                                ? 'bg-white text-black border border-white'
                                : 'bg-transparent text-white hover:bg-white hover:text-black'
                        }`}
                    >
                        <span className="paralucent text-sm md:text-lg">{t.filmes.not_service}</span>
                        {isService.includes(false) && (
                            <span className="font-bold text-lg leading-none">×</span>
                        )}
                    </button>

                    <button
                        onClick={() => toggleIsService(true)}
                        className={`flex items-center gap-1 text-xs md:text-sm px-3 py-1 rounded-full transition-all duration-300 ${
                            isService.includes(true)
                                ? 'bg-white text-black border border-white'
                                : 'bg-transparent text-white hover:bg-white hover:text-black'
                        }`}
                    >
                        <span className="paralucent text-sm md:text-lg">{t.filmes.service}</span>
                        {isService.includes(true) && (
                            <span className="font-bold text-lg leading-none">×</span>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
}

'use client';

import { useEffect, useState } from 'react';
import { messages } from '@/lib/i18n';

export default function HomePage() {
    const [filmes, setFilmes] = useState([]);
    const [filtro, setFiltro] = useState<string | null>(null);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [locale, setLocale] = useState('pt');


    const categorias = ['Publicidade', 'Clipe', 'Conteudo'];

    useEffect(() => {
        
        const savedLocale = localStorage.getItem('locale') || 'pt';
        setLocale(savedLocale);

        fetch('/api/filmes')
            .then((res) => res.json())
            .then((data) => setFilmes(data));

        fetch('/api/auth/me', { credentials: 'include' })
            .then(res => setIsAuthenticated(res.ok));
    }, []);

    const filmesFiltrados = filtro
        ? filmes.filter(f => f.categoria === filtro)
        : filmes;

    const t = messages[locale];

    return (
        <div className="pt-20 pb-10 bg-black text-white min-h-screen">

            {/* Criar Button */}
            {isAuthenticated && (
                <>
                    <div className="md:hidden flex justify-center mt-6">
                        <a
                            href="/filmes/create"
                            className="paralucent px-6 py-2 border border-white rounded"
                        >
                            Criar
                        </a>
                    </div>

                    <a
                        href="/filmes/create"
                        className="paralucent hidden md:flex fixed bottom-6 right-6 bg-white text-black text-2xl rounded-full w-12 h-12 items-center justify-center shadow-lg hover:bg-gray-300 transition z-40"
                        title="Criar novo filme"
                    >
                        +
                    </a>
                </>
            )}

            {/* Filtro de Categorias */}
            <div className="text-center mt-8">
                <div className="inline-flex gap-4 justify-center items-center">
                    {categorias.map((cat) => {
                        const key = cat.toLowerCase(); // publicidade, clipe, conteudo
                        const label = t.filmes[key];
                        return (
                            <button
                                key={cat}
                                onClick={() => setFiltro(filtro === cat ? null : cat)}
                                className={`paralucent text-xl uppercase px-3 py-1 border-b-2 transition-all duration-300 ${
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

            {/* Lista de Filmes */}
            <div
                className="grid gap-6 mt-10 px-4 fade-in"
                style={{
                    gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
                }}
            >
                {filmesFiltrados
                    .sort((a, b) => new Date(b.date) - new Date(a.date))
                    .map((filme) => (
                        <a
                            href={`/filmes/${filme.slug}`}
                            key={filme.id}
                            className="paralucent text-2xl flex flex-col cursor-pointer group"
                        >
                            <img
                                src={filme.thumbnail}
                                alt={filme.nome}
                                className="w-full aspect-video object-cover rounded-lg group-hover:opacity-80 transition"
                            />
                            <p className="mt-2 text-sm uppercase tracking-tight">
                                {filme.cliente} | <strong>{filme.nome}</strong>
                            </p>
                            <p className="text-xs text-gray-400">{filme.diretor}</p>
                            {filme.agencia && (
                                <p className="text-xs text-gray-500">{filme.agencia}</p>
                            )}
                        </a>
                    ))}
            </div>
        </div>
    );
}

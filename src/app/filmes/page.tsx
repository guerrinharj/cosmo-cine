'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { messages } from '@/lib/i18n';

type Filme = {
    id: string;
    slug: string;
    nome: string;
    cliente: string;
    diretor: string;
    agencia?: string;
    categoria: string;
    thumbnail: string;
    date: string;
};

export default function HomePage() {
    const [filmes, setFilmes] = useState<Filme[]>([]);
    const [filtro, setFiltro] = useState<string | null>(null);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [locale, setLocale] = useState<'pt' | 'en'>('pt');

    const categorias = ['Publicidade', 'Clipe', 'Conteudo'];

    useEffect(() => {
        const savedLocale = localStorage.getItem('locale') as 'pt' | 'en' | null;
        setLocale(savedLocale ?? 'pt');

        fetch('/api/filmes')
            .then((res) => res.json())
            .then((data: Filme[]) => setFilmes(data));

        fetch('/api/auth/me', { credentials: 'include' })
            .then(res => res.ok ? res.json() : { authenticated: false })
            .then(data => setIsAuthenticated(data.authenticated));
    }, []);

    const filmesFiltrados = filtro
        ? filmes.filter(f => f.categoria === filtro)
        : filmes;

    const t = messages[locale];

    if (!filmes) {
        return (
            <div className="fixed inset-0 flex items-center justify-center bg-black z-50">
                <Image
                    src="/logos/HORIZONTAL/Cosmo_H_negativo_assina01.png"
                    alt="Cosmo Cine Logo"
                    width={192}
                    height={96}
                    priority
                />
            </div>
        );
    }

    return (
        <div className="pt-20 pb-10 bg-black text-white min-h-screen">
            {/* Criar Button */}
            {isAuthenticated && (
                <>
                    <div className="md:hidden flex justify-center mt-6">
                        <Link
                            href="/filmes/create"
                            className="paralucent px-6 py-2 border border-white rounded"
                        >
                            Criar
                        </Link>
                    </div>

                    <Link
                        href="/filmes/create"
                        className="paralucent hidden md:flex fixed bottom-6 right-6 bg-white text-black text-2xl rounded-full w-12 h-12 items-center justify-center shadow-lg hover:bg-gray-300 transition z-40"
                        title="Criar novo filme"
                    >
                        +
                    </Link>
                </>
            )}

            {/* Filtro de Categorias */}
            <div className="text-center mt-8">
                <div className="inline-flex gap-4 justify-center items-center">
                    {categorias.map((cat) => {
                        const key = cat.toLowerCase() as keyof typeof t.filmes;
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
                    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                    .map((filme) => (
                        <Link
                            href={`/filmes/${filme.slug}`}
                            key={filme.id}
                            className="paralucent text-2xl flex flex-col cursor-pointer group"
                        >
                            <div className="w-full aspect-video relative rounded-lg overflow-hidden">
                                <Image
                                    src={filme.thumbnail}
                                    alt={filme.nome}
                                    fill
                                    className="object-cover group-hover:opacity-80 transition"
                                />
                            </div>
                            <p className="mt-2 text-sm uppercase tracking-tight">
                                {filme.cliente} | <strong>{filme.nome}</strong>
                            </p>
                            <p className="text-xs text-gray-400 hover:underline">{filme.diretor}</p>
                            {filme.agencia && (
                                <p className="text-xs text-gray-500">{filme.agencia}</p>
                            )}
                        </Link>
                    ))}
            </div>
        </div>
    );
}

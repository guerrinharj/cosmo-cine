'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function FilmeClientPage({ slug }: { slug: string }) {
    const router = useRouter();
    const [filme, setFilme] = useState<any>(null);
    const [filmes, setFilmes] = useState<any[]>([]);
    const [currentIndex, setCurrentIndex] = useState<number>(-1);
    const [isAuthenticated, setIsAuthenticated] = useState(false);

    // Verifica a sessão do usuário
    useEffect(() => {
        fetch('/api/auth/me', {
            method: 'GET',
            credentials: 'include', 
        })
        .then(res => res.ok ? res.json() : { authenticated: false })
        .then(data => setIsAuthenticated(data.authenticated));
    }, []);



    // Carrega o filme atual
    useEffect(() => {
        fetch(`/api/filmes/${slug}`)
            .then(res => res.json())
            .then(data => setFilme(data));
    }, [slug]);

    // Carrega todos os filmes
    useEffect(() => {
        fetch('/api/filmes')
            .then(res => res.json())
            .then(data => {
                const ordered = data
                    .filter((f: any) => f.showable)
                    .sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime());

                setFilmes(ordered);
                const index = ordered.findIndex((f: any) => f.slug === slug);
                setCurrentIndex(index);
            });
    }, [slug]);

    const handleDelete = async () => {
        if (!confirm('Tem certeza que deseja deletar este filme?')) return;

        const res = await fetch(`/api/filmes/${slug}`, { method: 'DELETE' });
        if (res.ok) router.push('/');
        else alert('Erro ao deletar');
    };

    const goToNext = () => {
        if (currentIndex > 0) router.push(`/filmes/${filmes[currentIndex - 1].slug}`);
    };

    const goToPrevious = () => {
        if (currentIndex < filmes.length - 1) router.push(`/filmes/${filmes[currentIndex + 1].slug}`);
    };

    if (!filme) {
    return (
        <div className="fixed inset-0 flex items-center justify-center bg-black z-50">
            <img
                src="/logos/HORIZONTAL/Cosmo_H_negativo_assina01.png"
                alt="Cosmo Cine Logo"
                className="w-48 h-auto"
            />
        </div>
    );
    }

    return (
        <div className="bg-black text-white min-h-screen px-6 pb-12 fade-in">
            {/* Control Bar */}
            <div className="fixed top-0 left-0 right-0 h-14 bg-black border-b border-gray-700 z-50 flex items-center justify-between px-4">
                <button
                    onClick={goToPrevious}
                    className="text-2xl transition-transform duration-300 hover:-translate-x-1"
                    >
                    &larr;
                </button>

                <button onClick={() => router.push('/')} className="text-sm">
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-6 w-6 transition-transform duration-500 hover:rotate-[360deg]"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={2}
                        >
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>

                <div className="flex items-center gap-4">
                    {isAuthenticated && (
                        <>
                            <Link href={`/filmes/${slug}/edit`} className="paralucent uppercase hover:underline">Editar</Link>
                            <button onClick={handleDelete} className="paralucent uppercase text-red-500 hover:underline">Deletar</button>
                        </>
                    )}

                    <button
                        onClick={goToNext}
                        className="text-2xl transition-transform duration-300 hover:translate-x-1"
                        >
                        &rarr;
                    </button>
                </div>
            </div>

            {/* Content */}
            <div className="pt-20 max-w-4xl mx-auto">
                <h1 className="paralucent text-4xl font-bold uppercase">{filme.cliente} | {filme.nome}</h1>
                <p className="thunder text-4xl mt-1 uppercase">{filme.diretor}</p>
                {filme.agencia && <p className="paralucent text-xl text-gray-400">{filme.agencia}</p>}

                {filme.video_url && (
                    <div className="w-full aspect-video mt-6">
                        <iframe
                            src={filme.video_url.replace('vimeo.com', 'player.vimeo.com/video')}
                            className="w-full h-full"
                            frameBorder="0"
                            allowFullScreen
                        ></iframe>
                    </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-10 text-sm">
                    {filme.creditos &&
                        Object.entries(filme.creditos).map(([key, value]) => (
                            <div key={key}>
                                <p className="thunder text-2xl uppercase font-bold">{key}</p>
                                <p className="paralucent text-xl">{value as string}</p>
                            </div>
                        ))}
                </div>
            </div>
        </div>
    );
}

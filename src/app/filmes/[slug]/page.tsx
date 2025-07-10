// app/filmes/[slug]/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';

export default function FilmePage() {
    const { slug } = useParams();
    const router = useRouter();
    const [filme, setFilme] = useState<any>(null);
    const [isAuthenticated, setIsAuthenticated] = useState(false); // Replace with real auth check

    useEffect(() => {
        fetch(`/api/filmes/${slug}`)
            .then(res => res.json())
            .then(data => setFilme(data));
    }, [slug]);

    const handleDelete = async () => {
        if (!confirm('Tem certeza que deseja deletar este filme?')) return;

        const res = await fetch(`/api/filmes/${slug}`, {
            method: 'DELETE',
        });

        if (res.ok) {
            router.push('/');
        } else {
            alert('Erro ao deletar');
        }
    };

    if (!filme) return <div className="text-white p-4">Carregando...</div>;

    return (
        <div className="bg-black text-white min-h-screen px-6 pb-12">
            {/* Control Bar */}
            <div className="fixed top-0 left-0 right-0 flex justify-between items-center p-4 bg-black z-50 border-b border-gray-700">
                <button onClick={() => router.back()}>&larr;</button>
                <div className="flex items-center gap-4">
                    {isAuthenticated && (
                        <>
                            <Link href={`/filmes/${slug}/edit`} className="underline">Editar</Link>
                            <button onClick={handleDelete} className="text-red-500">Deletar</button>
                        </>
                    )}
                    <button onClick={() => router.push('/')}>Fechar</button>
                </div>
            </div>

            <div className="pt-20 max-w-4xl mx-auto">
                {/* Title Block */}
                <h1 className="text-xl font-bold">{filme.cliente} | {filme.nome}</h1>
                <p className="text-sm mt-1">{filme.diretor}</p>
                {filme.agencia && <p className="text-sm text-gray-400">{filme.agencia}</p>}

                {/* Embedded Video */}
                {filme.video_url ? (
                    <div className="w-full aspect-video mt-6">
                        <iframe
                            src={filme.video_url.replace('vimeo.com', 'player.vimeo.com/video')}
                            className="w-full h-full"
                            frameBorder="0"
                            allowFullScreen
                        ></iframe>
                    </div>
                ) : null}


                {/* Credits */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-10 text-sm">
                    {filme.creditos &&
                        Object.entries(filme.creditos).map(([key, value]) => (
                            <div key={key}>
                                <p className="uppercase font-bold">{key}</p>
                                <p>{value as string}</p>
                            </div>
                        ))}
                </div>
            </div>
        </div>
    );
}

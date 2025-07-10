'use client';



import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function FilmeClientPage({
    slug,
    isAuthenticated,
}: {
    slug: string;
    isAuthenticated: true;
}) {
    const router = useRouter();
    const [filme, setFilme] = useState<any>(null);
    const [filmes, setFilmes] = useState<any[]>([]);
    const [currentIndex, setCurrentIndex] = useState<number>(-1);

    console.log("Autenticado?", isAuthenticated);


    useEffect(() => {
        fetch(`/api/filmes/${slug}`)
            .then(res => res.json())
            .then(data => setFilme(data));
    }, [slug]);

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

        if (res.ok) {
            router.push('/');
        } else {
            alert('Erro ao deletar');
        }
    };

    const goToNext = () => {
        if (currentIndex > 0) {
            router.push(`/filmes/${filmes[currentIndex - 1].slug}`);
        }
    };

    const goToPrevious = () => {
        if (currentIndex < filmes.length - 1) {
            router.push(`/filmes/${filmes[currentIndex + 1].slug}`);
        }
    };

    if (!filme) return <div className="text-white p-4">Carregando...</div>;

    return (
        <div className="bg-black text-white min-h-screen px-6 pb-12">
            {/* Control Bar */}
            <div className="fixed top-0 left-0 right-0 h-14 bg-black border-b border-gray-700 z-50 flex items-center justify-between px-4">
                <button onClick={goToPrevious} className="text-2xl">&larr;</button>

                <button onClick={() => router.push('/')} className="text-sm underline">
                    Fechar
                </button>

                <div className="flex items-center gap-4">
                    {isAuthenticated && (
                        <>
                            <Link href={`/filmes/${slug}/edit`} className="underline">Editar</Link>
                            <button onClick={handleDelete} className="text-red-500">Deletar</button>
                        </>
                    )}
                    <button onClick={goToNext} className="text-2xl">&rarr;</button>
                </div>
            </div>

            {/* Content */}
            <div className="pt-20 max-w-4xl mx-auto">
                <h1 className="text-xl font-bold">{filme.cliente} | {filme.nome}</h1>
                <p className="text-sm mt-1">{filme.diretor}</p>
                {filme.agencia && <p className="text-sm text-gray-400">{filme.agencia}</p>}

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
                                <p className="uppercase font-bold">{key}</p>
                                <p>{value as string}</p>
                            </div>
                        ))}
                </div>
            </div>
        </div>
    );
}

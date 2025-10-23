'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';

type Filme = {
    id: string;
    slug: string;
    nome: string;
    cliente?: string;
    diretor?: string;
    agencia?: string;
    produtoraContratante?: string;
    video_url?: string;
    date: string;
    thumbnail: string;
    creditos?: string;
    showable?: boolean;
    is_service?: boolean;
};

export default function FilmeClientPage({ slug }: { slug: string }) {
    const router = useRouter();
    const [filme, setFilme] = useState<Filme | null>(null);
    const [filmes, setFilmes] = useState<Filme[]>([]);
    const [currentIndex, setCurrentIndex] = useState<number>(-1);
    const [isAuthenticated, setIsAuthenticated] = useState(false);

    useEffect(() => {
        if (filme?.nome) {
            document.title = `${filme.nome} | Cosmo Cine`.toUpperCase();
        }
    }, [filme]);

    useEffect(() => {
        fetch('/api/auth/me', {
            method: 'GET',
            credentials: 'include',
        })
            .then(res => (res.ok ? res.json() : { authenticated: false }))
            .then(data => setIsAuthenticated(Boolean(data?.authenticated)));
    }, []);

    useEffect(() => {
        fetch(`/api/filmes/${slug}`)
            .then(res => res.json())
            .then((data: Filme) => setFilme(data));
    }, [slug]);

    useEffect(() => {
        fetch('/api/filmes')
            .then(res => res.json())
            .then((data: Filme[]) => {
                const ordered = data
                    .filter((f: Filme) => f.showable)
                    .sort(
                        (a, b) =>
                            new Date(b.date).getTime() -
                            new Date(a.date).getTime(),
                    );

                setFilmes(ordered);
                const index = ordered.findIndex(f => f.slug === slug);
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
        if (currentIndex > 0)
            router.push(`/filmes/${filmes[currentIndex - 1].slug}`);
    };

    const goToPrevious = () => {
        if (currentIndex < filmes.length - 1)
            router.push(`/filmes/${filmes[currentIndex + 1].slug}`);
    };

    if (!filme) {
        return (
            <div className="fixed inset-0 flex items-center justify-center bg-black z-50">
                <Image
                    src="/logos/COM%20ICONE/Cosmo_V_negativo_Icone.png"
                    alt="Cosmo Cine Logo"
                    width={192}
                    height={96}
                    priority
                />
            </div>
        );
    }

    const rawUrl = filme.video_url ?? '';
    const src = rawUrl.includes('player.vimeo.com')
        ? rawUrl
        : rawUrl.startsWith('https://vimeo.com/')
        ? rawUrl.replace('https://vimeo.com/', 'https://player.vimeo.com/video/')
        : rawUrl;

    const splitCredits = (credits: string) =>
        (credits ?? '')
            .split(/;\s*|,(?=\s*[A-Za-zÀ-ÿ&][A-Za-zÀ-ÿ\s&]*:)/)
            .map(s => s.trim())
            .filter(Boolean);

    const extractFromCredits = (
        credits: string | undefined,
        labelRegex: RegExp,
    ): string | null => {
        if (!credits) return null;
        for (const entry of splitCredits(credits)) {
            const idx = entry.indexOf(':');
            if (idx < 0) continue;
            const label = entry.slice(0, idx).trim();
            const value = entry.slice(idx + 1).trim();
            if (labelRegex.test(label)) return value || null;
        }
        return null;
    };

    const metaRows: Array<{ label: string; value: string }> = [];
    metaRows.push({ label: 'Title', value: filme.nome });

    if (filme.diretor)
        metaRows.push({ label: 'Director', value: filme.diretor });
    if (filme.cliente)
        metaRows.push({ label: 'Client', value: filme.cliente });

    // Label dinâmico: Production Company se is_service, senão Co-Production
    const contratanteLabel = filme.is_service
        ? 'Production Company'
        : 'Co-Production';

    const hiringProductionCompany =
        filme.produtoraContratante ||
        extractFromCredits(
            filme.creditos,
            /^(hiring production company|produtora contratante|produção contratante|prod\.?\s*contratante)$/i,
        ) ||
        null;

    if (hiringProductionCompany) {
        metaRows.push({
            label: contratanteLabel,
            value: hiringProductionCompany,
        });
    }

    // Production company padrão
    const productionCompany = extractFromCredits(
        filme.creditos,
        /^(production company|produtora|produtor(a)?|prod\.)$/i,
    );
    if (productionCompany)
        metaRows.push({ label: 'Production Company', value: productionCompany });

    // Agency
    const agencyValue =
        filme.agencia ||
        extractFromCredits(
            filme.creditos,
            /^(agency|agência|agencia|agêncy)$/i,
        ) ||
        null;
    if (agencyValue)
        metaRows.push({ label: 'Agency', value: agencyValue });

    return (
        <div className="bg-black text-white min-h-screen px-6 pb-12 fade-in">
            <div className="fixed top-0 left-0 right-0 h-14 bg-black border-b border-white z-50 flex items-center justify-between px-4">
                <button
                    onClick={goToNext}
                    className="text-2xl transition-transform duration-300 hover:-translate-x-1"
                    aria-label="Anterior"
                >
                    &larr;
                </button>

                <button
                    onClick={() => router.push('/filmes')}
                    className="text-sm"
                    aria-label="Fechar"
                >
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-6 w-6 transition-transform duration-500 hover:rotate-[360deg]"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={2}
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M6 18L18 6M6 6l12 12"
                        />
                    </svg>
                </button>

                <div className="flex items-center gap-4">
                    {isAuthenticated && (
                        <>
                            <Link
                                href={`/filmes/${slug}/edit`}
                                className="paralucent uppercase hover:underline"
                            >
                                Editar
                            </Link>
                            <button
                                onClick={handleDelete}
                                className="paralucent uppercase text-red-500 hover:underline"
                            >
                                Deletar
                            </button>
                        </>
                    )}
                    <button
                        onClick={goToPrevious}
                        className="text-2xl transition-transform duration-300 hover:translate-x-1"
                        aria-label="Próximo"
                    >
                        &rarr;
                    </button>
                </div>
            </div>

            <div className="pt-20 max-w-4xl mx-auto">
                <div
                    className="relative w-full mt-6"
                    style={{ paddingTop: '56.25%' }}
                >
                    {src ? (
                        <iframe
                            src={src}
                            className="absolute inset-0 w-full h-full"
                            allow="autoplay; fullscreen; picture-in-picture"
                            allowFullScreen
                            loading="lazy"
                            frameBorder={0}
                            title={filme.nome}
                        />
                    ) : (
                        <Image
                            src={filme.thumbnail}
                            alt={filme.nome}
                            fill
                            className="object-cover"
                            sizes="100vw"
                            priority
                        />
                    )}
                </div>

                <div className="mt-6 space-y-1">
                    {metaRows.map(row => (
                        <div key={row.label} className="leading-tight">
                            <span className="paralucent uppercase tracking-wide text-gray-400 text-xs mr-2">
                                {row.label}:
                            </span>
                            <span className="paralucent text-base md:text-lg">
                                {row.value}
                            </span>
                        </div>
                    ))}
                </div>

                {filme.creditos && (
                    <div className="paralucent mt-10 grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-4 text-sm">
                        {splitCredits(filme.creditos).map((entry, idx) => {
                            const colonIdx = entry.indexOf(':');
                            const label =
                                colonIdx >= 0 ? entry.slice(0, colonIdx).trim() : '';
                            const value =
                                colonIdx >= 0
                                    ? entry.slice(colonIdx + 1).trim()
                                    : entry.trim();

                            return (
                                <div key={idx} className="flex flex-col">
                                    {label && (
                                        <span className="font-bold text-gray-400">
                                            {label}:
                                        </span>
                                    )}
                                    {value && <span className="block">{value}</span>}
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}

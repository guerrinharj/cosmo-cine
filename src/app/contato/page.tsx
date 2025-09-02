'use client';

import { useEffect, useState } from 'react';

type Contato = {
    id: string;
    nome: string;
    funcao?: string;
    email: string;
};

export default function ContatoPage() {
    const [contatos, setContatos] = useState<Contato[]>([]);
    const [loadingContatos, setLoadingContatos] = useState<boolean>(true);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const [nome, setNome] = useState('');
    const [funcao, setFuncao] = useState('');
    const [email, setEmail] = useState('');

    useEffect(() => {
        document.title = '| COSMO CINE DO BRASIL |';
    }, []);

    useEffect(() => {
        fetchContatos();
        checkAuth();
    }, []);

    const fetchContatos = () => {
        setLoadingContatos(true);
        fetch('/api/contatos')
            .then(res => res.json())
            .then(data => setContatos(data))
            .catch(() => setContatos([]))
            .finally(() => setLoadingContatos(false));
    };

    const checkAuth = async () => {
        const res = await fetch('/api/auth/me', { credentials: 'include' });
        if (!res.ok) {
            setIsAuthenticated(false);
            return;
        }
        const data = await res.json();
        setIsAuthenticated(data.authenticated === true);
    };

    const createContato = async () => {
        const res = await fetch('/api/contatos', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ nome, funcao, email }),
        });

        if (res.ok) {
            setShowModal(false);
            setNome('');
            setFuncao('');
            setEmail('');
            fetchContatos();
        } else {
            alert('Erro ao criar contato.');
        }
    };

    const deleteContato = async (id: string) => {
        if (!confirm('Tem certeza que deseja deletar este contato?')) return;

        const res = await fetch(`/api/contatos/${id}`, { method: 'DELETE' });
        if (res.ok) {
            fetchContatos();
        } else {
            alert('Erro ao deletar contato.');
        }
    };

    return (
        <div className="bg-black text-white min-h-screen">
            <div className="max-w-5xl mx-auto px-6 py-8">
                {isAuthenticated && (
                    <>
                        {/* Mobile: centered button */}
                        <div className="flex justify-center mb-6 md:hidden">
                            <button
                                onClick={() => setShowModal(true)}
                                className="px-6 py-2 border border-white rounded"
                            >
                                Criar
                            </button>
                        </div>

                        {/* Desktop: floating icon button */}
                        <button
                            onClick={() => setShowModal(true)}
                            className="hidden md:flex fixed bottom-6 right-6 bg-white text-black text-2xl rounded-full w-12 h-12 items-center justify-center shadow-lg hover:bg-gray-300 transition z-40"
                            title="Criar novo contato"
                        >
                            +
                        </button>
                    </>
                )}

                {/* Contacts Grid (skeleton while loading) */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
                    {loadingContatos
                        ? Array.from({ length: 4 }).map((_, i) => (
                            <div key={`sk-${i}`} className="animate-pulse">
                                <div className="h-4 w-24 bg-white/10 rounded mb-3" />
                                <div className="h-7 w-3/4 bg-white/10 rounded mb-2" />
                                <div className="h-4 w-1/2 bg-white/10 rounded" />
                            </div>
                        ))
                        : contatos.map(contato => (
                            <div key={contato.id} className="relative py-4 fade-in">
                                {isAuthenticated && (
                                    <button
                                        className="absolute top-2 right-2 text-red-400 hover:text-red-600"
                                        onClick={() => deleteContato(contato.id)}
                                        title="Deletar contato"
                                    >
                                        ✕
                                    </button>
                                )}
                                {contato.funcao && (
                                    <p className="paralucent text-1xl text-gray-400 mb-1 uppercase">
                                        {contato.funcao}
                                    </p>
                                )}
                                <p className="paralucent text-4xl text-xl font-bol hover:underline">
                                    {contato.nome}
                                </p>
                                <button
                                    onClick={() => (window.location.href = `mailto:${contato.email}`)}
                                    className="paralucent fade-in text-sm lowercase transition text-white hover:underline text-left"
                                >
                                    {contato.email}
                                </button>
                            </div>
                        ))}
                </div>

                {/* Static Info Section — only after ALL contatos are loaded */}
                {!loadingContatos && (
                    <div className="paralucent leading-relaxed border-t text-gray-100 text-xl md:text-3xl border-gray-800">
                        {/* E-mail + ícone de envelope */}
                        <div className="mt-4">
                            <span className="group inline-flex items-center gap-2">
                                <a
                                    href="mailto:contato@cosmocine.com"
                                    className="
                                        inline-block relative
                                        hover:[text-decoration-line:underline]
                                        underline-offset-4 decoration-white/70
                                        after:absolute after:left-0 after:-bottom-[2px] after:h-px after:w-0 after:bg-current after:transition-all
                                        hover:after:w-full
                                    "
                                >
                                    contato@cosmocine.com
                                </a>
                            </span>
                        </div>

                        {/* Telefone + WhatsApp logo */}
                        <div className="mt-1">
                            <span className="group inline-flex items-center gap-2">
                                <a
                                    href="https://api.whatsapp.com/send?phone=5521991008837"
                                    className="
                                        inline-block relative
                                        hover:[text-decoration-line:underline]
                                        underline-offset-4 decoration-white/70
                                        after:absolute after:left-0 after:-bottom-[2px] after:h-px after:w-0 after:bg-current after:transition-all
                                        hover:after:w-full
                                    "
                                >
                                    +55 21 99100-8837
                                </a>
                            </span>
                        </div>

                        <div className="text-base md:text-xl mt-2">
                            R. Marituba, 308 - Rio de Janeiro, Brasil
                        </div>

                        <div className="mt-2">
                            <span>
                                <a
                                    href="https://www.instagram.com/cosmocine/"
                                    className="inline-block relative hover:opacity-75"
                                >
                                    <img
                                        width="32"
                                        height="32"
                                        src="https://img.icons8.com/glyph-neue/64/FFFFFF/instagram-new--v1.png"
                                        alt="instagram-new--v1"
                                    />
                                </a>
                                <a
                                    href="https://www.facebook.com/cosmocine/"
                                    className="inline-block relative hover:opacity-75"
                                >
                                    <img
                                        width="32"
                                        height="32"
                                        src="https://img.icons8.com/ios-filled/50/FFFFFF/facebook--v1.png"
                                        alt="facebook--v1"
                                    />
                                </a>
                            </span>
                        </div>
                    </div>
                )}
            </div>

            {showModal && (
                <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50">
                    <div className="bg-white text-black rounded-lg p-6 w-full max-w-md">
                        <h2 className="text-xl font-bold mb-4">Novo Contato</h2>

                        <input
                            type="text"
                            placeholder="Nome"
                            value={nome}
                            onChange={(e) => setNome(e.target.value)}
                            className="w-full mb-3 px-3 py-2 border border-gray-300 rounded"
                        />
                        <input
                            type="text"
                            placeholder="Função"
                            value={funcao}
                            onChange={(e) => setFuncao(e.target.value)}
                            className="w-full mb-3 px-3 py-2 border border-gray-300 rounded"
                        />
                        <input
                            type="email"
                            placeholder="E-mail"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full mb-4 px-3 py-2 border border-gray-300 rounded"
                        />

                        <div className="flex justify-end gap-4">
                            <button
                                onClick={() => setShowModal(false)}
                                className="px-4 py-2 text-gray-700 hover:underline"
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={createContato}
                                className="px-4 py-2 bg-black text-white rounded border border-black hover:bg-gray-800"
                            >
                                Criar
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

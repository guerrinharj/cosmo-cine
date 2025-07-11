'use client';

import { useEffect, useState } from 'react';
import NavBar from '../../components/NavBar';

type Contato = {
    id: string;
    nome: string;
    funcao?: string;
    email: string;
};

export default function ContatoPage() {
    const [contatos, setContatos] = useState<Contato[]>([]);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const [nome, setNome] = useState('');
    const [funcao, setFuncao] = useState('');
    const [email, setEmail] = useState('');

    useEffect(() => {
        fetchContatos();
        checkAuth();
    }, []);

    const fetchContatos = () => {
        fetch('/api/contatos')
            .then(res => res.json())
            .then(data => setContatos(data));
    };

    const checkAuth = async () => {
        const res = await fetch('/api/auth/me', {
            credentials: 'include'
        });
        setIsAuthenticated(res.ok);
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

        const res = await fetch(`/api/contatos/${id}`, {
            method: 'DELETE',
        });

        if (res.ok) {
            fetchContatos();
        } else {
            alert('Erro ao deletar contato.');
        }
    };

    return (
        <div className="pt-20 bg-black text-white min-h-screen">
            <NavBar />

            <div className="max-w-5xl mx-auto px-6 py-8">
                {isAuthenticated && (
                    <>
                        {/* Mobile version (centered button) */}
                        <div className="flex justify-center mb-6 md:hidden">
                            <button
                                onClick={() => setShowModal(true)}
                                className="px-6 py-2 border border-white rounded"
                            >
                                Criar
                            </button>
                        </div>

                        {/* Desktop version (floating icon button) */}
                        <button
                            onClick={() => setShowModal(true)}
                            className="hidden md:flex fixed bottom-6 right-6 bg-white text-black text-2xl rounded-full w-12 h-12 items-center justify-center shadow-lg hover:bg-gray-300 transition z-40"
                            title="Criar novo contato"
                        >
                            +
                        </button>
                    </>
                )}


                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {contatos.map((contato) => (
                        <div key={contato.id} className="relative p-4">
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
                                <p className="paralucent text-1xl text-gray-400 mb-1 uppercase">{contato.funcao}</p>
                            )}
                            <p className="paralucent text-4xl text-xl font-bold">{contato.nome}</p>
                            <p className="paralucent text-2xl text-sm text-gray-300 mt-1 lowercase">{contato.email}</p>
                        </div>
                    ))}
                </div>
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

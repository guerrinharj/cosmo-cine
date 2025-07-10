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

    useEffect(() => {
        fetch('/api/contatos')
            .then(res => res.json())
            .then(data => setContatos(data));
    }, []);

    return (
        <div className="bg-black text-white min-h-screen">
            <NavBar />

            <div className="max-w-5xl mx-auto px-6 py-10 grid grid-cols-1 md:grid-cols-2 gap-8">
                {contatos.map((contato) => (
                    <div key={contato.id} className="p-4">
                        {contato.funcao && (
                            <p className="text-sm text-gray-400 mb-1 uppercase">{contato.funcao}</p>
                        )}
                        <p className="text-xl font-bold">{contato.nome}</p>
                        <p className="text-sm text-gray-300 mt-1">{contato.email}</p>
                    </div>
                ))}
            </div>
        </div>
    );
}

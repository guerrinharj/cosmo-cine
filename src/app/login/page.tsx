'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const router = useRouter();

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();

        const res = await fetch('/api/auth/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ username, password }),
            credentials: 'include', // ESSENCIAL: inclui o cookie de sessão
        });

        if (res.ok) {
            // Redireciona após login
            router.push('/');
        } else {
            const data = await res.json();
            setError(data.error || 'Erro ao fazer login');
        }
    };

    return (
        <div className="min-h-screen bg-black text-white flex items-center justify-center">
            <form onSubmit={handleLogin} className="bg-gray-900 p-6 rounded shadow w-80">
                <h1 className="text-xl font-bold mb-4">Login</h1>

                {error && <p className="text-red-500 mb-3">{error}</p>}

                <label className="block mb-2">
                    Usuário:
                    <input
                        type="text"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        className="w-full mt-1 p-2 rounded bg-gray-800 text-white"
                    />
                </label>

                <label className="block mb-4">
                    Senha:
                    <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full mt-1 p-2 rounded bg-gray-800 text-white"
                    />
                </label>

                <button type="submit" className="bg-white text-black px-4 py-2 rounded hover:bg-gray-200">
                    Entrar
                </button>
            </form>
        </div>
    );
}

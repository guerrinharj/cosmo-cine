'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
    const router = useRouter();
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    const handleLogin = async () => {
        const res = await fetch('/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify({ username, password }),
        });

        if (res.ok) {
            router.push('/');
        } else {
            const data = await res.json();
            setError(data.error || 'Erro no login');
        }
    };

    return (
        <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center px-4">
            {/* Logo Section */}
            <div className="mb-8">
                <img
                    src="/logos/COM ICONE/Cosmo_V_negativo_Icone.png"
                    alt="Cosmo Cine Logo"
                    className="h-20 w-auto"
                />
            </div>

            {/* Login Form */}
            <div className="bg-black-900 border p-6 rounded-lg shadow-lg w-full max-w-sm">
                <h1 className="paralucent text-2xl uppercase font-bold mb-4 text-center">Login</h1>
                {error && <p className="text-red-500 mb-2 text-sm">{error}</p>}
                <input
                    type="text"
                    placeholder="Username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="paralucent w-full mb-3 px-4 py-2 bg-black-800 border border-gray-600 rounded text-white"
                />
                <input
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="paralucent w-full mb-3 px-4 py-2 bg-black-800 border border-gray-600 rounded text-white"
                />
                <button
                    onClick={handleLogin}
                    className="paralucent w-full bg-black text-white py-2 rounded hover:bg-gray-200  transition"
                >
                    Entrar
                </button>
            </div>
        </div>
    );
}

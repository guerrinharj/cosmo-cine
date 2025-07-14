import { supabase } from '@/lib/supabaseClient';
import bcrypt from 'bcrypt';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
    const { username, password } = await req.json();

    // Busca o usuário na tabela User do Supabase
    const { data: user, error } = await supabase
        .from('User')
        .select('*')
        .eq('username', username)
        .maybeSingle();

    if (error || !user) {
        return NextResponse.json({ error: 'Usuário não encontrado' }, { status: 404 });
    }

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) {
        return NextResponse.json({ error: 'Senha incorreta' }, { status: 401 });
    }

    const oneHour = 60 * 60;

    const response = NextResponse.json({ message: 'Login bem-sucedido', username });

    response.cookies.set('session', username, {
        maxAge: oneHour,
        httpOnly: true,
        sameSite: 'lax',
        secure: process.env.NODE_ENV === 'production',
        path: '/',
    });

    response.cookies.set('auth', 'true', {
        maxAge: oneHour,
        httpOnly: false,
        sameSite: 'lax',
        secure: process.env.NODE_ENV === 'production',
    });

    return response;
}

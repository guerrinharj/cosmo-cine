import { prisma } from '@/lib/prisma';
import bcrypt from 'bcrypt';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
    const { username, password } = await req.json();

    const user = await prisma.user.findUnique({ where: { username } });

    if (!user) {
        return NextResponse.json({ error: 'Usuário não encontrado' }, { status: 404 });
    }

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) {
        return NextResponse.json({ error: 'Senha incorreta' }, { status: 401 });
    }

    const response = NextResponse.json({ message: 'Login bem-sucedido', username });

    // Cookie de sessão por 1 hora
    const oneHour = 60 * 60;
    cookies().set('session', username, {
        maxAge: oneHour,
        httpOnly: true,
        sameSite: 'lax',
        secure: process.env.NODE_ENV === 'production'
    });

    return response;
}

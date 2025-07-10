import { prisma } from '@/lib/prisma';
import bcrypt from 'bcrypt';
import { NextResponse } from 'next/server';
import { checkApiKey } from '@/lib/checkApiKey';

export async function POST(req: Request) {
    if (!checkApiKey(req)) {
        return NextResponse.json({ error: 'Acesso não autorizado' }, { status: 401 });
    }

    const { username, password } = await req.json();

    if (!username || !password) {
        return NextResponse.json({ error: 'Usuário e senha são obrigatórios' }, { status: 400 });
    }

    const existing = await prisma.user.findUnique({ where: { username } });
    if (existing) {
        return NextResponse.json({ error: 'Usuário já existe' }, { status: 400 });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
        data: {
            username,
            password: hashedPassword,
        },
    });

    return NextResponse.json({
        message: 'Usuário registrado com sucesso',
        user: {
            id: user.id,
            username: user.username,
            createdAt: user.createdAt,
        }
    }, { status: 201 });
}

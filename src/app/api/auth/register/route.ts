import { prisma } from '@/lib/prisma';
import bcrypt from 'bcrypt';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
    const { username, password } = await req.json();

    // Validação básica
    if (!username || !password) {
        return NextResponse.json({ error: 'Usuário e senha são obrigatórios' }, { status: 400 });
    }

    // Verifica se o usuário já existe
    const existing = await prisma.user.findUnique({ where: { username } });
    if (existing) {
        return NextResponse.json({ error: 'Usuário já existe' }, { status: 400 });
    }

    // Hash da senha
    const hashedPassword = await bcrypt.hash(password, 10);

    // Criação do usuário no banco
    const user = await prisma.user.create({
        data: {
            username,
            password: hashedPassword,
        },
    });

    // Retorna apenas dados seguros
    return NextResponse.json({
        message: 'Usuário registrado com sucesso',
        user: {
            id: user.id,
            username: user.username,
            createdAt: user.createdAt,
        }
    }, { status: 201 });
}

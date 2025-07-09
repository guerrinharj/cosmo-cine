import { cookies } from 'next/headers';
import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

export async function DELETE() {
    const username = cookies().get('session')?.value;

    if (!username) {
        return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });
    }

    await prisma.user.delete({
        where: { username }
    });

    cookies().delete('session');

    return NextResponse.json({ message: 'Usuário deletado com sucesso' });
}

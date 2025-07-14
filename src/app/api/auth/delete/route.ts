import { prisma } from '@/lib/prisma';
import { checkApiKey } from '@/lib/checkApiKey';
import { NextResponse } from 'next/server';

export async function DELETE(req: Request) {
    let isAuthorized = false;

    try {
        isAuthorized = checkApiKey(req);
    } catch {
        isAuthorized = false;
    }

    if (!isAuthorized) {
        return NextResponse.json({ error: 'Acesso não autorizado' }, { status: 401 });
    }

    let username: string | undefined;

    try {
        const body = await req.json();
        username = body.username;
    } catch {
        return NextResponse.json({ error: 'Corpo da requisição inválido' }, { status: 400 });
    }

    if (!username) {
        return NextResponse.json({ error: 'Usuário não informado' }, { status: 400 });
    }

    try {
        await prisma.user.delete({ where: { username } });
        return NextResponse.json({ message: `Usuário '${username}' deletado com sucesso` });
    } catch (error) {
        console.error('Erro ao deletar usuário:', error);
        return NextResponse.json({ error: `Erro ao deletar o usuário: ${username}` }, { status: 500 });
    }
}

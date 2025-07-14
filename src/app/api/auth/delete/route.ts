import { prisma } from '@/lib/prisma';
import { checkApiKey } from '@/lib/checkApiKey';
import { NextResponse } from 'next/server';

export async function DELETE(req: Request) {
    console.log('[DELETE] /api/auth/delete chamado');

    const isAuthorized = checkApiKey(req);
    console.log('[DELETE] Autorização:', isAuthorized);

    if (!isAuthorized) {
        return NextResponse.json({ error: 'Acesso não autorizado' }, { status: 401 });
    }

    let username: string;

    try {
        const body = await req.json();
        console.log('[DELETE] Body recebido:', body);
        username = body.username;
    } catch (err) {
        console.error('[DELETE] Erro ao fazer parse do body:', err);
        return NextResponse.json({ error: 'Corpo da requisição inválido ou ausente' }, { status: 400 });
    }

    if (!username) {
        console.warn('[DELETE] Username ausente no body');
        return NextResponse.json({ error: 'Usuário não informado' }, { status: 400 });
    }

    try {
        const deletedUser = await prisma.user.delete({ where: { username } });
        console.log('[DELETE] Usuário deletado:', deletedUser);
        return NextResponse.json({ message: `Usuário '${username}' deletado com sucesso` });
    } catch (error) {
        console.error('[DELETE] Erro ao deletar o usuário:', error);
        return NextResponse.json({ error: `Erro ao deletar o usuário: ${username}` }, { status: 500 });
    }
}

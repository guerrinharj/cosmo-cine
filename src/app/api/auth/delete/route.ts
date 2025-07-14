import { prisma } from '@/lib/prisma';
import { checkApiKey } from '@/lib/checkApiKey';
import { NextResponse } from 'next/server';

export async function DELETE(req: Request) {
    if (!checkApiKey(req)) {
        return NextResponse.json({ error: 'Acesso não autorizado' }, { status: 401 });
    }

    const { username } = await req.json();

    if (!username) {
        return NextResponse.json({ error: 'Usuário não informado' }, { status: 400 });
    }

    try {
        await prisma.user.delete({ where: { username } });
        return NextResponse.json({ message: `Usuário '${username}' deletado com sucesso` });
    } catch (error) {
        console.error('Erro:', error);
        return NextResponse.json({ error: `Erro ao deletar o usuário: ${username}` }, { status: 500 });
    }
}

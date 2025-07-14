import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

export async function DELETE(_: Request, { params }: { params: { id: string } }) {
    try {
        await prisma.contato.delete({ where: { id: params.id } });
        return NextResponse.json({ message: 'Contato deletado com sucesso' });
    } catch (_error) {
        return NextResponse.json({ error: 'Contato não encontrado' }, { status: 404 });
    }
}

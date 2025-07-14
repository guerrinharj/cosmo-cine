import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function DELETE(req: NextRequest) {
    try {
        const id = req.nextUrl.pathname.split('/').pop(); // get ID from URL

        if (!id) {
            return NextResponse.json({ error: 'ID não fornecido' }, { status: 400 });
        }

        await prisma.contato.delete({
            where: { id },
        });

        return NextResponse.json({ message: `Contato ${id} deletado com sucesso` });
    } catch (error) {
        console.error('Erro ao deletar contato:', error);
        return NextResponse.json({ error: 'Erro ao deletar contato' }, { status: 500 });
    }
}

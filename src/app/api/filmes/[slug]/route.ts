// src/app/api/filmes/[slug]/route.ts
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(_: Request, { params }: { params: { slug: string } }) {
    const filme = await prisma.filme.findUnique({
        where: { slug: params.slug },
    });

    if (!filme) {
        return NextResponse.json({ error: 'Filme not found' }, { status: 404 });
    }

    return NextResponse.json(filme);
}

export async function PUT(req: Request, context: { params: { slug: string } }) {
    const { params } = context;
    const data = await req.json();

    try {
        const updated = await prisma.filme.update({
            where: { slug: params.slug },
            data: {
                ...data,
                date: data.date ? new Date(data.date) : null,
            },
        });

        return NextResponse.json(updated);
    } catch (error) {
        console.error('Erro ao atualizar filme:', error);
        return NextResponse.json({ error: 'Failed to update filme' }, { status: 500 });
    }
}

export async function DELETE(_: Request, { params }: { params: { slug: string } }) {
    try {
        await prisma.filme.delete({
            where: { slug: params.slug },
        });

        return NextResponse.json({ message: 'Deleted' });
    } catch (error) {
        return NextResponse.json({ error: 'Failed to delete filme' }, { status: 500 });
    }
}

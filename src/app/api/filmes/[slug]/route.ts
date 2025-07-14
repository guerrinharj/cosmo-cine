import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { generateUniqueSlug } from '@/lib/generateUniqueSlug';

export async function GET(req: NextRequest) {
    const slug = req.nextUrl.pathname.split('/').pop();

    if (!slug) {
        return NextResponse.json({ error: 'Slug não fornecido' }, { status: 400 });
    }

    const filme = await prisma.filme.findUnique({
        where: { slug },
    });

    if (!filme) {
        return NextResponse.json({ error: 'Filme não encontrado' }, { status: 404 });
    }

    return NextResponse.json(filme);
}

export async function PUT(req: NextRequest) {
    const slug = req.nextUrl.pathname.split('/').pop();

    if (!slug) {
        return NextResponse.json({ error: 'Slug não fornecido' }, { status: 400 });
    }

    const data = await req.json();

    try {
        const newSlug = await generateUniqueSlug(data.nome, slug);

        const updated = await prisma.filme.update({
            where: { slug },
            data: {
                ...data,
                slug: newSlug,
                date: data.date ? new Date(data.date) : null,
            },
        });

        return NextResponse.json(updated);
    } catch (error) {
        console.error('Erro ao atualizar filme:', error);
        return NextResponse.json({ error: 'Erro ao atualizar filme' }, { status: 500 });
    }
}

export async function DELETE(req: NextRequest) {
    const slug = req.nextUrl.pathname.split('/').pop();

    if (!slug) {
        return NextResponse.json({ error: 'Slug não fornecido' }, { status: 400 });
    }

    try {
        await prisma.filme.delete({
            where: { slug },
        });

        return NextResponse.json({ message: 'Filme deletado com sucesso' });
    } catch (error) {
        console.error('Erro ao deletar filme:', error);
        return NextResponse.json({ error: 'Erro ao deletar filme' }, { status: 500 });
    }
}

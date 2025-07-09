// src/app/api/filmes/route.ts
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
    const filmes = await prisma.filme.findMany();
    return NextResponse.json(filmes);
}

export async function POST(req: Request) {
    const data = await req.json();

    try {
        const filme = await prisma.filme.create({
            data: {
                nome: data.nome,
                cliente: data.cliente,
                diretor: data.diretor,
                categoria: data.categoria,
                produtoraContratante: data.produtoraContratante,
                agencia: data.agencia,
                creditos: data.creditos,
                slug: data.slug,
                date: data.date,
                thumbnail: data.thumbnail,
                showable: data.showable,
            },
        });

        return NextResponse.json(filme, { status: 201 });
    } catch (error) {
        return NextResponse.json({ error: 'Failed to create filme' }, { status: 500 });
    }
}

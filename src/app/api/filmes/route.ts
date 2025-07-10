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
                video_url: data.video_url,
                showable: data.showable,
            },
        });

        return NextResponse.json(filme, { status: 201 });
    } catch (error: any) {
        const rawMessage = error?.message || String(error);

        // Expressão regular para extrair a primeira linha com "Argument ..."
        const match = rawMessage.match(/Argument.*?missing\./);

        const cleanMessage = match ? match[0] : 'Erro desconhecido';

        console.error('Erro ao criar Filme:', cleanMessage);

        return NextResponse.json(
            {
                error: 'Failed to create filme',
                details: cleanMessage,
            },
            { status: 500 }
        );
    }
}

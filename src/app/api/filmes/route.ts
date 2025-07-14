import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabaseClient';
import { generateUniqueSlug } from '@/lib/generateUniqueSlug';

export async function GET() {
    const { data, error } = await supabase
        .from('Filme')
        .select('*')
        .order('date', { ascending: false });

    if (error) {
        console.error('Erro ao buscar filmes:', error.message);
        return NextResponse.json({ error: 'Erro ao buscar filmes' }, { status: 500 });
    }

    return NextResponse.json(data);
}

export async function POST(req: Request) {
    const data = await req.json();
    const slug = await generateUniqueSlug(data.nome); // still OK if it doesn't use Prisma

    const { error, data: filme } = await supabase
        .from('Filme')
        .insert([
            {
                nome: data.nome,
                cliente: data.cliente,
                diretor: data.diretor,
                categoria: data.categoria,
                produtoraContratante: data.produtoraContratante,
                agencia: data.agencia,
                creditos: data.creditos,
                slug,
                date: data.date ? new Date(data.date).toISOString() : null,
                thumbnail: data.thumbnail,
                video_url: data.video_url,
                showable: data.showable,
            },
        ])
        .select()
        .single(); // ensures we get a single record back

    if (error) {
        console.error('Erro ao criar Filme:', error.message);

        return NextResponse.json(
            {
                error: 'Failed to create filme',
                details: error.message,
            },
            { status: 500 }
        );
    }

    return NextResponse.json(filme, { status: 201 });
}

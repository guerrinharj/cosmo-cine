import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabaseClient';
import slugify from 'slugify';

// GET: retorna todos os filmes
export async function GET() {
    const { data, error } = await supabase.from('Filme').select('*');

    if (error) {
        console.error('Erro ao buscar filmes:', error.message);
        return NextResponse.json({ error: 'Erro ao buscar filmes' }, { status: 500 });
    }

    if (!data || !Array.isArray(data)) {
        console.warn('Nenhum dado retornado ou formato inválido.');
        return NextResponse.json([], { status: 200 });
    }

    return NextResponse.json(data, { status: 200 });
}

// POST: cria novo filme
export async function POST(req: Request) {
    const data = await req.json();

    try {
        // Gera slug único manualmente
        const baseSlug = slugify(data.nome, { lower: true, strict: true });
        let slug = baseSlug;
        let count = 1;

        while (true) {
            const { data: existing } = await supabase
                .from('Filme')
                .select('slug')
                .eq('slug', slug)
                .maybeSingle();

            if (!existing) break;

            slug = `${baseSlug}-${count}`;
            count++;
        }

        const { data: novoFilme, error } = await supabase.from('Filme').insert([
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
                is_service: data.is_service
            },
        ]).select().single();

        if (error) {
            console.error('Erro ao criar Filme:', error.message);
            return NextResponse.json({ error: 'Erro ao criar filme' }, { status: 500 });
        }

        return NextResponse.json(novoFilme, { status: 201 });
    } catch (error: unknown) {
        const message =
            error instanceof Error ? error.message : String(error);
        console.error('Erro ao criar Filme:', message);
        return NextResponse.json(
            {
                error: 'Failed to create filme',
                details: message,
            },
            { status: 500 }
        );
    }
}

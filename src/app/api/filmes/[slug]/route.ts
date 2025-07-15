import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabaseClient';
import { generateUniqueSlug } from '@/lib/generateUniqueSlug';

// GET: retorna um filme por slug
export async function GET(req: NextRequest) {
    const slug = req.nextUrl.pathname.split('/').pop();

    if (!slug) {
        return NextResponse.json({ error: 'Slug não fornecido' }, { status: 400 });
    }

    const { data: filme, error } = await supabase
        .from('Filme')
        .select('*')
        .eq('slug', slug)
        .maybeSingle();

    if (error) {
        console.error('Erro ao buscar filme:', error.message);
        return NextResponse.json({ error: 'Erro ao buscar filme' }, { status: 500 });
    }

    if (!filme) {
        return NextResponse.json({ error: 'Filme não encontrado' }, { status: 404 });
    }

    return NextResponse.json(filme);
}

// PUT: atualiza um filme por slug
export async function PUT(req: NextRequest) {
    const slug = req.nextUrl.pathname.split('/').pop();

    if (!slug) {
        return NextResponse.json({ error: 'Slug não fornecido' }, { status: 400 });
    }

    const data = await req.json();

    try {
        const newSlug = await generateUniqueSlug(data.nome, slug);

        const { data: updated, error } = await supabase
            .from('Filme')
            .update({
                ...data,
                slug: newSlug,
                date: data.date ? new Date(data.date).toISOString() : null,
            })
            .eq('slug', slug)
            .select()
            .maybeSingle();

        if (error) {
            console.error('Erro ao atualizar filme:', error.message);
            return NextResponse.json({ error: 'Erro ao atualizar filme' }, { status: 500 });
        }

        if (!updated) {
            return NextResponse.json({ error: 'Filme não encontrado para atualização' }, { status: 404 });
        }

        return NextResponse.json(updated);
    } catch (error: any) {
        console.error('Erro ao atualizar filme:', error);
        return NextResponse.json({ error: 'Erro ao atualizar filme' }, { status: 500 });
    }
}

// DELETE: deleta um filme por slug
export async function DELETE(req: NextRequest) {
    const slug = req.nextUrl.pathname.split('/').pop();

    if (!slug) {
        return NextResponse.json({ error: 'Slug não fornecido' }, { status: 400 });
    }

    const { data, error } = await supabase
        .from('Filme')
        .delete()
        .eq('slug', slug)
        .select()
        .maybeSingle();

    if (error) {
        console.error('Erro ao deletar filme:', error.message);
        return NextResponse.json({ error: 'Erro ao deletar filme' }, { status: 500 });
    }

    if (!data) {
        return NextResponse.json({ error: 'Filme não encontrado para exclusão' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Filme deletado com sucesso' });
}

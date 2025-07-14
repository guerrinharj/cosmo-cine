import { supabase } from '@/lib/supabaseClient';
import { NextResponse } from 'next/server';

export async function GET() {
    const { data, error } = await supabase
        .from('Contato')
        .select('*')
        .order('createdAt', { ascending: false });

    if (error) {
        console.error('Erro ao buscar contatos:', error.message);
        return NextResponse.json({ error: 'Erro ao buscar contatos' }, { status: 500 });
    }

    return NextResponse.json(data, { status: 200 });
}

export async function POST(req: Request) {
    const { nome, funcao, email } = await req.json();

    if (!nome || !email) {
        return NextResponse.json({ error: 'Nome e e-mail são obrigatórios.' }, { status: 400 });
    }

    const { data, error } = await supabase.from('Contato').insert([
        { nome, funcao, email }
    ]).select().single();

    if (error) {
        console.error('Erro ao criar contato:', error.message);
        return NextResponse.json({ error: 'Erro ao criar contato' }, { status: 500 });
    }

    return NextResponse.json(data, { status: 201 });
}

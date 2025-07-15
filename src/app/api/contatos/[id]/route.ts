import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabaseClient';

export async function DELETE(req: NextRequest) {
    const id = req.nextUrl.pathname.split('/').pop();

    if (!id) {
        return NextResponse.json({ error: 'ID não fornecido' }, { status: 400 });
    }

    const { data, error } = await supabase
        .from('Contato')
        .delete()
        .eq('id', id)
        .select()
        .maybeSingle();

    if (error) {
        console.error('Erro ao deletar contato:', error.message);
        return NextResponse.json({ error: 'Erro ao deletar contato' }, { status: 500 });
    }

    if (!data) {
        return NextResponse.json({ error: 'Contato não encontrado para exclusão' }, { status: 404 });
    }

    return NextResponse.json({ message: `Contato ${id} deletado com sucesso` });
}

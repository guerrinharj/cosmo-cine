import { supabase } from '@/lib/supabaseClient';
import { NextResponse } from 'next/server';
import { checkApiKey } from '@/lib/checkApiKey';

export async function GET(req: Request) {
    if (!checkApiKey(req)) {
        return NextResponse.json({ error: 'Acesso não autorizado' }, { status: 401 });
    }

    const { data: users, error } = await supabase
        .from('User')
        .select('id, username, createdAt')
        .order('createdAt', { ascending: false });

    if (error) {
        console.error('Erro ao buscar usuários:', error.message);
        return NextResponse.json({ error: 'Erro ao buscar usuários' }, { status: 500 });
    }

    return NextResponse.json(users);
}

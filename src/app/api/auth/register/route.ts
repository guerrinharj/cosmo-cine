import { supabase } from '@/lib/supabaseClient';
import bcrypt from 'bcrypt';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
    try {
        const { username, password } = await req.json();

        if (!username || !password) {
            return NextResponse.json({ error: 'Usuário e senha são obrigatórios.' }, { status: 400 });
        }

        // Verifica se o usuário já existe
        const { data: existing, error: findError } = await supabase
            .from('User')
            .select('id')
            .eq('username', username)
            .single();

        if (existing) {
            return NextResponse.json({ error: 'Usuário já existe' }, { status: 400 });
        }

        // Criptografa a senha
        const hashedPassword = await bcrypt.hash(password, 10);

        // Insere novo usuário
        const { data: newUser, error: insertError } = await supabase
            .from('User')
            .insert({ username, password: hashedPassword })
            .select()
            .single();

        if (insertError) {
            console.error('Erro ao inserir usuário:', insertError.message);
            return NextResponse.json({ error: 'Erro ao registrar usuário' }, { status: 500 });
        }

        return NextResponse.json({
            message: 'Usuário registrado com sucesso',
            user: {
                id: newUser.id,
                username: newUser.username,
                createdAt: newUser.createdAt,
            },
        }, { status: 201 });

    } catch (err) {
        console.error('Erro geral ao registrar usuário:', err);
        return NextResponse.json({ error: 'Erro ao registrar usuário' }, { status: 500 });
    }
}

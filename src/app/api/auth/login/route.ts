import { prisma } from '@/lib/prisma'; // Acesso ao banco de dados via Prisma
import bcrypt from 'bcrypt';           // Para comparar senhas criptografadas
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
    // 1. Extrai o username e password do corpo da requisição
    const { username, password } = await req.json();

    // 2. Busca o usuário no banco de dados com o username fornecido
    const user = await prisma.user.findUnique({ where: { username } });

    if (!user) {
        // 3. Se o usuário não existir, retorna erro 404
        return NextResponse.json({ error: 'Usuário não encontrado' }, { status: 404 });
    }

    // 4. Compara a senha fornecida com a senha criptografada no banco
    const valid = await bcrypt.compare(password, user.password);
    if (!valid) {
        // 5. Se a senha for inválida, retorna erro 401
        return NextResponse.json({ error: 'Senha incorreta' }, { status: 401 });
    }

    // 6. Define tempo de duração do cookie (1 hora)
    const oneHour = 60 * 60;

    // 7. Cria resposta de sucesso
    const response = NextResponse.json({ message: 'Login bem-sucedido', username });

    // 8. Seta cookie chamado 'session' com valor do username
    response.cookies.set('session', username, {
        maxAge: oneHour,
        httpOnly: true, // Segurança: não acessível via JavaScript no cliente
        sameSite: 'lax', // Evita envio de cookies em requisições cross-site inseguras
        secure: process.env.NODE_ENV === 'production', // Só HTTPS em produção
    });

    // 9. Retorna resposta final
    return response;
}

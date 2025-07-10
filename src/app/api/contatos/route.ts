import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

export async function GET() {
    const contatos = await prisma.contato.findMany({
        orderBy: { createdAt: 'desc' }
    });
    return NextResponse.json(contatos);
    }


    
export async function POST(req: Request) {
    const data = await req.json();
    const { nome, funcao, email } = data;

    if (!nome || !email) {
        return NextResponse.json({ error: 'Nome e e-mail são obrigatórios.' }, { status: 400 });
    }

    const contato = await prisma.contato.create({
        data: { nome, funcao, email }
    });

    return NextResponse.json(contato);
}

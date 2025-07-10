import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';
import { checkApiKey } from '@/lib/checkApiKey';

export async function GET(req: Request) {
    if (!checkApiKey(req)) {
        return NextResponse.json({ error: 'Acesso não autorizado' }, { status: 401 });
    }

    const users = await prisma.user.findMany({
        select: {
            id: true,
            username: true,
            createdAt: true
        }
    });

    return NextResponse.json(users);
}

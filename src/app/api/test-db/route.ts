import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
    try {
        const result = await prisma.filme.findFirst();
        return NextResponse.json({ ok: true, result });
    } catch (err) {
        console.error('❌ DB error:', err);

        const errorMessage =
            err instanceof Error ? err.message : 'Unknown error occurred!';

        return NextResponse.json({ error: errorMessage }, { status: 500 });
    }
}

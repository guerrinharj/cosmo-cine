import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function GET() {
    const session = cookies().get('session');

    if (session?.value) {
        return NextResponse.json({ authenticated: true, username: session.value });
    }

    return NextResponse.json({ authenticated: false }, { status: 401 });
}

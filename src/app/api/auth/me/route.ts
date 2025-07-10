import { NextResponse } from 'next/server';

export async function GET(request: Request) {
    const cookieHeader = request.headers.get('cookie') || '';
    const sessionMatch = cookieHeader.match(/session=([^;]+)/);
    const session = sessionMatch?.[1];

    if (session) {
        return NextResponse.json({ authenticated: true, username: session });
    }

    return NextResponse.json({ authenticated: false });
}

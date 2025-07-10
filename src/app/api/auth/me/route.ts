// app/api/auth/me/route.ts
import { NextResponse } from 'next/server';

export async function GET(req: Request) {
    const cookieHeader = req.headers.get('cookie') || '';

    const cookies = Object.fromEntries(
        cookieHeader.split(';').map(cookie => {
            const [key, value] = cookie.trim().split('=');
            return [key, value];
        })
    );

    const isAuthenticated = cookies.auth === 'true';
    const username = cookies.username;

    if (isAuthenticated && username) {
        return NextResponse.json({ authenticated: true, username });
    }

    return NextResponse.json({ authenticated: false }, { status: 401 });
}

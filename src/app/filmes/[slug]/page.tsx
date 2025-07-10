// app/filmes/[slug]/page.tsx
import { cookies } from 'next/headers';
export const dynamic = 'force-dynamic';
import FilmeClientPage from './FilmeClientPage';

export default async function FilmePageWrapper({ params }: { params: { slug: string } }) {
    const cookieStore = await cookies(); // <-- AQUI
    const session = cookieStore.get('session');
    const isAuthenticated = !!session?.value;

       console.log('Session on server:', session);

    return (
        <FilmeClientPage slug={params.slug} isAuthenticated={isAuthenticated} />
    );
}

// src/app/filmes/[slug]/page.tsx
import FilmeClientPage from './FilmeClientPage';

export default function FilmePageWrapper({ params }: any) {
    return <FilmeClientPage slug={params.slug} />;
}

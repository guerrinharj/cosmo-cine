// src/app/filmes/[slug]/page.tsx
import FilmeClientPage from './FilmeClientPage';

type PageProps = {
    params: {
        slug: string;
    };
};

export default function FilmePageWrapper({ params }: any) {
    return <FilmeClientPage slug={params.slug} />;
}

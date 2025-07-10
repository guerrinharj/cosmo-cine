import FilmeClientPage from './FilmeClientPage';

export default function FilmePageWrapper({ params }: { params: { slug: string } }) {
    return <FilmeClientPage slug={params.slug} />;
}

'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import NavBar from '@/components/NavBar';

export default function EditFilmePage() {
    const router = useRouter();
    const { slug } = useParams();

    const [form, setForm] = useState({
        nome: '',
        cliente: '',
        diretor: '',
        categoria: '',
        produtoraContratante: '',
        agencia: '',
        video_url: '',
        date: '',
        thumbnail: '',
        showable: false,
    });

    const [creditos, setCreditos] = useState<{ funcao: string; nome: string }[]>([]);
    const [touched, setTouched] = useState<{ [key: string]: boolean }>({});
    const [modalMessage, setModalMessage] = useState('');
    const [showModal, setShowModal] = useState(false);

    const requiredFields = ['nome', 'cliente', 'diretor', 'categoria'];

    useEffect(() => {
        async function fetchFilme() {
            const res = await fetch(`/api/filmes/${slug}`);
            const data = await res.json();

            setForm({
                nome: data.nome,
                cliente: data.cliente,
                diretor: data.diretor,
                categoria: data.categoria,
                produtoraContratante: data.produtoraContratante || '',
                agencia: data.agencia || '',
                video_url: data.video_url,
                date: data.date?.slice(0, 10) || '',
                thumbnail: data.thumbnail || '',
                showable: data.showable,
            });

            const creditosArray = data.creditos
                ? Object.entries(data.creditos).map(([funcao, nome]) => ({ funcao, nome }))
                : [];

            setCreditos(creditosArray);
        }

        fetchFilme();
    }, [slug]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value, type, checked } = e.target;
        setForm((prev) => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value,
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        const isValid = requiredFields.every((field) => !!form[field]);
        if (!isValid) {
            const newTouched: { [key: string]: boolean } = {};
            requiredFields.forEach((f) => (newTouched[f] = true));
            setTouched(newTouched);
            return;
        }

        const isVimeoUrl = /^https?:\/\/(www\.)?vimeo\.com\/\d+/.test(form.video_url);
        if (!isVimeoUrl) {
            setTouched({ ...touched, video_url: true });
            setModalMessage('A URL do vídeo precisa ser um link válido do Vimeo (ex: https://vimeo.com/12345678)');
            setShowModal(true);
            return;
        }

        try {
            const oembedRes = await fetch(`https://vimeo.com/api/oembed.json?url=${form.video_url}`);
            const oembed = await oembedRes.json();
            const thumbnailUrl = oembed.thumbnail_url;

            const res = await fetch(`/api/filmes/${slug}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...form,
                    thumbnail: thumbnailUrl,
                    creditos: Object.fromEntries(creditos.map((c) => [c.funcao, c.nome])),
                }),
            });

            const result = await res.json();
            if (res.ok) {
                router.push(`/filmes/${result.slug}`);
                return;
            } else {
                setModalMessage(`Erro ao atualizar filme: ${result.details || result.error}`);
            }
        } catch (err) {
            setModalMessage('Erro inesperado. Verifique os dados e tente novamente.');
        }

        setShowModal(true);
    };

    const addCredito = () => setCreditos([...creditos, { funcao: '', nome: '' }]);
    const updateCredito = (i: number, key: 'funcao' | 'nome', value: string) => {
        const copy = [...creditos];
        copy[i][key] = value;
        setCreditos(copy);
    };
    const removeCredito = (i: number) => setCreditos(creditos.filter((_, idx) => idx !== i));

    const inputStyle = (field: string) =>
        `w-full px-3 py-2 rounded border ${touched[field] && !form[field] ? 'border-red-500' : 'border-gray-300'}`;

    return (
        <div className="bg-black text-white min-h-screen">
            <NavBar />
            <div className="max-w-5xl mx-auto px-6 py-10">
                <h1 className="text-2xl font-bold mb-8">Editar Filme</h1>
                <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <input name="nome" placeholder="Nome *" value={form.nome} onChange={handleChange} onBlur={() => setTouched({ ...touched, nome: true })} className={inputStyle('nome')} />
                    <input name="cliente" placeholder="Cliente *" value={form.cliente} onChange={handleChange} onBlur={() => setTouched({ ...touched, cliente: true })} className={inputStyle('cliente')} />
                    <input name="diretor" placeholder="Diretor *" value={form.diretor} onChange={handleChange} onBlur={() => setTouched({ ...touched, diretor: true })} className={inputStyle('diretor')} />
                    <select name="categoria" value={form.categoria} onChange={handleChange} onBlur={() => setTouched({ ...touched, categoria: true })} className={inputStyle('categoria')}>
                        <option value="">Categoria *</option>
                        <option value="Publicidade">Publicidade</option>
                        <option value="Clipe">Clipe</option>
                        <option value="Conteudo">Conteúdo</option>
                    </select>
                    <input name="produtoraContratante" placeholder="Produtora Contratante" value={form.produtoraContratante} onChange={handleChange} className={inputStyle('produtoraContratante')} />
                    <input name="agencia" placeholder="Agência" value={form.agencia} onChange={handleChange} className={inputStyle('agencia')} />
                    <input name="video_url" placeholder="Vídeo URL * (Vimeo)" value={form.video_url} onChange={handleChange} onBlur={() => setTouched({ ...touched, video_url: true })} className={inputStyle('video_url')} />
                    <input name="date" type="date" value={form.date} onChange={handleChange} className={inputStyle('date')} />

                    <div className="md:col-span-2">
                        <p className="mb-2 font-bold">Créditos</p>
                        {creditos.map((c, i) => (
                            <div key={i} className="flex gap-2 mb-2">
                                <input placeholder="Função" value={c.funcao} onChange={(e) => updateCredito(i, 'funcao', e.target.value)} className="flex-1 px-3 py-2 rounded border border-gray-300" />
                                <input placeholder="Nome da pessoa" value={c.nome} onChange={(e) => updateCredito(i, 'nome', e.target.value)} className="flex-1 px-3 py-2 rounded border border-gray-300" />
                                <button type="button" onClick={() => removeCredito(i)} className="text-red-400 px-2">✕</button>
                            </div>
                        ))}
                        <button type="button" onClick={addCredito} className="mt-2 text-sm underline text-white">Adicionar Crédito</button>
                    </div>

                    <label className="flex items-center gap-2 md:col-span-2">
                        <input type="checkbox" name="showable" checked={form.showable} onChange={handleChange} />
                        Mostrar publicamente
                    </label>

                    <div className="md:col-span-2 flex justify-end">
                        <button type="submit" className="px-6 py-2 bg-white text-black rounded hover:bg-gray-200 transition">Salvar Alterações</button>
                    </div>
                </form>
            </div>

            {showModal && (
                <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50">
                    <div className="bg-white text-black rounded-lg p-6 w-full max-w-md text-center">
                        <p className="mb-4">{modalMessage}</p>
                        <button onClick={() => setShowModal(false)} className="mt-2 px-4 py-2 bg-black text-white rounded hover:bg-gray-800">Fechar</button>
                    </div>
                </div>
            )}
        </div>
    );
}

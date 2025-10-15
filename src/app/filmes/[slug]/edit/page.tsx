'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import NavBar from '@/components/NavBar';
import { supabase } from '@/lib/supabaseClient';

export default function EditFilmePage() {
    const router = useRouter();
    const { slug } = useParams();

    type FormFields = {
        [key: string]: string | boolean;
        nome: string;
        cliente: string;
        diretor: string;
        categoria: string;
        produtoraContratante: string;
        agencia: string;
        video_url: string;
        date: string;
        thumbnail: string;
        showable: boolean;
        is_service: boolean;
    };

    const [form, setForm] = useState<FormFields>({
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
        is_service: false
    });

    const [creditos, setCreditos] = useState<string[]>([]);
    const [touched, setTouched] = useState<{ [key: string]: boolean }>({});
    const [modalMessage, setModalMessage] = useState('');
    const [showModal, setShowModal] = useState(false);

    // NEW: upload states
    const [file, setFile] = useState<File | null>(null);
    const [uploading, setUploading] = useState(false);

    const requiredFields = ['nome', 'diretor', 'categoria', 'video_url'];

    const splitCreditos = (str: string) =>
        str
            .split(/;\s*|,(?=\s*[A-Za-zÀ-ÿ&][A-Za-zÀ-ÿ\s&]*:)/)
            .map(s => s.trim())
            .filter(Boolean);

    const isLikelyUrl = (value: string) => /^https?:\/\/.+/i.test(value.trim());

    useEffect(() => {
        async function fetchFilme() {
            const res = await fetch(`/api/filmes/${slug}`);
            const data = await res.json();

            setForm({
                nome: data.nome ?? '',
                cliente: data.cliente ?? '',
                diretor: data.diretor ?? '',
                categoria: data.categoria ?? '',
                produtoraContratante: data.produtoraContratante ?? '',
                agencia: data.agencia ?? '',
                video_url: data.video_url ?? '',
                date: data.date?.slice(0, 10) ?? '',
                thumbnail: data.thumbnail ?? '',
                showable: Boolean(data.showable),
                is_service: Boolean(data.is_service)
            });

            const creditosArray =
                typeof data.creditos === 'string' ? splitCreditos(data.creditos) : [];
            setCreditos(creditosArray);
        }

        fetchFilme();
    }, [slug]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const target = e.target as HTMLInputElement;
        const { name, value, type, checked } = target;
        setForm(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    // NEW: selecionar arquivo para upload
    const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
        const f = e.target.files?.[0] || null;
        if (!f) {
            setFile(null);
            return;
        }
        if (!f.type.startsWith('image/')) {
            setModalMessage('Envie um arquivo de imagem (jpg, png, webp…).');
            setShowModal(true);
            e.target.value = '';
            return;
        }
        if (f.size > 5 * 1024 * 1024) {
            setModalMessage('A imagem deve ter no máximo 5MB.');
            setShowModal(true);
            e.target.value = '';
            return;
        }
        setFile(f);
    };

    // NEW: upload para Storage (bucket "thumbnails")
    async function uploadThumbnail(): Promise<string> {
        if (!file) throw new Error('Nenhum arquivo selecionado.');
        setUploading(true);
        try {
            const sanitized = file.name.replace(/[^\w.\-]+/g, '_').toLowerCase();
            const slugBase =
                (form.nome as string)?.trim()
                    .toLowerCase()
                    .normalize('NFD')
                    .replace(/[\u0300-\u036f]/g, '')
                    .replace(/[^\w]+/g, '-')
                    .replace(/^-+|-+$/g, '') || 'filme';
            const path = `filmes/${slugBase}/${Date.now()}-${sanitized}`;

            const { error: upErr } = await supabase.storage
                .from('thumbnails')
                .upload(path, file, {
                    cacheControl: '3600',
                    upsert: false,
                    contentType: file.type
                });

            if (upErr) throw upErr;

            // Bucket público: pegar URL pública
            const { data } = supabase.storage.from('thumbnails').getPublicUrl(path);
            const publicUrl = data?.publicUrl;
            if (!publicUrl) throw new Error('Não foi possível obter a URL pública do arquivo.');
            return publicUrl;

            // Se bucket for PRIVADO, use signed URL:
            // const { data: signed } = await supabase.storage.from('thumbnails').createSignedUrl(path, 60 * 60);
            // if (!signed?.signedUrl) throw new Error('Não foi possível gerar URL temporária.');
            // return signed.signedUrl;
        } finally {
            setUploading(false);
        }
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        const isValid = requiredFields.every(field => !!form[field]);
        if (!isValid) {
            const newTouched: { [key: string]: boolean } = {};
            requiredFields.forEach(f => (newTouched[f] = true));
            setTouched(newTouched);
            return;
        }

        const isVimeoUrl = /^https?:\/\/(www\.)?vimeo\.com\/\d+/.test(form.video_url as string);
        if (!isVimeoUrl) {
            setTouched({ ...touched, video_url: true });
            setModalMessage(
                'A URL do vídeo precisa ser um link válido do Vimeo (ex: https://vimeo.com/12345678)'
            );
            setShowModal(true);
            return;
        }

        try {
            // 1) Se enviar arquivo, usa a URL do nosso bucket
            let chosenThumbnail = (form.thumbnail as string).trim();
            if (file) {
                const uploadedUrl = await uploadThumbnail();
                chosenThumbnail = uploadedUrl; // <- usa a URL do Storage
            } else {
                // 2) Sem arquivo: valida URL manual se houver
                if (chosenThumbnail && !isLikelyUrl(chosenThumbnail)) {
                    setTouched({ ...touched, thumbnail: true });
                    setModalMessage('A Thumbnail personalizada deve ser uma URL iniciando com http(s)://');
                    setShowModal(true);
                    return;
                }
                // 3) Sem arquivo e sem URL manual: fallback Vimeo oEmbed
                if (!chosenThumbnail) {
                    const oembedRes = await fetch(
                        `https://vimeo.com/api/oembed.json?url=${encodeURIComponent(form.video_url as string)}`
                    );
                    if (oembedRes.ok) {
                        const oembed = await oembedRes.json();
                        chosenThumbnail = (oembed?.thumbnail_url as string) || '';
                    }
                }
            }

            const payload = {
                ...form,
                thumbnail: chosenThumbnail || undefined,
                creditos: creditos.map(c => c.trim()).filter(Boolean).join('; '),
                cliente: (form.cliente as string).trim() || undefined,
                agencia: (form.agencia as string).trim() || undefined,
                produtoraContratante: (form.produtoraContratante as string).trim() || undefined,
                date: (form.date as string) || undefined,
                is_service: form.is_service
            };

            const res = await fetch(`/api/filmes/${slug}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            const result = await res.json();
            if (res.ok) {
                router.push(`/filmes/${result.slug}`);
                return;
            } else {
                setModalMessage(`Erro ao atualizar filme: ${result.details || result.error}`);
            }
        } catch (error: any) {
            console.error('Erro:', error);
            setModalMessage(error?.message || 'Erro inesperado. Verifique os dados e tente novamente.');
        }

        setShowModal(true);
    };

    const addCredito = () => setCreditos([...creditos, '']);
    const updateCredito = (i: number, value: string) => {
        const copy = [...creditos];
        copy[i] = value;
        setCreditos(copy);
    };
    const removeCredito = (i: number) => {
        setCreditos(creditos.filter((_, idx) => idx !== i));
    };

    const inputStyle = (field: string) =>
        `w-full px-3 py-2 rounded border ${
            touched[field] && !form[field] ? 'border-red-500' : 'border-gray-300'
        } bg-black text-white placeholder-gray-400`;

    return (
        <div className="bg-black text-white min-h-screen">
            <NavBar />
            <div className="max-w-5xl mx-auto px-6 py-10">
                <h1 className="paralucent uppercase text-4xl font-bold mb-8">Editar Filme</h1>
                <form onSubmit={handleSubmit} className="paralucent grid grid-cols-1 md:grid-cols-2 gap-6">
                    <input
                        name="nome"
                        placeholder="Nome *"
                        value={form.nome as string}
                        onChange={handleChange}
                        onBlur={() => setTouched({ ...touched, nome: true })}
                        className={inputStyle('nome')}
                    />
                    <input
                        name="cliente"
                        placeholder="Cliente"
                        value={form.cliente as string}
                        onChange={handleChange}
                        className={inputStyle('cliente')}
                    />
                    <input
                        name="diretor"
                        placeholder="Diretor *"
                        value={form.diretor as string}
                        onChange={handleChange}
                        onBlur={() => setTouched({ ...touched, diretor: true })}
                        className={inputStyle('diretor')}
                    />
                    <select
                        name="categoria"
                        value={form.categoria as string}
                        onChange={handleChange}
                        onBlur={() => setTouched({ ...touched, categoria: true })}
                        className={inputStyle('categoria')}
                    >
                        <option value="">Categoria *</option>
                        <option value="Publicidade">Publicidade</option>
                        <option value="Clipe">Clipe</option>
                        <option value="Conteudo">Conteúdo</option>
                    </select>
                    <input
                        name="produtoraContratante"
                        placeholder="Produtora Contratante"
                        value={form.produtoraContratante as string}
                        onChange={handleChange}
                        className={inputStyle('produtoraContratante')}
                    />
                    <input
                        name="agencia"
                        placeholder="Agência"
                        value={form.agencia as string}
                        onChange={handleChange}
                        className={inputStyle('agencia')}
                    />
                    <input
                        name="video_url"
                        placeholder="Vídeo URL * (Vimeo)"
                        value={form.video_url as string}
                        onChange={handleChange}
                        onBlur={() => setTouched({ ...touched, video_url: true })}
                        className={inputStyle('video_url')}
                    />

                    {/* NEW: Upload de imagem (sobrepõe URL manual se enviado) */}
                    <div className="md:col-span-2">
                        <label className="block mb-2">Upload de Thumbnail (imagem)</label>
                        <input
                            type="file"
                            accept="image/*"
                            onChange={handleFile}
                            className="w-full file:mr-4 file:rounded file:border-0 file:bg-white file:text-black file:px-4 file:py-2 rounded border border-gray-300 bg-black text-white"
                        />
                        {file && (
                            <p className="text-sm text-gray-400 mt-2">
                                Arquivo selecionado: <span className="underline">{file.name}</span>
                            </p>
                        )}
                        {uploading && <p className="text-sm text-gray-400 mt-2">Enviando imagem…</p>}
                    </div>

                    {/* Custom Thumbnail URL (usada se NÃO enviar arquivo) */}
                    <div className="md:col-span-2">
                        <input
                            name="thumbnail"
                            placeholder="Thumbnail personalizada (URL) — usada se NÃO enviar arquivo"
                            value={form.thumbnail as string}
                            onChange={(e) => {
                                if (!touched.thumbnail) setTouched({ ...touched, thumbnail: false });
                                handleChange(e);
                            }}
                            onBlur={() => setTouched({ ...touched, thumbnail: true })}
                            className={`w-full px-3 py-2 rounded border ${
                                touched.thumbnail && form.thumbnail && !isLikelyUrl(form.thumbnail as string)
                                    ? 'border-red-500'
                                    : 'border-gray-300'
                            } bg-black text-white placeholder-gray-400`}
                        />

                        {/* Live preview (só quando não houver arquivo escolhido) */}
                        {!file && isLikelyUrl(form.thumbnail as string) && (
                            <div className="mt-3">
                                <p className="text-sm text-gray-400 mb-2">Pré-visualização da Thumbnail:</p>
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img
                                    src={form.thumbnail as string}
                                    alt="Pré-visualização da thumbnail"
                                    className="w-full max-h-72 object-contain rounded border border-gray-700"
                                />
                            </div>
                        )}

                        {!file && touched.thumbnail && form.thumbnail && !isLikelyUrl(form.thumbnail as string) && (
                            <p className="text-sm text-red-400 mt-2">
                                Insira uma URL válida (começando com http:// ou https://).
                            </p>
                        )}
                    </div>

                    <input
                        name="date"
                        type="date"
                        value={form.date as string}
                        onChange={handleChange}
                        className={inputStyle('date')}
                    />

                    {/* Créditos */}
                    <div className="md:col-span-2">
                        <p className="mb-2 font-bold">Créditos</p>
                        {creditos.map((c, i) => (
                            <div key={i} className="flex gap-2 mb-2 flex-col">
                                <div className="flex gap-2">
                                    <textarea
                                        placeholder="Texto do crédito (ex.: Direção: Fulano; Arte & Design: Sicrana, Beltrano)"
                                        value={c}
                                        onChange={e => updateCredito(i, e.target.value)}
                                        className="flex-1 px-3 py-2 rounded border border-gray-300 min-h-[80px] bg-black text-white placeholder-gray-400"
                                    />
                                    <button type="button" onClick={() => removeCredito(i)} className="text-red-400 px-2">
                                        ✕
                                    </button>
                                </div>
                                {c.trim() && <p className="text-sm text-gray-400 mt-1">{c.trim()}</p>}
                            </div>
                        ))}
                        <button type="button" onClick={addCredito} className="mt-2 text-sm underline text-white">
                            Adicionar Crédito
                        </button>
                    </div>

                    <label className="flex items-center gap-2 md:col-span-2">
                        <input type="checkbox" name="is_service" checked={form.is_service as boolean} onChange={handleChange} />
                        É um Service?
                    </label>

                    <label className="flex items-center gap-2 md:col-span-2">
                        <input type="checkbox" name="showable" checked={form.showable as boolean} onChange={handleChange} />
                        Mostrar publicamente
                    </label>

                    <div className="md:col-span-2 flex justify-end">
                        <button
                            type="submit"
                            disabled={uploading}
                            className="px-6 py-2 bg-white text-black rounded hover:bg-gray-200 transition disabled:opacity-60"
                        >
                            Salvar Alterações
                        </button>
                    </div>
                </form>
            </div>

            {showModal && (
                <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50">
                    <div className="bg-white text-black rounded-lg p-6 w-full max-w-md text-center">
                        <p className="mb-4">{modalMessage}</p>
                        <button
                            onClick={() => setShowModal(false)}
                            className="mt-2 px-4 py-2 bg-black text-white rounded hover:bg-gray-800"
                        >
                            Fechar
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}

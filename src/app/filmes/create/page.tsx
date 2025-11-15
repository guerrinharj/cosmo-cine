'use client';

import { useState, useCallback, ChangeEvent, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import NavBar from '@/components/NavBar';
import { supabase } from '@/lib/supabaseClient';
import Cropper, { Area } from 'react-easy-crop';

type FilmeForm = {
    nome: string;
    cliente: string;
    diretor: string;
    categoria: string;
    produtoraContratante: string;
    agencia: string;
    label: string; 
    video_url: string;
    date: string;
    thumbnail: string;
    showable: boolean;
    is_service: boolean;
    [key: string]: string | boolean;
};

// Ajuste conforme seu layout da Home
const HOME_ASPECT = 16 / 9;
const TARGET_WIDTH = 1600;
const TARGET_HEIGHT = Math.round(TARGET_WIDTH / HOME_ASPECT);

export default function CreateFilmePage() {
    const router = useRouter();

    const [form, setForm] = useState<FilmeForm>({
        nome: '',
        cliente: '',
        diretor: '',
        categoria: '',
        produtoraContratante: '',
        agencia: '',
        label: '',
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

    // Upload / crop
    const [file, setFile] = useState<File | null>(null);
    const [uploading, setUploading] = useState(false);

    const [cropOpen, setCropOpen] = useState(false);
    const [imageSrc, setImageSrc] = useState<string>('');
    const [crop, setCrop] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
    const [zoom, setZoom] = useState(1);
    const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);

    const requiredFields = ['nome', 'diretor', 'categoria', 'video_url'];

    const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const target = e.target as HTMLInputElement;
        const { name, value, type } = target;
        const checked = (target as HTMLInputElement).checked;
        setForm((prev) => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const isLikelyUrl = (value: string) => /^https?:\/\/.+/i.test(value.trim());

    // Seleção do arquivo + abre o modal do crop
    const handleFile = (e: ChangeEvent<HTMLInputElement>) => {
        const f = e.target.files?.[0] || null;
        if (!f) {
            setFile(null);
            setImageSrc('');
            setCropOpen(false);
            return;
        }
        if (!f.type.startsWith('image/')) {
            setModalMessage('Envie um arquivo de imagem (jpg, png, webp…).');
            setShowModal(true);
            e.target.value = '';
            return;
        }
        if (f.size > 10 * 1024 * 1024) {
            setModalMessage('A imagem deve ter no máximo 10MB.');
            setShowModal(true);
            e.target.value = '';
            return;
        }

        setFile(f);
        const reader = new FileReader();
        reader.onload = () => {
            setImageSrc(reader.result as string);
            setCropOpen(true);
        };
        reader.readAsDataURL(f);
    };

    // Callback do crop (tipado)
    const onCropComplete = useCallback((_croppedArea: Area, croppedPixels: Area) => {
        setCroppedAreaPixels(croppedPixels);
    }, []);

    // Gera o blob recortado na proporção/tamanho desejados
    async function getCroppedBlob(imageSrc: string, crop: Area) {
        const image = await new Promise<HTMLImageElement>((resolve, reject) => {
            const img = new Image();
            img.crossOrigin = 'anonymous';
            img.onload = () => resolve(img);
            img.onerror = (err) => reject(err);
            img.src = imageSrc;
        });

        const canvas = document.createElement('canvas');
        canvas.width = TARGET_WIDTH;
        canvas.height = TARGET_HEIGHT;
        const ctx = canvas.getContext('2d');
        if (!ctx) throw new Error('Canvas não suportado.');

        // recorte bruto em um canvas temporário para preservar qualidade
        const tempCanvas = document.createElement('canvas');
        const tctx = tempCanvas.getContext('2d');
        if (!tctx) throw new Error('Canvas não suportado.');
        tempCanvas.width = crop.width;
        tempCanvas.height = crop.height;
        tctx.drawImage(image, crop.x, crop.y, crop.width, crop.height, 0, 0, crop.width, crop.height);

        // redimensiona para o destino final (consistente com a Home)
        ctx.drawImage(tempCanvas, 0, 0, TARGET_WIDTH, TARGET_HEIGHT);

        return await new Promise<Blob>((resolve) => {
            canvas.toBlob((blob) => resolve(blob as Blob), 'image/jpeg', 0.9);
        });
    }

    // Upload genérico para o bucket
    async function uploadToStorage(fileOrBlob: Blob, filenameHint = 'thumbnail.jpg'): Promise<string> {
        setUploading(true);
        try {
            const sanitized = filenameHint.replace(/[^\w.\-]+/g, '_').toLowerCase();
            const slugBase =
                form.nome?.trim()
                    .toLowerCase()
                    .normalize('NFD')
                    .replace(/[\u0300-\u036f]/g, '')
                    .replace(/[^\w]+/g, '-')
                    .replace(/^-+|-+$/g, '') || 'filme';

            const path = `filmes/${slugBase}/${Date.now()}-${sanitized}`;
            const { error: upErr } = await supabase.storage
                .from('thumbnails')
                .upload(path, fileOrBlob, {
                    cacheControl: '3600',
                    upsert: false,
                    contentType: fileOrBlob.type || 'image/jpeg'
                });
            if (upErr) throw upErr;

            const { data } = supabase.storage.from('thumbnails').getPublicUrl(path);
            const publicUrl = data?.publicUrl;
            if (!publicUrl) throw new Error('Não foi possível obter a URL pública do arquivo.');
            return publicUrl;
        } finally {
            setUploading(false);
        }
    }

    const handleSubmit = async (e: FormEvent) => {
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
            let chosenThumbnail = form.thumbnail.trim();

            // Se tiver arquivo e crop definido, gera blob recortado e envia
            if (file && imageSrc && croppedAreaPixels) {
                const blob = await getCroppedBlob(imageSrc, croppedAreaPixels);
                const uploadedUrl = await uploadToStorage(blob, file.name.replace(/\.[^.]+$/, '.jpg'));
                chosenThumbnail = uploadedUrl;
            } else {
                // Sem arquivo: valida URL manual ou busca oEmbed do Vimeo
                if (chosenThumbnail && !isLikelyUrl(chosenThumbnail)) {
                    setTouched({ ...touched, thumbnail: true });
                    setModalMessage('A Thumbnail personalizada deve ser uma URL iniciando com http(s)://');
                    setShowModal(true);
                    return;
                }
                if (!chosenThumbnail) {
                    const oembedRes = await fetch(
                        `https://vimeo.com/api/oembed.json?url=${encodeURIComponent(form.video_url)}`
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
                creditos: creditos.filter((c) => c.trim() !== '').join(', '),
                cliente: form.cliente.trim() || undefined,
                agencia: form.agencia.trim() || undefined,
                label: form.label.trim() || undefined,
                produtoraContratante: form.produtoraContratante.trim() || undefined,
                date: form.date || undefined,
                is_service: form.is_service
            };

            const res = await fetch('/api/filmes', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            const result = await res.json();
            if (res.ok) {
                router.push('/filmes');
                return;
            } else {
                setModalMessage(`Erro ao criar filme: ${result.details || result.error}`);
            }
        } catch (err: any) {
            setModalMessage(err?.message || 'Erro inesperado. Verifique os dados e tente novamente.');
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
                <h1 className="paralucent text-3xl font-bold mb-8 uppercase">Criar Filme</h1>

                <form onSubmit={handleSubmit} className="paralucent grid grid-cols-1 md:grid-cols-2 gap-6">
                    <input
                        name="nome"
                        placeholder="Nome *"
                        value={form.nome}
                        onChange={handleChange}
                        onBlur={() => setTouched({ ...touched, nome: true })}
                        className={inputStyle('nome')}
                    />
                    <input
                        name="cliente"
                        placeholder="Cliente"
                        value={form.cliente}
                        onChange={handleChange}
                        className={inputStyle('cliente')}
                    />
                    <input
                        name="diretor"
                        placeholder="Diretor *"
                        value={form.diretor}
                        onChange={handleChange}
                        onBlur={() => setTouched({ ...touched, diretor: true })}
                        className={inputStyle('diretor')}
                    />
                    <select
                        name="categoria"
                        value={form.categoria}
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
                        value={form.produtoraContratante}
                        onChange={handleChange}
                        className={inputStyle('produtoraContratante')}
                    />
                    <input
                        name="agencia"
                        placeholder="Agência"
                        value={form.agencia}
                        onChange={handleChange}
                        className={inputStyle('agencia')}
                    />
                    <input
                        name="label"
                        placeholder="Label"
                        value={form.label}
                        onChange={handleChange}
                        className={inputStyle('label')}
                    />

                    <input
                        name="video_url"
                        placeholder="Vídeo URL * (Vimeo)"
                        value={form.video_url}
                        onChange={handleChange}
                        onBlur={() => setTouched({ ...touched, video_url: true })}
                        className={inputStyle('video_url')}
                    />
                    <input
                        name="date"
                        type="date"
                        value={form.date}
                        onChange={handleChange}
                        className={inputStyle('date')}
                    />

                    {/* Upload + Crop */}
                    <div className="md:col-span-2">
                        <label className="block mb-2">Upload de Thumbnail (imagem) — com recorte</label>
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

                    {/* URL manual (usada somente se NÃO enviar arquivo) */}
                    <div className="md:col-span-2">
                        <input
                            name="thumbnail"
                            placeholder="Thumbnail personalizada (URL) — usada se NÃO enviar arquivo"
                            value={form.thumbnail}
                            onChange={(e) => {
                                if (!touched.thumbnail) setTouched({ ...touched, thumbnail: false });
                                handleChange(e);
                            }}
                            onBlur={() => setTouched({ ...touched, thumbnail: true })}
                            className={`w-full px-3 py-2 rounded border ${
                                touched.thumbnail && form.thumbnail && !isLikelyUrl(form.thumbnail)
                                    ? 'border-red-500'
                                    : 'border-gray-300'
                            } bg-black text-white placeholder-gray-400`}
                        />
                        {!file && isLikelyUrl(form.thumbnail) && (
                            <div className="mt-3">
                                <p className="text-sm text-gray-400 mb-2">Pré-visualização da Thumbnail:</p>
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img
                                    src={form.thumbnail}
                                    alt="Pré-visualização da thumbnail"
                                    className="w-full max-h-72 object-contain rounded border border-gray-700"
                                />
                            </div>
                        )}
                        {!file && touched.thumbnail && form.thumbnail && !isLikelyUrl(form.thumbnail) && (
                            <p className="text-sm text-red-400 mt-2">
                                Insira uma URL válida (começando com http:// ou https://).
                            </p>
                        )}
                    </div>

                    {/* Créditos */}
                    <div className="md:col-span-2">
                        <p className="mb-2 font-bold">Créditos</p>
                        {creditos.map((c, i) => (
                            <div key={i} className="flex gap-2 mb-2 flex-col">
                                <div className="flex gap-2">
                                    <textarea
                                        name={`credito_${i}`}
                                        placeholder="Texto do crédito"
                                        value={c}
                                        onChange={(e) => handleChange(e)}
                                        onInput={(e) => updateCredito(i, (e.target as HTMLTextAreaElement).value)}
                                        className="flex-1 px-3 py-2 rounded border border-gray-300 min-h-[80px] bg-black text-white placeholder-gray-400"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => removeCredito(i)}
                                        className="text-red-400 px-2"
                                    >
                                        ✕
                                    </button>
                                </div>
                                {c.trim() && <p className="text-sm text-gray-400 mt-1">{c.trim()}</p>}
                            </div>
                        ))}
                        <button
                            type="button"
                            onClick={addCredito}
                            className="mt-2 text-sm underline text-white"
                        >
                            Adicionar Crédito
                        </button>
                    </div>

                    <label className="flex items-center gap-2 md:col-span-2">
                        <input
                            type="checkbox"
                            name="is_service"
                            checked={form.is_service as boolean}
                            onChange={handleChange}
                        />
                        É um Service?
                    </label>

                    <label className="flex items-center gap-2 md:col-span-2">
                        <input
                            type="checkbox"
                            name="showable"
                            checked={form.showable as boolean}
                            onChange={handleChange}
                        />
                        Mostrar publicamente
                    </label>

                    <div className="md:col-span-2 flex justify-end">
                        <button
                            type="submit"
                            disabled={uploading}
                            className="px-6 py-2 bg-white text-black rounded hover:bg-gray-200 transition disabled:opacity-60"
                        >
                            Criar Filme
                        </button>
                    </div>
                </form>
            </div>

            {/* Modal do Crop */}
            {cropOpen && imageSrc && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
                    <div className="bg-white text-black rounded-2xl w-full max-w-2xl overflow-hidden">
                        <div className="p-4 border-b font-semibold">
                            Ajuste o recorte (proporção {Math.round(HOME_ASPECT * 100) / 100}:1)
                        </div>
                        <div className="relative w-full h-[60vh] min-h-[360px] bg-black">
                            <Cropper
                                image={imageSrc}
                                crop={crop}
                                zoom={zoom}
                                aspect={HOME_ASPECT}
                                onCropChange={setCrop}
                                onZoomChange={setZoom}
                                onCropComplete={onCropComplete}
                                restrictPosition={true}
                            />
                        </div>
                        <div className="flex items-center gap-4 p-4 border-t">
                            <input
                                type="range"
                                min={1}
                                max={3}
                                step={0.01}
                                value={zoom}
                                onChange={(e) => setZoom(parseFloat(e.target.value))}
                                className="flex-1"
                                aria-label="Zoom"
                            />
                            <button
                                onClick={() => {
                                    setCropOpen(false);
                                    setImageSrc('');
                                    setFile(null);
                                }}
                                className="px-4 py-2 rounded bg-gray-200 hover:bg-gray-300"
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={() => {
                                    // só fechamos o modal; o recorte efetivo é aplicado no submit
                                    setCropOpen(false);
                                }}
                                className="px-4 py-2 rounded bg-black text-white hover:bg-gray-800"
                            >
                                Aplicar recorte
                            </button>
                        </div>
                    </div>
                </div>
            )}

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

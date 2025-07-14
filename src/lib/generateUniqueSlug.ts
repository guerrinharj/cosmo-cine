import slugify from 'slugify';
import { supabase } from '@/lib/supabaseClient';

export async function generateUniqueSlug(nome: string, currentSlug?: string) {
    const baseSlug = slugify(nome, { lower: true, strict: true });
    let slug = baseSlug;
    let count = 1;

    while (true) {
        const { data: existing, error } = await supabase
            .from('Filme')
            .select('slug')
            .eq('slug', slug)
            .single();

        if (error?.code === 'PGRST116') {
            // Not found, we're good to break
            break;
        }

        if (!existing || existing.slug === currentSlug) {
            break;
        }

        count++;
        slug = `${baseSlug}-${count}`;
    }

    return slug;
}

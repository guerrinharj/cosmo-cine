import slugify from 'slugify';
import { prisma } from '@/lib/prisma';

export async function generateUniqueSlug(nome: string, currentSlug?: string) {
    const baseSlug = slugify(nome, { lower: true, strict: true });
    let slug = baseSlug;
    let count = 1;

    while (true) {
        const existing = await prisma.filme.findUnique({ where: { slug } });

        if (!existing || existing.slug === currentSlug) break;

        count++;
        slug = `${baseSlug}-${count}`;
    }

    return slug;
}

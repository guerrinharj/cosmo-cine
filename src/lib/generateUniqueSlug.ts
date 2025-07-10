import slugify from 'slugify';
import { prisma } from '@/lib/prisma';

export async function generateUniqueSlug(nome: string) {
    const baseSlug = slugify(nome, { lower: true, strict: true });
    let slug = baseSlug;
    let count = 1;

    while (await prisma.filme.findUnique({ where: { slug } })) {
        count++;
        slug = `${baseSlug}-${count}`;
    }

    return slug;
}

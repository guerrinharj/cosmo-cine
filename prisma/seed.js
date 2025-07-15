import { faker } from '@faker-js/faker';
import bcrypt from 'bcrypt';
import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';

dotenv.config();

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

const thumb = 'https://vumbnail.com/1082601305.jpg';
const videoUrl = 'https://vimeo.com/1082601305';
const categorias = ['Publicidade', 'Clipe', 'Conteudo'];

async function main() {
    // Delete all existing data (if needed)
    await supabase.from('Filme').delete().neq('id', '');
    await supabase.from('User').delete().neq('id', '');
    await supabase.from('Contato').delete().neq('id', '');
    console.log('🧨 Deleted all existing filmes, users, and contatos.');

    // Create default user
    const username = process.env.USERNAME || 'admin';
    const rawPassword = process.env.PASSWORD || 'password';
    const hashedPassword = await bcrypt.hash(rawPassword, 10);

    await supabase.from('User').insert({ username, password: hashedPassword });
    console.log(`👤 Created default user "${username}".`);

    // Seed filmes
    const filmes = Array.from({ length: 50 }).map(() => {
        const nome = faker.lorem.words({ min: 2, max: 4 });
        const slug = faker.helpers.slugify(nome.toLowerCase());

        return {
            nome,
            cliente: faker.company.name(),
            diretor: faker.person.fullName(),
            categoria: faker.helpers.arrayElement(categorias),
            produtoraContratante: 'Cosmo Cine',
            agencia: faker.company.name(),
            creditos: {
                direcao: faker.person.fullName(),
                edicao: faker.person.fullName(),
                roteiro: faker.person.fullName(),
            },
            slug,
            date: faker.date.past({ years: 2 }).toISOString(),
            thumbnail: thumb,
            video_url: videoUrl,
            showable: faker.datatype.boolean(),
        };
    });

    for (const filme of filmes) {
        await supabase.from('Filme').insert(filme);
    }
    console.log('🎬 Seeded 50 Filmes.');

    // Seed contatos
    const contatos = Array.from({ length: 10 }).map(() => ({
        nome: faker.person.fullName(),
        funcao: faker.person.jobTitle(),
        email: faker.internet.email(),
    }));

    for (const contato of contatos) {
        await supabase.from('Contato').insert(contato);
    }
    console.log('📇 Seeded 10 Contatos.');
}

main().catch((e) => {
    console.error(e);
    process.exit(1);
});

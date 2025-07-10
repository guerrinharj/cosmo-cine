import { PrismaClient } from '@prisma/client';
import { faker } from '@faker-js/faker';
import bcrypt from 'bcrypt';
import 'dotenv/config'; // Load environment variables

const prisma = new PrismaClient();

const thumb = 'https://vumbnail.com/1082601305.jpg';
const videoUrl = 'https://vimeo.com/1082601305';
const categorias = ['Publicidade', 'Clipe', 'Conteudo'] as const;

async function main() {
    // Delete existing entries
    await prisma.filme.deleteMany();
    await prisma.user.deleteMany();
    await prisma.contato.deleteMany();
    console.log('🧨 Deleted all existing filmes, users, and contatos.');

    // Create default admin user
    const username = process.env.USERNAME || 'admin';
    const rawPassword = process.env.PASSWORD || 'password';
    const hashedPassword = await bcrypt.hash(rawPassword, 10);

    await prisma.user.create({
        data: { username, password: hashedPassword },
    });
    console.log(`👤 Created default user "${username}".`);

    // Create fake filmes
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
                direção: faker.person.fullName(),
                edição: faker.person.fullName(),
                roteiro: faker.person.fullName(),
            },
            slug,
            date: faker.date.past({ years: 2 }).toISOString().split('T')[0],
            thumbnail: thumb,
            video_url: videoUrl,
            showable: faker.datatype.boolean(),
        };
    });

    await prisma.filme.createMany({ data: filmes });
    console.log('🎬 Seeded 50 Filmes.');

    // Create fake contatos
    const contatos = Array.from({ length: 10 }).map(() => ({
        nome: faker.person.fullName(),
        funcao: faker.person.jobTitle(),
        email: faker.internet.email(),
    }));

    await prisma.contato.createMany({ data: contatos });
    console.log('📇 Seeded 10 Contatos.');
}


main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });

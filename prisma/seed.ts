import { PrismaClient } from '@prisma/client';
import { faker } from '@faker-js/faker';

const prisma = new PrismaClient();
const thumb = 'https://vumbnail.com/1082601305.jpg';

const categorias = ['Publicidade', 'Clipe', 'Conteudo'] as const;

async function main() {
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
            showable: faker.datatype.boolean(),
        };
    });

    await prisma.filme.createMany({
        data: filmes,
    });

    console.log('🌱 Seeded 50 Filmes.');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });

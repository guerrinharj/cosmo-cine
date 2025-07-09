# 🎬 Cosmo Cine

Este é um CRM (Customer Relationship Manager) feito em **Next.js + Prisma** para a produtora de filmes **Cosmo Cine**. O objetivo é permitir a criação, visualização, edição e exclusão de registros de filmes (`Filme`) produzidos pela empresa, com informações detalhadas sobre cliente, direção, categoria, thumbnails e mais.

---

## 📁 Estrutura do Projeto

- **Framework:** Next.js (App Router)
- **Banco de Dados:** SQLite (via Prisma ORM)
- **Estilização:** TailwindCSS
- **Linguagem:** TypeScript
- **Auth:** (em breve)
- **Deploy recomendado:** Vercel

---

## 🚀 Instalação e Execução

1. **Clone o repositório**
```bash
git clone https://github.com/seu-usuario/cosmo-cine-crm.git
cd cosmo-cine-crm
```

2. **Instale as dependências**
```bash
npm install
```

3. **Configure o banco de dados**

Edite o arquivo .env e certifique-se de que ele contenha:

```bash
DATABASE_URL="file:./dev.db"
```


4. **Rode as migrações e gere o cliente Prisma**
```bash
npx prisma migrate dev --name init
npx prisma generate
```


5. **Execute o servidor de desenvolvimento**
```bash
npm run dev
```

Abra http://localhost:3000 no navegador para ver o app.



## 🧩 Modelo Filme

A aplicação trabalha com um único modelo central: Filme.

| Campo                  | Tipo       | Obrigatório | Descrição                           |
| ---------------------- | ---------- | ----------- | ----------------------------------- |
| `id`                   | `String`   | Sim         | Gerado automaticamente (CUID)       |
| `nome`                 | `String`   | Sim         | Nome do projeto                     |
| `cliente`              | `String`   | Sim         | Nome do cliente                     |
| `diretor`              | `String`   | Sim         | Nome do diretor                     |
| `categoria`            | `Enum`     | Sim         | Publicidade, Clipe ou Conteúdo      |
| `produtoraContratante` | `String`   | Não         | Nome da produtora contratante       |
| `agencia`              | `String`   | Não         | Nome da agência                     |
| `creditos`             | `JSON`     | Não         | Objeto com cargos e nomes           |
| `slug`                 | `String`   | Sim         | Identificador único da URL          |
| `date`                 | `String`   | Não         | Data do projeto                     |
| `thumbnail`            | `String`   | Não         | URL de imagem                       |
| `showable`             | `Boolean`  | Não         | Define se será visível publicamente |
| `createdAt`            | `DateTime` | Sim         | Gerado automaticamente              |
| `updatedAt`            | `DateTime` | Sim         | Atualizado automaticamente          |


## 📡 Endpoints da API

Abaixo estão os endpoints RESTful disponíveis:

### GET /api/filmes
Retorna todos os filmes cadastrados.

Exemplo de resposta:
```json
[
  {
    "nome": "Projeto Dummy",
    "cliente": "Agência XYZ",
    "diretor": "Fulano de Tal",
    "categoria": "Publicidade",
    ...
  }
]
```

### POST /api/filmes
Cria um novo filme.

Body esperado (JSON):
```json
{
  "nome": "Projeto Dummy",
  "cliente": "Agência XYZ",
  "diretor": "Fulano de Tal",
  "categoria": "Publicidade",
  "produtoraContratante": "Cosmo Cine",
  "agencia": "Agência XYZ",
  "creditos": { "roteiro": "Joana", "edição": "Carlos" },
  "slug": "projeto-dummy",
  "date": "2025-07-09",
  "thumbnail": "https://example.com/thumb.jpg",
  "showable": true
}
```



### GET /api/filmes/[slug]
Busca um único filme pelo slug.

Exemplo:
```json
{
    "id": "cmcwjajy50000xjw6x7m95wxh",
    "nome": "Projeto Dummy Editado",
    "cliente": "Agência ABC",
    "diretor": "Fulano Editado",
    "categoria": "Clipe",
    "produtoraContratante": "Cosmo Cine",
    "agencia": "Agência Nova",
    "creditos": {
        "direção": "Maria",
        "edição": "João"
    },
    "slug": "projeto-dummy",
    "date": "2025-08-01",
    "thumbnail": "https://example.com/updated-thumb.jpg",
    "showable": false,
    "createdAt": "2025-07-09T22:32:00.894Z",
    "updatedAt": "2025-07-09T22:33:03.739Z"
}
```


### PUT /api/filmes/[slug]
Atualiza um filme pelo slug.


### DELETE /api/filmes/[slug]
Remove o filme do banco de dados.


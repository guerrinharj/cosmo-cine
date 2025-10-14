# 🎬 Cosmo Cine

Este é um CRM (Customer Relationship Manager) feito em **Next.js** para a produtora de filmes **Cosmo Cine**. O objetivo é permitir a criação, visualização, edição e exclusão de registros de filmes (`Filme`), além de gerenciar contatos e usuários da produtora.

---

## 📁 Estrutura do Projeto

- **Framework:** Next.js (App Router)
- **Banco de Dados:** Supabase (PostgreSQL gerenciado)
- **ORM de apoio:** Prisma (usado apenas como schema local)
- **Estilização:** TailwindCSS
- **Linguagem:** TypeScript
- **Deploy recomendado:** Vercel

---

## 🛠️ Supabase + Prisma

Apesar do Prisma estar configurado no projeto com o schema dos modelos (`schema.prisma`), **todas as operações de leitura, escrita e atualização no banco são feitas diretamente via Supabase** (REST API ou client SDK).

- Prisma serve como **referência local de schema** e ajuda no planejamento e geração de tipos.
- O Supabase é quem efetivamente **armazena os dados** e responde às requisições do app.

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
NEXT_PUBLIC_SUPABASE_URL=https://<sua-instancia>.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<sua-chave-anon>
USERNAME=admin
PASSWORD=senha123
```


4. **Rode as migrações e gere o cliente Prisma inicial**
```bash
npx prisma migrate dev --name init
npx prisma generate
```


5. **Execute o servidor de desenvolvimento**
```bash
npm run dev
```

Abra http://localhost:3000 no navegador para ver o app.


## 🔐 Autenticação e Sistema de Acesso
O sistema de autenticação do Cosmo Cine CRM foi criado de forma simples, segura e modular. Ele possui dois níveis de acesso:

1. **Sessão via Login**
Usuários se autenticam via /api/auth/login, com cookie seguro (HttpOnly) armazenado por 1 hora. Esse cookie é usado para autorizar acesso a páginas protegidas.

2. **Chave de Acesso (API Key)**
Algumas rotas administrativas mais sensíveis requerem o envio de uma chave de API no header da requisição (x-api-key). Essa chave está armazenada apenas no .env do projeto e nunca é exposta ao cliente.
```env
API_KEY=sua-chave-secreta
```
Essa chave é obrigatória para registrar, deletar ou listar usuários, garantindo que somente você tenha esse controle.

3. **Tabelas Supabase**
- Filme: informações sobre os filmes produzidos
- Contato: pessoas da equipe (diretor, roteirista, etc)
- User: usuários autenticados do CRM

Certifique-se de criar políticas (RLS) e GRANT corretos para anon e authenticated conforme necessário no painel do Supabase.

4. **Segurança**
- Cookies autenticados (HttpOnly)
- API Key para rotas críticas
- Dados armazenados com permissões controladas no Supabase (RLS)
- Supabase REST API usada com permissões explícitas por role (anon, authenticated)

### 🧩 Modelo User / 🧪 Endpoints de Autenticação
#### POST /api/auth/register
Registra um novo usuário (requer header x-api-key).

```bash
curl -X POST http://localhost:3000/api/auth/register \
    -H "Content-Type: application/json" \
    -H "x-api-key: sua-chave-secreta" \
    -d '{ "username": "admin", "password": "senha123" }'
```

#### POST /api/auth/login
Realiza login e inicia uma sessão (salva cookie).

```bash
curl -X POST http://localhost:3000/api/auth/login \
    -H "Content-Type: application/json" \
    -d '{ "username": "admin", "password": "senha123" }' \
    -c cookie.txt
```

#### POST /api/auth/logout
Encerra a sessão removendo o cookie.

```bash
curl -X POST http://localhost:3000/api/auth/logout \
    -b cookie.txt
```

#### GET /api/auth/users
Retorna todos os usuários cadastrados (requer API Key).

```bash
curl http://localhost:3000/api/auth/users \
    -H "x-api-key: sua-chave-secreta"

```


## 🧩 Modelo Filme

A aplicação trabalha com um único modelo central: Filme.

| Campo                  | Tipo       | Obrigatório | Descrição                           |
| ---------------------- | ---------- | ----------- | ----------------------------------- |
| `id`                   | `String`   | Sim         | Gerado automaticamente (CUID)       |
| `nome`                 | `String`   | Sim         | Nome do projeto                     |
| `cliente`              | `String`   | Não         | Nome do cliente                     |
| `diretor`              | `String`   | Sim         | Nome do diretor                     |
| `categoria`            | `Enum`     | Sim         | Publicidade, Clipe ou Conteúdo      |
| `produtoraContratante` | `String`   | Não         | Nome da produtora contratante       |
| `agencia`              | `String`   | Não         | Nome da agência                     |
| `creditos`             | `JSON`     | Não         | Objeto com cargos e nomes           |
| `slug`                 | `String`   | Sim         | Identificador único da URL          |
| `date`                 | `String`   | Não         | Data do projeto                     |
| `thumbnail`            | `String`   | Não         | URL de imagem                       |
| `video_url`            | `String`   | Não         | URL do video                        |
| `showable`             | `Boolean`  | Não         | Define se será visível publicamente |
| `createdAt`            | `DateTime` | Sim         | Gerado automaticamente              |
| `updatedAt`            | `DateTime` | Sim         | Atualizado automaticamente          |


### 📡 Endpoints Filme da API

Abaixo estão os endpoints RESTful disponíveis:

#### GET /api/filmes
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

#### POST /api/filmes
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



#### GET /api/filmes/[slug]
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


#### PUT /api/filmes/[slug]
Atualiza um filme pelo slug.


#### DELETE /api/filmes/[slug]
Remove o filme do banco de dados.



## 🧩 Modelo Contato
A aplicação também possui um modelo para armazenar contatos associados à produção dos filmes.

| Campo                  | Tipo       | Obrigatório | Descrição                           |
| ---------------------- | ---------- | ----------- | ----------------------------------- |
| `id`                   | `String`   | Sim         | Gerado automaticamente (CUID)       |
| `nome`                 | `String`   | Sim         | Nome do contato                     |
| `email`                | `String`   | Sim         | Email do contato                    |
| `funcao`               | `String`   | Não         | Função do contato                   |
| `createdAt`            | `DateTime` | Sim         | Gerado automaticamente (CUID)       |

### 📡 Endpoints Contato da API
Abaixo estão os endpoints RESTful disponíveis para o modelo Contato:

#### GET /api/contatos
Retorna todos os contatos cadastrados.

Exemplo de resposta:

```json
[
  {
    "id": "clz91nvyi0000xjgk3b6z38qg",
    "nome": "João da Silva",
    "funcao": "Diretor de Fotografia",
    "email": "joao@email.com",
    "createdAt": "2025-07-10T18:00:00.000Z"
  }
]
```
#### POST /api/contatos
Cria um novo contato.

Body esperado (JSON):

```
json
{
  "nome": "João da Silva",
  "funcao": "Diretor de Fotografia",
  "email": "joao@email.com"
}
```

#### DELETE /api/contatos/[id]
Remove o contato do banco de dados com base no ID.

Exemplo:
```json
{
  "message": "Contato deletado com sucesso."
}
```



## Exemplos de cURL

- Em ```cosmo-cine/discovery``` você encontrara exemplos de cURL (locais) para exemplificar.
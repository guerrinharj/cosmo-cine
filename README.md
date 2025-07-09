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
API_KEY="sua-chave-secreta"
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


## 🔐 Autenticação e Sistema de Acesso
O sistema de autenticação do Cosmo Cine CRM foi criado de forma simples, segura e modular. Ele possui dois níveis de acesso:

1. **Sessão via Login**
Usuários se autenticam através de /api/auth/login, e uma sessão baseada em cookie é criada com validade de 1 hora. Esse cookie é armazenado de forma segura (HttpOnly) e identifica o usuário durante o uso do sistema.

2. **Chave de Acesso (API Key)**
Algumas rotas administrativas mais sensíveis requerem o envio de uma chave de API no header da requisição (x-api-key). Essa chave está armazenada apenas no .env do projeto e nunca é exposta ao cliente.
```env
API_KEY=sua-chave-secreta
```
Essa chave é obrigatória para registrar, deletar ou listar usuários, garantindo que somente você tenha esse controle.

3. **Observações**

A API Key é obrigatória apenas para rotas sensíveis (register, delete, list).

A sessão por cookie é usada para ações autenticadas em geral.

O arquivo de banco de dados dev.db fica local, e a chave de API nunca é exposta no frontend.

### 🧪 Endpoints de Autenticação
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

#### DELETE /api/auth/delete
Deleta um usuário (requer API Key e username no body).

```bash
curl -X DELETE http://localhost:3000/api/auth/delete \
    -H "x-api-key: sua-chave-secreta" \
    -H "Content-Type: application/json" \
    -d '{ "username": "admin" }'
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


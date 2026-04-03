# LearnHUB — Frontend

Interface React para a plataforma de cursos LearnHUB.

## Tecnologias

- **React 18** com hooks
- **Vite** como bundler
- **CSS customizado** com design system próprio (sem frameworks externos)
- Comunicação direta com o backend via fetch + JWT

## Como rodar

### 1. Instalar dependências
```bash
npm install
```

### 2. Configurar a URL do backend
```bash
cp .env.example .env
# Edite o .env e defina VITE_API_URL apontando para seu backend
```

### 3. Rodar em desenvolvimento
```bash
npm run dev
```

### 4. Build para produção
```bash
npm run build
```

---

## Estrutura do projeto

```
src/
├── context/
│   └── AuthContext.jsx     # Autenticação global (JWT, usuário, login/logout)
├── services/
│   └── api.js              # Camada de comunicação com o backend
├── pages/
│   ├── AuthPage.jsx        # Login e Cadastro
│   ├── CursosPage.jsx      # Listagem e busca de cursos
│   ├── CursoDetalhe.jsx    # Detalhe do curso + módulos + avaliações
│   ├── DashboardAluno.jsx  # Dashboard do aluno (meus cursos, progresso)
│   └── DashboardInstrutor.jsx  # Dashboard instrutor (CRUD de cursos/módulos/aulas)
├── components/
│   └── Sidebar.jsx         # Navegação lateral
├── App.jsx                 # Roteamento por estado + layout
└── App.css                 # Design system completo
```

---

## Funcionalidades por perfil

### 👩‍🎓 Aluno
- Login e cadastro
- Explorar e buscar cursos disponíveis
- Inscrever-se em cursos
- Ver progresso por curso (%)
- Marcar aulas como concluídas
- Avaliar cursos com nota (1-10) e comentário

### 🏫 Instrutor
- Login e cadastro
- Criar, editar e deletar cursos
- Adicionar módulos aos cursos
- Adicionar aulas aos módulos (com tipo: vídeo, texto, PDF)
- Explorar todos os cursos da plataforma

---

## Variáveis de ambiente

| Variável | Descrição | Padrão |
|---|---|---|
| `VITE_API_URL` | URL base do backend | `http://localhost:3000` |

---

## Observações sobre o backend

O frontend foi construído com base na documentação do backend LearnHUB. Alguns pontos:

- O token JWT retornado no login deve conter `id` e `tipo` no payload
- A rota `GET /cursos` deve retornar `instrutor_id` em cada curso para o filtro no dashboard do instrutor
- A rota `GET /cursos/:id` deve retornar os módulos com suas aulas incluídas

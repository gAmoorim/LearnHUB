# 📚 LearnHUB

> Plataforma de cursos para aprendizado

O **LearnHUB** é uma plataforma de cursos online para conectar instrutores e alunos, com recursos de inscrição, progresso e avaliações.

---

## 📦 Funcionalidades

- Cadastro e login de alunos ou instrutores (aluno/instrutor)
- Gerenciamento de cursos, módulos e aulas
- Inscrição de alunos em cursos
- Progresso de aprendizado por aula
- Avaliações e comentários em cursos
- Estrutura pronta para expandir com frontend

---

## 🔐 Autenticação

- JWT para proteger rotas privadas
- Senhas criptografadas com bcrypt

---

## 🧩 Tecnologias Utilizadas

- Node.js → Express → API backend
- PostgreSQL → Banco de dados relacional
- JWT (JSON Web Token) → Autenticação
- bcrypt → Criptografia de senhas
- Knex.js 
- .env

### 🚀 Como rodar o projeto
```
# Clone este repositório
git clone https://github.com/gAmoorim/LearnHub.git

# Acesse a pasta do projeto
cd LearnHub

# Instale as dependências
npm install

# Configure as variáveis de ambiente
# crie um arquivo .env e adicione os dados do banco e JWT_SECRET

# Inicie o servidor
npm run dev
```

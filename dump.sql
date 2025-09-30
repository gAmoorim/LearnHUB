create database learnhub;

CREATE TABLE usuarios (
    id SERIAL PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    email VARCHAR(150) UNIQUE NOT NULL,
    senha VARCHAR(255) NOT NULL,
    tipo VARCHAR(20) NOT NULL CHECK (tipo IN ('aluno', 'instrutor')),
    criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE cursos (
    id SERIAL PRIMARY KEY,
    titulo VARCHAR(200) NOT NULL,
    descricao TEXT NOT NULL,
    preco NUMERIC(10,2) DEFAULT 0,
    instrutor_id INT NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
    criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE modulos (
    id SERIAL PRIMARY KEY,
    titulo VARCHAR(200) NOT NULL,
    curso_id INT NOT NULL REFERENCES cursos(id) ON DELETE CASCADE,
    criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE aulas (
    id SERIAL PRIMARY KEY,
    titulo VARCHAR(200) NOT NULL,
    conteudo TEXT NOT NULL,
    tipo VARCHAR(20) NOT NULL CHECK (tipo IN ('video', 'texto', 'pdf')),
    modulo_id INT NOT NULL REFERENCES modulos(id) ON DELETE CASCADE,
    criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE inscricoes (
    id SERIAL PRIMARY KEY,
    aluno_id INT NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
    curso_id INT NOT NULL REFERENCES cursos(id) ON DELETE CASCADE,
    data_inscricao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (aluno_id, curso_id) -- evita duplicar inscrição
);

CREATE TABLE progresso (
    id SERIAL PRIMARY KEY,
    aluno_id INT NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
    aula_id INT NOT NULL REFERENCES aulas(id) ON DELETE CASCADE,
    concluido BOOLEAN DEFAULT FALSE,
    atualizado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (aluno_id, aula_id) -- garante 1 registro por aluno/aula
);

CREATE TABLE avaliacoes (
    id SERIAL PRIMARY KEY,
    curso_id INT NOT NULL REFERENCES cursos(id) ON DELETE CASCADE,
    aluno_id INT NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
    nota INT NOT NULL CHECK (nota BETWEEN 1 AND 10),
    comentario TEXT,
    criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
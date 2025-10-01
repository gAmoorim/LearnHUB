const knex = require('../connection')

const queryVerificarInstrutor = async (instrutorId) => {
    return await knex('usuarios')
    .where({id: instrutorId, tipo: 'instrutor'})
    .first()
}

const queryCadastrarCurso = async (titulo, descricao, preco, categoria, instrutorId) => {
    return await knex('cursos')
    .insert({titulo, descricao, preco, categoria, instrutor_id: instrutorId})
    .returning('*')
}

const queryListarCursos = async (categoria, instrutor, preco ) => {
    let query = knex('cursos').select('*')

    if (categoria) {
        query = query.where('categoria', 'ilike', `%${categoria}%`);
    }

    if (instrutor) {
        query = knex('usuarios').where('nome', 'ilike', `%${instrutor}%`)
    }

    if (preco) {
        query = query.where('preco', '<=', preco)
    }
    return query
}

const queryObterCursoPorId = async (id) => {
  const curso = await knex('cursos')
    .select('id', 'titulo', 'descricao', 'categoria', 'preco')
    .where({ id })
    .first()

  const modulos = await knex('modulos')
    .select('id', 'titulo')
    .where({ curso_id: id })

  const aulas = await knex('aulas')
  .select('id', 'titulo', 'conteudo', 'modulo_id')

  const avaliacoes = await knex('avaliacoes')
    .select('id', 'aluno_id', 'nota', 'comentario')
    .where({ curso_id: id })

  curso.modulos = modulos;
  curso.avaliacoes = avaliacoes;
  curso.aulas = aulas

  return curso
}


module.exports = {
    queryVerificarInstrutor,
    queryCadastrarCurso,
    queryListarCursos,
    queryObterCursoPorId
}
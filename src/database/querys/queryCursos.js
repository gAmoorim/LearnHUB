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

const queryCursoPertencente = async (instrutorId, cursoId) => {
  return await knex('cursos')
  .where({instrutor_id: instrutorId, id: cursoId})
  .first()
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

const queryObterCursoPorId = async (cursoId) => {
  const curso = await knex('cursos')
  .where({ id: cursoId })
  .select('id', 'titulo', 'descricao', 'categoria', 'preco')
  .first()

  if (!curso) {
    return null
  }

  const modulos = await knex('modulos')
  .where({ curso_id: cursoId })
  .select('id', 'titulo')

  const aulas = await knex('aulas')
  .select('id', 'titulo', 'conteudo', 'modulo_id')

  const avaliacoes = await knex('avaliacoes')
  .select('id', 'aluno_id', 'nota', 'comentario')
  .where({ curso_id: cursoId })

  curso.modulos = modulos;
  curso.avaliacoes = avaliacoes;
  curso.aulas = aulas

  return curso
}

const queryAtualizarCurso = async (titulo, descricao, preco, cursoId) => {
  return await knex('cursos')
  .update({ titulo, descricao, preco})
  .where({id: cursoId})
  .returning(['titulo', 'descricao', 'preco'])
}

const queryDeletarCurso = async (cursoId) => {
  return await knex('cursos')
  .where({id: cursoId})
  .del()
}

const queryVerificarCursoExistente = async (cursoId) => {
  return await knex('cursos')
  .where({ id: cursoId })
  .first()
}

module.exports = {
  queryVerificarInstrutor,
  queryCadastrarCurso,
  queryListarCursos,
  queryObterCursoPorId,
  queryCursoPertencente,
  queryAtualizarCurso,
  queryDeletarCurso,
  queryVerificarCursoExistente
}
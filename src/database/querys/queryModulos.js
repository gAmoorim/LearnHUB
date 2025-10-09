const knex = require('../connection')

const queryCadastrarModulo = async (titulo, cursoId) => {
    return await knex('modulos')
    .insert({titulo, curso_id: cursoId})
    .returning(['titulo', 'curso_id'])
}

const queryModuloExistente = async(cursoId, titulo) => {
    return await knex('modulos')
    .where({curso_id: cursoId, titulo})
    .first()
}

const queryListarModulosPorCurso = async (cursoId) => {
  return await knex('modulos')
  .where({ curso_id: cursoId })
  .select('id', 'titulo')
}

const queryBuscarAulasPorModulos = async (modulosIds) => {
    return await knex('aulas')
    .whereIn("modulo_id", modulosIds)
    .select('id', 'titulo', 'conteudo', 'modulo_id')
}

module.exports = {
    queryCadastrarModulo,
    queryModuloExistente,
    queryListarModulosPorCurso,
    queryBuscarAulasPorModulos
}
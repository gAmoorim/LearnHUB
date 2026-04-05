const knex = require('../connection')

const queryCadastrarAula = async (titulo, conteudo, tipo, moduloId, cursoId) => {
    return await knex('aulas')
    .insert({titulo, conteudo, tipo, modulo_id: moduloId, curso_id: cursoId})
    .returning('*')
}

const queryListarAulasPorModulo = async (moduloId) => {
    return await knex('aulas')
    .where({modulo_id: moduloId})
}

const queryAtualizarAula = async (aulaId, titulo, conteudo, tipo) => {
    return await knex('aulas')
    .where({ id: aulaId})
    .update({titulo, conteudo, tipo})
    .returning([ 'titulo', 'conteudo', 'tipo' ])
}

const queryObterAulaPorId = async (aulaId) => {
    return await knex('aulas')
    .where({id: aulaId})
    .first()
}

const queryDeletarAula = async (aulaId) =>{
    return knex('aulas')
    .where({ id: aulaId})
    .del()
}

const queryBuscarCursoPorAula = async (aulaId) => {
  return await knex('aulas')
  .where({id: aulaId})
  .select('curso_id')
  .first()
}

module.exports = {
    queryCadastrarAula,
    queryListarAulasPorModulo,
    queryObterAulaPorId,
    queryAtualizarAula,
    queryBuscarCursoPorAula,
    queryDeletarAula
}
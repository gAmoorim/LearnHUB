const knex = require('../connection')

const queryCadastrarAula = async (titulo, conteudo, tipo, moduloId, cursoId) => {
    return await knex('aulas')
    .insert({titulo, conteudo, tipo, modulo_id: moduloId, curso_id: cursoId})
    .returning('*')
}

const queryListarAulasPorModulo = async (moduloId) => {
    return await knex('aulas')
    .where({modulo_id: moduloId})
    .select('*')
}

const queryObterAulaPorId = async (aulaId) => {
    return await knex('aulas')
    .where({id: aulaId})
    .first()
}

module.exports = {
    queryCadastrarAula,
    queryListarAulasPorModulo,
    queryObterAulaPorId
}
const knex = require('../connection')

const queryCadastrarAula = async (titulo, conteudo, tipo, moduloId) => {
    return await knex('aulas')
    .insert({titulo, conteudo, tipo, modulo_id: moduloId})
    .returning('*')
}

const queryListarAulasPorModulo = async (moduloId) => {
    return await knex('aulas')
    .where({modulo_id: moduloId})
    .select('*')
}

module.exports = {
    queryCadastrarAula,
    queryListarAulasPorModulo
}
const knex = require('../connection')

const queryCadastrarAula = async (titulo, conteudo, tipo, moduloId) => {
    return await knex('aulas')
    .insert({titulo, conteudo, tipo, modulo_id: moduloId})
    .returning('*')
}

module.exports = {
    queryCadastrarAula
}
const knex = require('../connection')

const queryVerificarInstrutor = async (instrutorId) => {
    return await knex('usuarios')
    .where({id: instrutorId, tipo: 'instrutor'})
    .first()
}

const queryCadastrarCurso = async (titulo, descricao, preco, instrutorId) => {
    return await knex('cursos')
    .insert({titulo, descricao, preco, instrutor_id: instrutorId})
    .returning('*')
}

module.exports = {
    queryVerificarInstrutor,
    queryCadastrarCurso
}
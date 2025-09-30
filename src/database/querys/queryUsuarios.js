const knex = require("../connection")

const queryBuscarUsuarioPeloEmail = async (email) => {
    return await knex('usuarios')
    .where({email})
    .first()
}

const queryCadastrarNovoUsuario = async (nome, email, tipo, senhaCriptografada) => {
    return await knex('usuarios')
    .insert({nome, email, tipo, senha: senhaCriptografada})
    .returning('*')
}

const queryBuscarUsuarioPeloId = async (id) => {
    return await knex('usuarios')
    .where({id})
    .first()
}

const queryListarUsuarios = async () => {
    return await knex('usuarios')
    .select('id', 'nome', 'email', 'tipo', 'criado_em')
}

module.exports = {
    queryBuscarUsuarioPeloEmail,
    queryCadastrarNovoUsuario,
    queryBuscarUsuarioPeloId,
    queryListarUsuarios
}
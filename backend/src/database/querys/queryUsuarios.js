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

const queryAtualizarUsuario = async (usuarioId, nome, email) =>{
    return await knex('usuarios')
    .where({id: usuarioId})
    .update({nome, email})
    .returning(['id', 'nome', 'email'])
}

const queryAtualizarSenhaUsuario = async (id, senhaHash) => {
    return await knex('usuarios')
    .where({id})
    .update({ senha: senhaHash })
}

const queryListarUsuarios = async () => {
    return await knex('usuarios')
    .select('id', 'nome', 'email', 'tipo', 'criado_em')
}

const queryDeletarUsuario = async (id) => {
    return await knex('usuarios')
    .where({id})
    .del()
}

module.exports = {
    queryBuscarUsuarioPeloEmail,
    queryCadastrarNovoUsuario,
    queryBuscarUsuarioPeloId,
    queryListarUsuarios,
    queryDeletarUsuario,
    queryAtualizarUsuario,
    queryAtualizarSenhaUsuario
}
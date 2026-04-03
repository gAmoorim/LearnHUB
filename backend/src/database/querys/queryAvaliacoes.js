const knex = require('../connection')

const queryCriarAvaliacao = async (nota, comentario, cursoId, alunoId) => {
    return await knex('avaliacoes')
    .insert({ nota, comentario, curso_id: cursoId, aluno_id: alunoId })
    .returning('*')
}

const queryListarAvaliacoesDoCurso = async (cursoId) => {
    return await knex('avaliacoes')
    .where({ curso_id: cursoId})
}

module.exports = {
    queryCriarAvaliacao,
    queryListarAvaliacoesDoCurso
}
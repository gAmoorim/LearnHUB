const knex = require('../connection')

const queryInscreverNoCurso = async (alunoId, cursoId) => {
    return await knex('inscricoes')
    .insert({aluno_id: alunoId, curso_id: cursoId})
    .returning('*')
}

const queryInscricaoExistente = async (alunoId, cursoId) => {
    return await knex('inscricoes')
    .where({aluno_id: alunoId, curso_id :cursoId})
    .first()
}

const queryListarCursosInscritos = async (alunoId) => {
  return await knex('inscricoes')
    .join('cursos', 'inscricoes.curso_id', '=', 'cursos.id')
    .where({ 'inscricoes.aluno_id': alunoId })
    .select(
      'inscricoes.curso_id',
      'cursos.titulo as nome_curso',
      'inscricoes.data_inscricao'
    )
}

module.exports = {
    queryInscreverNoCurso,
    queryInscricaoExistente,
    queryListarCursosInscritos
}
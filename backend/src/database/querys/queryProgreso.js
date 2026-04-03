const knex = require('../connection')

const queryMarcarAulaConcluida = async (alunoId, aulaId) => {
    return await knex('progresso')
    .insert({
        aluno_id: alunoId,
        aula_id: aulaId,
        concluido: true
    })
    .onConflict(['aluno_id', 'aula_id'])
    .merge({
        concluido: true
    })
    .returning('*')
}

const queryCalcularTotalAulas = async (cursoId) => {
  const result = await knex('aulas')
    .where({ curso_id: cursoId})
    .count('* as total')
    .first()

  return Number(result.total)
}


const queryCalcularAulasConcluidas = async (cursoId, alunoId) => {
  const result = await knex('progresso')
    .join('aulas', 'aulas.id', 'progresso.aula_id')
    .where({
      'aulas.curso_id': cursoId,
      'progresso.aluno_id': alunoId,
      'progresso.concluido': true,
    })
    .count('* as concluidas')
    .first()

  return Number(result.concluidas)
}


module.exports = {
    queryMarcarAulaConcluida,
    queryCalcularTotalAulas,
    queryCalcularAulasConcluidas
}
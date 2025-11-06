const { queryCadastrarAula, queryListarAulasPorModulo } = require("../database/querys/queryAulas")
const { queryBuscarCursoPorModulo } = require("../database/querys/queryModulos")

const controllerCadastrarAula = async (req, res) => {
  //conteúdo (link/texto/pdf), tipo(video, texto, pdf)
  const {titulo, conteudo, tipo} = req.body
  const { moduloId } = req.params

  if (!titulo || !conteudo || !tipo) {
    return res.status(400).json({ mensagem: 'Preencha os campos necessários'})
  }

  if (tipo) {
    if (tipo !== 'video' && tipo !== 'texto' && tipo !== 'pdf' ) {
      return res.status(400).json({ error: 'o tipo deve ser apenas: video, texto ou pdf'})
    }
  }

  if (!moduloId) {
    return res.status(400).json({ mensagem: 'informe o id do módulo'})
  }

  // VER COMO ACEITAR PDF E VIDEO NO CONTEUDO
  try {
    const curso = await queryBuscarCursoPorModulo(moduloId)

    if (!curso) {
      return res.status(400).json({ error: 'Módulo não encontrado ou sem curso associado'})
    }

    const cursoId = curso.curso_id

    const novaAula = await queryCadastrarAula(titulo, conteudo, tipo, moduloId, cursoId)

    return res.status(201).json({ mensagem: 'Nova aula cadastrada',
      aula: novaAula
    })
  } catch (error) {
    console.log('Ocorreu um erro ao cadastrar a Aula', error)
    return res.status(500).json({ error: `Erro ao cadastrar a Aula: ${error.message}`})
  }
}

const controllerListarAulas = async (req, res) => {
  const {moduloId} = req.params

  if (!moduloId) {
    return res.status(400).json({ error: 'Informe o id do módulo'})
  }

  try {
    const aulas = await queryListarAulasPorModulo(moduloId)

    if (!aulas) {
      return res.status(404).json({ error: 'Nenhuma aula encontrada'})
    }

    return res.status(200).json({ mensagem: 'Aulas encontradas', 
      aulas
    })
  } catch (error) {
    console.log('Ocorreu um erro ao listar as Aulas', error)
    return res.status(500).json({ error: `Erro ao listar as Aulas: ${error.message}`})
  }
}

module.exports = {
  controllerCadastrarAula,
  controllerListarAulas
}
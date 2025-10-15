const { queryCadastrarAula } = require("../database/querys/queryAulas")

const controllerCadastrarAula = async (req, res) => {
   //Body: título, conteúdo (link/texto/pdf), tipo(video, texto, pdf)
    const {titulo, conteudo, tipo} = req.body

    if (!titulo || !conteudo || !tipo) {
        return res.status(400).json({ mensagem: 'Preencha os campos necessários'})
    }

    if (tipo) {
        if (tipo !== 'video' && tipo !== 'texto' && tipo !== 'pdf' ) {
            return res.status(400).json({ error: 'o tipo deve ser apenas: video, texto ou pdf'})
        }
    }

    // VER COMO ACEITAR PDF E VIDEO NO CONTEUDO
    try {
      const { moduloId } = req.params

      if (!moduloId) {
        return res.status(400).json({ mensagem: 'informe o id do módulo'})
      }

      const novaAula = await queryCadastrarAula(titulo, conteudo, tipo, moduloId)

      return res.status(201).json({ mensagem: 'Nova aula cadastrada',
        aula: novaAula
      })
    } catch (error) {
        console.log('Ocorreu um erro ao cadastrar a Aula', error)
        return res.status(500).json({ error: `Erro ao cadastrar a Aula: ${error.message}`})
    }
}

module.exports = {
  controllerCadastrarAula
}
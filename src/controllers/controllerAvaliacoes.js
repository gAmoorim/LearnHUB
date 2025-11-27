const { queryCriarAvaliacao, queryListarAvaliacoesDoCurso } = require("../database/querys/queryAvaliacoes")
const { queryInscricaoExistente } = require("../database/querys/queryInscricoes")

const controllerAvaliarCurso = async (req, res) => {
    const { nota, comentario } = req.body

    if (!nota) {
        return res.status(400).json({ error: 'informe a nota'})
    }

    const { cursoId } = req.params

    if (!cursoId) {
        return res.status(400).json({ error: 'Inform o id do curso'})
    }

    try {
        const alunoId = req.usuario.id

        const alunoInscrito = await queryInscricaoExistente(alunoId, cursoId)

        if (!alunoInscrito) {
            return res.status(400).json({ error: 'aluno não inscrito no curso'})
        }

        if (typeof nota !== "number" || nota < 1 || nota > 10) {
            return res.status(400).json({ error: 'A nota tem que ser de 1 a 10' });
        }

        const criarAvaliacao = await queryCriarAvaliacao(nota, comentario, cursoId, alunoId)

        return res.status(201).json({ mensagem: 'Avaliaçã criada',
            avaliacao: criarAvaliacao
        })
    } catch (error) {
        console.log('Ocorreu um erro ao avaliar o curso', error)
        return res.status(500).json({ error: `Erro ao avaliar o curso: ${error.message}`})
    }
}

const controllerListarAvaliacoesDoCurso = async (req, res) => {
    const { cursoId } = req.params

    if (!cursoId) {
        return res.status(400).json({ error: 'Informe o id do curso'})
    }

    try {
        const avaliacoesDoCurso = await queryListarAvaliacoesDoCurso(cursoId)

        if (!avaliacoesDoCurso) {
            return res.status(404).json({ error: 'Nenhuma avaliação encontrada'})
        }

        return res.status(200).json({ mensagem: 'Avaliações do curso',
            avaliações: avaliacoesDoCurso
        })
    } catch (error) {
        console.log('Ocorreu um erro ao ', error)
        return res.status(500).json({ error: `Erro ao cadastrar o módulo: ${error.message}`})
    }
}

module.exports = {
    controllerAvaliarCurso,
    controllerListarAvaliacoesDoCurso
}
const { queryVerificarCursoExistente } = require("../database/querys/queryCursos")
const { queryInscreverNoCurso, queryInscricaoExistente, queryListarCursosInscritos } = require("../database/querys/queryInscricoes")

const controllerInscreverseNoCurso = async (req, res) => {
    const {cursoId} = req.params

    if (!cursoId) {
        return res.status(400).json({ error: 'Id do curso não informado'})
    }

    const alunoId = req.usuario.id

    if (!alunoId) {
        return res.status(400).json({ error: 'Não foi possível obter o id do aluno'})
    }

    try {
        const curso = await queryVerificarCursoExistente(cursoId)

        if (!curso) {
            return res.status(404).json({ error: 'Curso não existe ou não foi encontrado'})
        }
        
        const buscarInscricao = await queryInscricaoExistente(alunoId, cursoId)

        if (buscarInscricao) {
            return res.status(400).json({ error: 'Voce já esta inscrito neste curso'})
        }

        const novaInscricao = await queryInscreverNoCurso(alunoId, cursoId)

        if (!novaInscricao) {
            return res.status(400).json({ error: 'ocorreu um erro ao se inscrever'})
        }

        return res.status(200).json({ mensagem: 'Inscrição concluída',
            inscricao: novaInscricao
        })
    } catch (error) {
        console.error("Ocorreu um erro ao se inscrever:", error)
        return res.status(500).json({ error: `Erro ao se inscrever: ${error.message}`})
    }
}

const controllerListarInscricoes = async (req, res) => {
    const alunoId = req.usuario.id
    
    if (!alunoId) {
        return res.status(400).json({ error: 'Não foi possivel obter o id do aluno'})
    }

    try {
        const cursosInscritos = await queryListarCursosInscritos(alunoId)

        if (!cursosInscritos) {
            return res.status(404).json({ error: 'Nenhuma inscrição encontrada'})
        }

        return res.status(200).json({ mensagem: 'Cursos inscritos',
            cursos: cursosInscritos
        })
    } catch (error) {
        console.error("Ocorreu um erro ao listar as inscrições:", error)
        return res.status(500).json({ error: `Erro ao listar as inscrições: ${error.message}`})
    }
}

module.exports = {
    controllerInscreverseNoCurso,
    controllerListarInscricoes
}
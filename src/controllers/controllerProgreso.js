const { queryObterAulaPorId } = require("../database/querys/queryAulas")
const { queryVerificarInscricaoPelaAula } = require("../database/querys/queryInscricoes")
const { queryMarcarAulaConcluida, queryCalcularTotalAulas, queryCalcularAulasConcluidas } = require("../database/querys/queryProgreso")

const controllerMarcarAulaConcluida = async (req, res) => {
    const {aulaId} = req.params

    if (!aulaId) {
        return res.status(400).json({ error: 'Não foi possível obter o id da aula'})
    }

    const alunoId = req.usuario.id

    if (!alunoId) {
        return res.status(400).json({ error: 'Não foi possível obter o id do aluno'})
    }

    try { 
        const aula = await queryObterAulaPorId(aulaId)

        if (!aula) {
            return res.status(404).json({ error: 'Aula não encontrada'})
        }

        const cursoId = aula.curso_id

        if (!cursoId) {
            return res.status(400).json({ error: 'Não foi possível obter o id do curso'})
        }

        const inscricao = await queryVerificarInscricaoPelaAula(alunoId, cursoId)

        if (!inscricao) {
            return res.status(403).json({ mensagem: 'Aluno não inscrito no curso' });
        }

        const AulaConcluida = await queryMarcarAulaConcluida(alunoId, aulaId)

        return res.status(200).json({ mensagem: 'Aula marcada como concluída',
            progresso: AulaConcluida
        })
    } catch (error) {
        console.error("Ocorreu um erro ao tentar marcar a aula como concluída:", error)
        return res.status(500).json({ error: `Erro ao tentar marcar a aula como concluída: ${error.message}`})
    }
}

const controllerObterProgressoCurso = async (req, res) => {
    const { cursoId } = req.params

    if (!cursoId) {
        return res.status(400).json({ error: 'Não foi possível obter o id do curso'})
    }

    const alunoId = req.usuario.id

    if (!alunoId) {
        return res.status(400).json({ error: 'Não foi possível obter o id do aluno'})
    }

    try {
        const totalAulas = await queryCalcularTotalAulas(cursoId)

        console.log('total de aulas', totalAulas)

        if (totalAulas === 0) {
            return res.status(200).json({ percentual: 0})
        }

        const aulasConcluidas = await queryCalcularAulasConcluidas(cursoId, alunoId)

        console.log('concluidas', aulasConcluidas)

        if (!aulasConcluidas) {
            return res.status(400).json({ error: 'Nenhuma aula concluida'})
        }

        const percentual = Math.round((totalAulas / aulasConcluidas) * 100)

        return res.status(200).json({ percentual })
    } catch (error) {
        console.error("Ocorreu um erro ao tentar obter o progresso do curso:", error)
        return res.status(500).json({ error: `Erro ao tentar obter o progresso do curso: ${error.message}`})
    }
}

module.exports = {
    controllerMarcarAulaConcluida,
    controllerObterProgressoCurso
}
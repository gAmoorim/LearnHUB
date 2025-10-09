const { queryVerificarInstrutor, queryCadastrarCurso, queryListarCursos, queryObterCursoPorId, queryCursoPertencente, queryAtualizarCurso, queryDeletarCurso } = require("../database/querys/queryCursos")

const controllerCadastrarCurso = async (req, res) => {
    const { titulo, descricao, preco, categoria } = req.body

    if (!titulo || !descricao) {
        return res.status(400).json({ error: 'Preencha os campos necessários'})
    }

    try {
        const instrutorId = req.usuario.id

        const verificarInstrutor = await queryVerificarInstrutor(instrutorId)

        if (!verificarInstrutor) {
            return res.status(400).json({ error: 'Apenas instrutores podem criar cursos'})
        }

        const novoCurso = await queryCadastrarCurso(titulo, descricao, preco, categoria, instrutorId)

        return res.status(201).json({
            mensagem: 'Novo curso criado',
            curso: novoCurso
        })
    } catch (error) {
        console.error("Ocorreu um erro ao criar um novo curso:", error)
        return res.status(500).json({ error: `Erro ao criar um novo curso: ${error.message}`})
    }
}

const controllerListarCursos = async (req, res) => {
    const { categoria, instrutor, preco } = req.query

    try {
        const cursos = await queryListarCursos(categoria, instrutor, preco)

        if (cursos.length === 0) {
            return res.status(404).json({ error: 'Nenhum curso encontrado'})
        }

        return res.status(200).json({mensagem: 'Cursos encontrados',
            cursos})
    } catch (error) {
        console.error("Ocorreu ao listar os cursos:", error)
        return res.status(500).json({ error: `Erro ao listar os cursos: ${error.message}`})
    }
}

const controllerObterCurso = async (req, res) => {
    const {cursoId} = req.params

    if (!cursoId) {
        return res.status(400).json({ error: 'Informe o id do curso'})
    }

    try {
        const curso = await queryObterCursoPorId(cursoId)

        if (!curso) {
            return res.status(404).json({ error: 'Curso não encontrado'})
        }

        return res.status(200).json({ mensagem: 'Curso encontrado',
            curso: [curso]
        })
    } catch (error) {
        console.log('Ocorreu um erro ao obter o curso', error)
        return res.status(500).json({ error: `Erro ao listar os cursos: ${error.message}`})
    }
}

const controllerAtualizarCurso = async (req, res) => {
    const { titulo, descricao, preco } = req.body

    if (!titulo && !descricao && !preco) {
        return res.status(400).json({ error: 'Envie o campo para ser atualizado'})
    }

    const { cursoId } = req.params

    if (!cursoId) {
        return res.status(400).json9({ error: 'Informe o id do curso'})
    }

    try {
        const instrutorId = req.usuario.id
        const cursoPertencente = await queryCursoPertencente(instrutorId, cursoId)

        if (!cursoPertencente) {
            return res.status(400).json({ error: 'id do curso ou do instrutor incorreto'})
        }

        const cursoAtualizado = await queryAtualizarCurso(titulo, descricao, preco, cursoId)

        return res.status(200).json({ mensagem: 'Curso atualizado com sucesso',
            cursoAtualizado
        })
    } catch (error) {
        console.log('Ocorreu um erro ao atualizar o curso', error)
        return res.status(500).json({ error: `Erro ao atualizar os cursos: ${error.message}`})
    }
}

const controllerDeletarCurso = async(req, res) => {
    const { cursoId } = req.params

    if (!cursoId) {
        return res.status(400).json({ error: 'Informe o id do curso'})
    }

    try {
        const instrutorId = req.usuario.id

        const curso = await queryObterCursoPorId(cursoId)

        if (!curso) {
            return res.status(404).json({ mensagem: 'Curso não encontrado'})
        }

        const cursoPertencente = await queryCursoPertencente(instrutorId, cursoId)

        if (!cursoPertencente) {
            return res.status(400).json({ error: 'id do curso ou do instrutor incorreto'})
        }

        await queryDeletarCurso(cursoId)

        return res.status(200).json({ mensagem: 'Curso deletado com sucesso'})
    } catch (error) {
        console.log('Ocorreu um erro ao deletar o curso', error)
        return res.status(500).json({ error: `Erro ao deletar os cursos: ${error.message}`})
    }
}

module.exports = {
    controllerCadastrarCurso,
    controllerListarCursos,
    controllerObterCurso,
    controllerAtualizarCurso,
    controllerDeletarCurso
}
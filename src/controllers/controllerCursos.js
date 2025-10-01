const { queryVerificarInstrutor, queryCadastrarCurso, queryListarCursos, queryObterCursoPorId } = require("../database/querys/queryCursos")

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
    const {id} = req.params

    if (!id) {
        return res.status(400).json({ error: 'insira o id do curso'})
    }

    try {
        const curso = await queryObterCursoPorId(id)

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

module.exports = {
    controllerCadastrarCurso,
    controllerListarCursos,
    controllerObterCurso
}
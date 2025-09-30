const { queryVerificarInstrutor, queryCadastrarCurso } = require("../database/querys/queryCursos")

const controllerCadastrarCurso = async (req, res) => {
    const { titulo, descricao, preco } = req.body

    if (!titulo || !descricao) {
        return res.status(400).json({ error: 'Preencha os campos necessários'})
    }

    try {
        const {id} = req.usuario

        const instrutorId = id

        const verificarInstrutor = await queryVerificarInstrutor(instrutorId)

        if (!verificarInstrutor) {
            return res.status(400).json({ error: 'Apenas instrutores podem criar cursos'})
        }

        const novoCurso = await queryCadastrarCurso(titulo, descricao, preco, instrutorId)

        return res.status(201).json({
            mensagem: 'Novo curso criado',
            curso: novoCurso
        })
    } catch (error) {
        console.error("Ocorreu um erro ao criar um novo curso:", error)
        return res.status(500).json({ error: `Erro ao criar um novo curso: ${error.message}`})
    }
}

module.exports = {
    controllerCadastrarCurso
}
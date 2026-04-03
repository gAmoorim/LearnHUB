const { queryCursoPertencente } = require("../database/querys/queryCursos")
const { queryCadastrarModulo, queryModuloExistente, queryListarModulos, queryListarModulosPorCurso, queryBuscarAulasPorModulos } = require("../database/querys/queryModulos")

const controllerCadastrarModulo = async (req,res) => {
    const { titulo } = req.body

    if (!titulo) {
        return res.status(400).json({ error: 'Informe o titulo do Módulo'})
    }

    const { cursoId } = req.params

    if (!cursoId) {
        return res.status(400).json({ error: 'Informe o id do curso'})
    }
    
    try {
        const instrutorId = req.usuario.id
        
        const cursoPertencente = await queryCursoPertencente(instrutorId, cursoId)

        if (!cursoPertencente) {
            return res.status(404).json({ error: 'Este curso não existe ou não pertence ao instrutor'})
        }

        const moduloExistente = await queryModuloExistente(cursoId, titulo)

        if (moduloExistente) {
            return res.status(400).json({ error: 'Este módulo já existe'})
        }

        const novoModulo = await queryCadastrarModulo(titulo, cursoId)

        return res.status(201).json({ mensagem: 'Novo modulo criado',
            curso: novoModulo
        })
    } catch (error) {
        console.log('Ocorreu um erro ao cadastrar o módulo', error)
        return res.status(500).json({ error: `Erro ao cadastrar o módulo: ${error.message}`})
    }
}

const controllerListarModulos = async (req, res) => {
    const { cursoId } = req.params

    if (!cursoId) {
        return res.status(400).json({ error: 'Informe o id do curso'})
    }

    try {
        const modulos = await queryListarModulosPorCurso(cursoId)

        if (modulos.length === 0) {
            return res.status(404).json({ mensagem: "Nenhum módulo encontrado para este curso" });
        }

        const modulosIds = modulos.map(m => m.id)
        const aulas = await queryBuscarAulasPorModulos(modulosIds)

        const resultado = modulos.map(modulo => ({
            ...modulo,
            aulas: aulas.filter(aula => aula.modulo_id === modulo.id)
        }))

        return res.status(200).json(resultado)
    } catch (error) {
        console.log('Ocorreu um erro ao listar os módulos', error)
        return res.status(500).json({ error: `Erro ao listar os módulos: ${error.message}`})
    }
}

module.exports = {
    controllerCadastrarModulo,
    controllerListarModulos
}
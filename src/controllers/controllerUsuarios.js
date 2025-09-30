const { queryBuscarUsuarioPeloEmail, queryCadastrarNovoUsuario, queryListarUsuarios } = require("../database/querys/queryUsuarios")
const { validarEmail } = require("../utils/validations")
const bcrypt = require('bcrypt')

const controllerCadastrarUsuario = async (req,res) => {
    const { nome, email, senha, tipo } = req.body

    if (!nome || !email || !senha || !tipo) {
        return res.status(400).json({ error: 'Preencha os campos necessários'})
    }

    if (tipo !== 'aluno' && tipo !== 'instrutor') {
        return res.status(400).json({ error: 'Tipo deve ser aluno ou instrutor'})
    }

    if (senha.length < 6) {
        return res.status(400).json({ error: 'A senha deve ter no mínimo 6 caracteres'})
    }

    if (!validarEmail(email)) {
        return res.status(400).json({ error: 'Formato do email inválido' })
    }

    try {
        const verificarEmailExistente = await queryBuscarUsuarioPeloEmail(email)

        if (verificarEmailExistente) {
            return res.status(400).json({ error: 'Já existe um usuário cadastrado com esse email'})
        }

        const senhaCriptografada = await bcrypt.hash(senha, 10)

        await queryCadastrarNovoUsuario(nome, email, tipo, senhaCriptografada)

        return res.status(201).json({ mensagem: 'Usuário criado',
            usuario: {nome, email, tipo}
        })
    } catch (error) {
        console.error("Ocorreu um erro ao cadastrar o usuário:", error)
        return res.status(500).json({ error: `Erro ao cadastrar usuário: ${error.message}`})
    }
}

const controllerListarUsuarios = async (req, res) => {
    //(Restrito a admin futuramente)
    
    try {
        const usuarios = await queryListarUsuarios()

        if (!usuarios) {
            return res.status(404).json({ error: 'Nenhum usuário encontrado'})
        }

        return res.status(200).json(usuarios)
    } catch (error) {
        console.error("Ocorreu um erro ao listar os usuários:", error)
        return res.status(500).json({ error: `Erro ao listar os usuários: ${error.message}`})
    }
}

module.exports = {
    controllerCadastrarUsuario,
    controllerListarUsuarios
}
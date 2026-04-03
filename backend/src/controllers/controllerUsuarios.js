const { queryBuscarUsuarioPeloEmail, queryCadastrarNovoUsuario, queryListarUsuarios, queryBuscarUsuarioPeloId, queryDeletarUsuario, queryAtualizarUsuario, queryAtualizarSenhaUsuario } = require("../database/querys/queryUsuarios")
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
    const usuarioLogado = req.usuario

    if (usuarioLogado.tipo !== 'adm') {
        return res.status(403).json({ error: 'somente adm pode obter esses dados'})
    }

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

const controllerObterUsuario = async (req, res) => {
    const {id} = req.params
    
    if (!id) {
        return res.status(400).json({ error: 'Erro ao obter o id do usuario'})
    }

    try {
        const usuarioLogado = req.usuario

        if (String(usuarioLogado.id) !== String(id) && usuarioLogado.tipo !== 'adm') {
            return res.status(403).json({ error: 'somente o proprio usuario ou um adm pode obter seus dados'})
        }

        const usuario = await queryBuscarUsuarioPeloId(id)
        
        if (!usuario) {
            return res.status(404).json({ error: 'Usuário não encontrado'})
        }

        const { senha, ...usuarioSemSenha } = usuario

        return res.status(200).json({ mensagem: 'Usuário encontrado',
            usuario: usuarioSemSenha
        })
    } catch (error) {
        console.error("Ocorreu um erro ao obter o usuário:", error)
        return res.status(500).json({ error: `Erro ao obter o usuário: ${error.message}`})
    }
}

const controllerAtualizarUsuario = async (req, res) => {
    const { nome, email } = req.body
    const usuarioId = req.usuario.id

    if (!validarEmail(email)) {
        return res.status(400).json({ error: 'Formato do email inválido' })
    }

    try {
        const emailExistente = await queryBuscarUsuarioPeloEmail(email)

        if (emailExistente) {
            return res.status(400).json({ mensagem: 'Email ja cadastrado'})
        }
       
        const usuarioAtualizado = await queryAtualizarUsuario(usuarioId, nome, email)

        return res.status(200).json({ mensagem: "usuario atualizado", usuario: usuarioAtualizado})
    } catch (error) {
        console.error("Ocorreu um erro ao atualizar o usuário:", error)
        return res.status(500).json({ error: `Erro ao atualizar o usuário: ${error.message}`})
    }

}

const controllerAtualizarSenhaUsuario = async (req, res) => {
    const { senhaAtual, novaSenha } = req.body

    const {id} = req.usuario

    const usuario = await queryBuscarUsuarioPeloId(id)
    
    if (!senhaAtual || !novaSenha) {
        return res.status(400).json({ error: 'Informe senhaAtual e novaSenha'})
    }

    try {
        const senhaValida = await bcrypt.compare(senhaAtual, usuario.senha)

        if (!senhaValida) {
            return res.status(401).json({ erro: 'Senha atual incorreta' })
        }

        const senhaHash = await bcrypt.hash(novaSenha, 10)

        const id = usuario.id

        await queryAtualizarSenhaUsuario(id, senhaHash)

        return res.status(200).json({ mensagem: 'Senha atualizada com sucesso' })
    } catch (error) {
        console.error("Ocorreu um erro ao atualizar a senha:", error)
        return res.status(500).json({ error: `Erro ao atualizar a senha: ${error.message}`})
    }
}

const controllerDeletarUsuario = async (req, res) => {
    const { id } = req.params

    if (!id) {
        return res.status(400).json({ error: 'Erro ao obter o id do usuario'})
    }

    try {
        const usuarioLogado = req.usuario

        if (String(usuarioLogado.id) !== String(id) && usuarioLogado.tipo !== 'adm') {
            return res.status(403).json({ error: 'somente o proprio usuario ou um adm pode obter seus dados'})
        }
        
        const usuarioId = req.usuario.id

        if (usuarioId !== id) {
            return res.status(400).json({ error: 'somente o proprio usuario ou um adm pode deletar a conta'})
        }

        const usuario = await queryBuscarUsuarioPeloId(id)

        if (!usuario) {
            return res.status(404).json({ error: 'Usuário não encontrado'})
        }

        await queryDeletarUsuario(id)

        return res.status(204).json({ mensagem: 'Usuário deletado com sucesso'})
    } catch (error) {
        console.error("Ocorreu um erro ao deletar o usuário:", error)
        return res.status(500).json({ error: `Erro ao deletar o usuário: ${error.message}`})
    }
}

module.exports = {
    controllerCadastrarUsuario,
    controllerListarUsuarios,
    controllerObterUsuario,
    controllerAtualizarUsuario,
    controllerDeletarUsuario,
    controllerAtualizarSenhaUsuario
}
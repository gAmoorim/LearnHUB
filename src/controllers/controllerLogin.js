const jwt = require('jsonwebtoken')
const bcrypt = require('bcrypt')
const senhaJWT = process.env.JWT_PWD
const { queryBuscarUsuarioPeloEmail } = require('../database/querys/queryUsuarios')

const controllerLoginUsuario = async (req, res) => {
    const { email, senha} = req.body

    if (!email || !senha) {
        return res.status(400).json({ error: ''})
    }

    try {
        const usuario = await queryBuscarUsuarioPeloEmail(email)

        if (!usuario) {
            return res.status(400).json({ error: 'email ou senha incorreto'})
        }

        const senhaCorreta = await bcrypt.compare(senha, usuario.senha)

        if (!senhaCorreta) {
            return res.status(400).json({ error: 'email ou senha incorreto'})
        }

        const dadosTokenUsuario = { id: usuario.id, nome: usuario.nome }

        const token = jwt.sign(dadosTokenUsuario, senhaJWT, { expiresIn: '2h' })
        const { senha: _, ...dadosUsuario} = usuario

        return res.status(200).json({
            usuario: dadosUsuario,
            token
        })
    } catch (error) {
        console.error("Ocorreu um erro ao realizar o Login:", error)
        return res.status(500).json({ error: `Erro ao realizar o Login: ${error.message}`})
    }
}

module.exports = { controllerLoginUsuario } 
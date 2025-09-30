const express = require('express')
const { controllerCadastrarUsuario, controllerListarUsuarios } = require('../controllers/controllerUsuarios')
const { controllerLoginUsuario } = require('../controllers/controllerLogin.js')
const { controllerCadastrarCurso } = require('../controllers/controllerCursos')
const auth = require('../middlewares/auth')

const routers = express()

routers.post('/usuarios', controllerCadastrarUsuario )
routers.post('/login', controllerLoginUsuario)
routers.get('/usuarios', controllerListarUsuarios)

routers.post('/cursos', auth, controllerCadastrarCurso)

module.exports = routers
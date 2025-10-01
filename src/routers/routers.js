const express = require('express')
const { controllerCadastrarUsuario, controllerListarUsuarios } = require('../controllers/controllerUsuarios')
const { controllerLoginUsuario } = require('../controllers/controllerLogin.js')
const { controllerCadastrarCurso, controllerListarCursos, controllerObterCurso } = require('../controllers/controllerCursos')
const auth = require('../middlewares/auth')

const routers = express()

routers.post('/usuarios', controllerCadastrarUsuario )
routers.post('/login', controllerLoginUsuario)
routers.get('/usuarios', controllerListarUsuarios)

routers.post('/cursos', auth, controllerCadastrarCurso)

routers.get('/cursos', controllerListarCursos)
routers.get('/cursos/:id', controllerObterCurso)

module.exports = routers
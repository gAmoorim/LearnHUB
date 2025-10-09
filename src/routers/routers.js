const express = require('express')
const { controllerCadastrarUsuario, controllerListarUsuarios, controllerObterUsuario, controllerDeletarUsuario } = require('../controllers/controllerUsuarios')
const { controllerLoginUsuario } = require('../controllers/controllerLogin.js')
const { controllerCadastrarCurso, controllerListarCursos, controllerObterCurso, controllerAtualizarCurso, controllerDeletarCurso } = require('../controllers/controllerCursos')
const { controllerCadastrarModulo, controllerListarModulos } = require('../controllers/controllerModulos.js')
const auth = require('../middlewares/auth')

const routers = express()

routers.post('/login', controllerLoginUsuario)

routers.post('/usuarios', controllerCadastrarUsuario )
routers.get('/usuarios', controllerListarUsuarios)
routers.get('/usuarios/:id', controllerObterUsuario)
routers.delete('/usuarios/:id', controllerDeletarUsuario)

routers.post('/cursos', auth, controllerCadastrarCurso)

routers.get('/cursos', controllerListarCursos)
routers.get('/cursos/:cursoId', controllerObterCurso)
routers.put('/cursos/:cursoId', auth, controllerAtualizarCurso)
routers.delete('/cursos/:cursoId', auth, controllerDeletarCurso)

routers.post('/modulos/:cursoId', auth, controllerCadastrarModulo)
routers.get('/cursos/:cursoId/modulos', controllerListarModulos)

module.exports = routers
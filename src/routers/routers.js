const express = require('express')
const { controllerCadastrarUsuario, controllerListarUsuarios, controllerObterUsuario, controllerDeletarUsuario } = require('../controllers/controllerUsuarios')
const { controllerLoginUsuario } = require('../controllers/controllerLogin.js')
const { controllerCadastrarCurso, controllerListarCursos, controllerObterCurso, controllerAtualizarCurso, controllerDeletarCurso } = require('../controllers/controllerCursos')
const { controllerCadastrarModulo, controllerListarModulos } = require('../controllers/controllerModulos.js')
const { controllerCadastrarAula, controllerListarAulas } = require('../controllers/controllerAulas.js')
const { controllerInscreverseNoCurso, controllerListarInscricoes } = require('../controllers/controllerInscricoes.js')
const { controllerMarcarAulaConcluida, controllerObterProgressoCurso } = require('../controllers/controllerProgreso.js')
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

routers.post('/aulas/modulos/:moduloId', auth, controllerCadastrarAula)
routers.get('/aulas/modulos/:moduloId', controllerListarAulas)

routers.post('/cursos/:cursoId/inscrever', auth, controllerInscreverseNoCurso)
routers.get('/meus-cursos', auth, controllerListarInscricoes)

routers.post('/conclusao/aulas/:aulaId', auth, controllerMarcarAulaConcluida)
routers.get('/cursos/:cursoId/progresso', auth, controllerObterProgressoCurso)

module.exports = routers
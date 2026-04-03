const express = require('express')
const { controllerCadastrarUsuario, controllerListarUsuarios, controllerObterUsuario, controllerDeletarUsuario, controllerAtualizarUsuario, controllerAtualizarSenhaUsuario } = require('../controllers/controllerUsuarios.js')
const { controllerLoginUsuario } = require('../controllers/controllerLogin.js')
const { controllerCadastrarCurso, controllerListarCursos, controllerObterCurso, controllerAtualizarCurso, controllerDeletarCurso } = require('../controllers/controllerCursos.js')
const { controllerCadastrarModulo, controllerListarModulos } = require('../controllers/controllerModulos.js')
const { controllerCadastrarAula, controllerListarAulas } = require('../controllers/controllerAulas.js')
const { controllerInscreverseNoCurso, controllerListarInscricoes } = require('../controllers/controllerInscricoes.js')
const { controllerMarcarAulaConcluida, controllerObterProgressoCurso } = require('../controllers/controllerProgreso.js')
const { controllerAvaliarCurso, controllerListarAvaliacoesDoCurso } = require('../controllers/controllerAvaliacoes.js')
const auth = require('../middlewares/auth.js')

const routers = express()

routers.post('/login', controllerLoginUsuario)

routers.post('/usuarios', controllerCadastrarUsuario )
routers.get('/usuarios', auth, controllerListarUsuarios)
routers.get('/usuarios/:id', auth, controllerObterUsuario)
routers.put('/usuarios', auth, controllerAtualizarUsuario)
routers.patch('/usuarios/senha', auth, controllerAtualizarSenhaUsuario)
routers.delete('/usuarios/:id', auth, controllerDeletarUsuario)

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

routers.post('/cursos/:cursoId/avaliar', auth, controllerAvaliarCurso)
routers.get('/cursos/:cursoId/avaliacoes', auth, controllerListarAvaliacoesDoCurso)

module.exports = routers
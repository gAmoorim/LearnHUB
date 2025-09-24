const express = require('express')
const { testando } = require('../controllers/controllerUsuarios')

const rotas = express()

rotas.get('/teste', testando)

module.exports = rotas
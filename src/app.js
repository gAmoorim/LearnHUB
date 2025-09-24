const express = require('express')
const cors = require('cors')
const rotas = require('./routers/routers')

const app = express()

app.use(express.json())
app.use(cors())
app.use(rotas)

module.exports = app
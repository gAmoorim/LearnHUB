const express = require('express')
const cors = require('cors')
const routers = require('./routers/routers')

const app = express()

app.use(cors({
  origin: ['https://yourlearnhub.vercel.app', 'http://localhost:3000'],
  credentials: false
}))

app.use(express.json())
app.use(routers)

module.exports = app
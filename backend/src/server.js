const app = require('./app')

require('dotenv').config()

const PORT = process.env.PORT || 3000

app.listen(port, () => {
    console.log(`Server rodando na porta ${PORT}`)
})
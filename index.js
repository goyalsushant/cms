var express = require('express')
var path = require('path')
var app = express()
var exhbs = require('express-handlebars')
const port = 3000

app.use(express.static(path.join(__dirname, 'public')))

app.engine('handlebars', exhbs({defaultLayout: 'home'}))
app.set('view engine', 'handlebars')

const main = require('./routes/home/main')
app.use('/', main)

app.listen(port, () => console.log(`Example app listening on port ${port}`))
var express = require('express')
var path = require('path')
var app = express()
var exhbs = require('express-handlebars')
const port = 3000

app.use(express.static(path.join(__dirname, 'public')))

app.engine('handlebars', exhbs({defaultLayout: 'home'}))
app.set('view engine', 'handlebars')

const home = require('./routes/home/route')
const admin = require('./routes/admin/route')
app.use('/', home)
app.use('/admin', admin)

app.listen(port, () => console.log(`Example app listening on port ${port}`))
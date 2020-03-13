const express = require('express')
const path = require('path')
const app = express()
const exhbs = require('express-handlebars')
const mongoose = require('mongoose')
const bodyParser = require('body-parser')
const methodOverride = require('method-override')
const upload = require('express-fileupload')
const port = 3000

mongoose.Promise = global.Promise;

mongoose.connect('mongodb://localhost:27017/cms', { useMongoCLient: true, useNewUrlParser: true }).then(db => {
    console.log('Mongo database connected');
}).catch(error => console.log(error));

app.use(express.static(path.join(__dirname, 'public')))

//View Engine
const { select } = require('./helpers/handlebars-helper')
app.engine('handlebars', exhbs({ defaultLayout: 'home', helpers: { select: select } }))
app.set('view engine', 'handlebars')

//Upload Middleware
app.use(upload())

//Body Parser
app.use(bodyParser.urlencoded({ extended: true }))
app.use(bodyParser.json())

//Method Over-ride
app.use(methodOverride('_method'))

// Route constants
const home = require('./routes/home/route')
const admin = require('./routes/admin/route')
const posts = require('./routes/admin/posts')

app.use('/', home)
app.use('/admin', admin)
app.use('/admin/posts', posts)

app.listen(port, () => console.log(`Example app listening on port ${port}`))
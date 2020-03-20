const express = require('express')
const path = require('path')
const app = express()
const exhbs = require('express-handlebars')
const mongoose = require('mongoose')
const bodyParser = require('body-parser')
const methodOverride = require('method-override')
const upload = require('express-fileupload')
const session = require('express-session')
const flash = require('connect-flash')
const port = 3000

mongoose.Promise = global.Promise;

mongoose.connect('mongodb://127.0.0.1:12017/cms', { useMongoCLient: true, useNewUrlParser: true }).then(db => {
    console.log('Mongo database connected');
}).catch(error => console.log(error));

app.use(express.static(path.join(__dirname, 'public')))

//View Engine
const { select, generateDate } = require('./helpers/handlebars-helper')
app.engine('handlebars', exhbs({ defaultLayout: 'home', helpers: { select: select, generateDate: generateDate } }))
app.set('view engine', 'handlebars')

//Upload Middleware
app.use(upload())

//Body Parser
app.use(bodyParser.urlencoded({ extended: true }))
app.use(bodyParser.json())

//Method Over-ride
app.use(methodOverride('_method'))

app.use(session({
    secret: 'ilovepaplu',
    resave: true,
    saveUninitialized: true
}))

app.use(flash())
app.use((req, res, next) => {
    res.locals.success_message = req.flash('success_message')
    next()
})
// Route constants
const home = require('./routes/home/route')
const admin = require('./routes/admin/route')
const posts = require('./routes/admin/posts')
const categories = require('./routes/admin/categories')

app.use('/', home)
app.use('/admin', admin)
app.use('/admin/posts', posts)
app.use('/admin/categories', categories)

app.listen(port, () => console.log(`Example app listening on port ${port}`))
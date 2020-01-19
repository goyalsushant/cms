var express = require('express')
var router = express.Router()

router.get('/', (req,res) => {
    res.render('home/index')
})

router.get('/about', (req,res) => {
    res.render('home/about')
})

router.get('/login', (req,res) => {
    res.render('home/login')
})

router.get('/register', (req,res) => {
    res.render('home/register')
})

module.exports = router
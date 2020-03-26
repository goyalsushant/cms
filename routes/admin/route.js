var express = require('express')
var router = express.Router()
var faker = require('faker')
const Post = require('../../models/Post')
const { userAuthenticated } = require('../../helpers/authenticate')

router.all('/*', (req, res, next) => {
    req.app.locals.layout = 'admin'
    next()
})

router.get('/', (req, res) => {
    res.render('admin/index')
})

router.post('/generate-fake-posts', (req, res) => {
    for (let index = 0; index < req.body.amount; index++) {
        let post = new Post()
        post.title = faker.name.title()
        post.status = 'public'
        post.allowComments = faker.random.boolean()
        post.body = faker.lorem.sentence()
        post.save().then(savedPost => {
        })
    }
    res.redirect('/admin/posts')
})
module.exports = router
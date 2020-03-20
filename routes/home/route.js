const express = require('express')
const router = express.Router()
const Post = require('../../models/Post')
const Category = require('../../models/Category')

router.all('/*', (req, res, next) => {
    req.app.locals.layout = 'home'
    next()
})

router.get('/', (req, res) => {
    Post.find({}).then(posts => {
        Category.find({}).then(categories => {
            const context = {
                post: posts.map(post => {
                    if (post.file) {
                        post.file = `/uploads/${post.file}`
                    }
                    else {
                        post.file = 'http://placehold.it/750x300'
                    }
                    return {
                        status: post.status,
                        title: post.title,
                        id: post.id,
                        allowComments: post.allowComments,
                        file: post.file,
                        date: post.date,
                        body: post.body
                    }
                }),
                category: categories.map(category => {
                    return {
                        name: category.name
                    }
                })
            }
            res.render('home/index', { posts: context.post, categories: context.category })
        })
    }).catch(err => {
        console.log(err)
    })
})

router.get('/about', (req, res) => {
    res.render('home/about')
})

router.get('/login', (req, res) => {
    res.render('home/login')
})

router.get('/register', (req, res) => {
    res.render('home/register')
})

router.get('/post/:id', (req, res) => {
    Post.findOne({ _id: req.params.id }).then(post => {
        Category.find({}).then(categories => {
            if (post.file) {
                post.file = `/uploads/${post.file}`
            }
            else {
                post.file = 'http://placehold.it/900x300'
            }
            const context = {
                post: {
                    title: post.title,
                    status: post.status,
                    body: post.body,
                    allowComments: post.allowComments,
                    id: post.id,
                    file: post.file,
                    date: post.date
                },
                category: categories.map(category => {
                    return {
                        name: category.name
                    }
                })
            }
            res.render('home/post', { post: context.post, categories: context.category })
        })
    })
})

module.exports = router
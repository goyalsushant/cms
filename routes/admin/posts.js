const express = require('express')
const router = express.Router()
const Post = require('../../models/Post')
const { isEmpty, uploadDir } = require('../../helpers/upload-helper')
const fs = require('fs')
const path = require('path')

router.all('/*', (req, res, next) => {
    req.app.locals.layout = 'admin'
    next()
})

router.get('/', (req, res) => {
    Post.find({}).then(posts => {
        const context = {
            post: posts.map(post => {
                return {
                    status: post.status,
                    title: post.title,
                    id: post.id,
                    allowComments: post.allowComments,
                    file: post.file,
                }
            })
        }
        res.render('admin/posts', { posts: context.post })
    }).catch(err => {
        console.log(err)
    })
})

router.get('/create', (req, res) => {
    res.render('admin/posts/create')
})

router.post('/create', (req, res) => {

    let filename = '';
    if (!isEmpty(req.files)) {
        let file = req.files.file
        filename = Date.now() + '-' + file.name
        file.mv('./public/uploads/' + filename, (err) => {
            if (err) throw err
        })
    }

    let allowComments = true;
    if (req.body.allowComments) {
        allowComments = true;
    }
    else {
        allowComments = false;
    }

    let newPost = new Post({
        title: req.body.title,
        status: req.body.status,
        allowComments: allowComments,
        body: req.body.body,
        file: filename
    })

    newPost.save().then(savedPost => {
        res.redirect('/admin/posts')
    }).catch(err => {
        console.log('Error occured while saving post. ', err)
    })
})

router.get('/edit/:id', (req, res) => {
    Post.findOne({ _id: req.params.id }).then(post => {
        const context = {
            title: post.title,
            status: post.status,
            body: post.body,
            allowComments: post.allowComments,
            id: post.id
        }
        res.render('admin/posts/edit', { post: context })
    }).catch(err => {
        console.log(err)
    })
})

router.put('/edit/:id', (req, res) => {
    Post.findOne({ _id: req.params.id }).then(post => {
        let allowComments = true;
        if (req.body.allowComments) {
            allowComments = true;
        }
        else {
            allowComments = false;
        }
        post.title = req.body.title
        post.status = req.body.status
        post.allowComments = allowComments
        post.body = req.body.body
        post.save().then(updatedPost => {
            res.redirect('/admin/posts')
        }).catch(err => {
            console.log(err)
        })
    }).catch(err => {
        console.log(err)
    })
})

router.delete('/:id', (req, res) => {
    Post.findOne({ _id: req.params.id }).then(post => {
        fs.unlink(uploadDir + post.file, (err) => {
            post.remove()
            res.redirect('/admin/posts')

        })
    }).catch(err => {
        console.log(err)
    })
})

module.exports = router
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
                    date : post.date
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

    let errors = []
    if (!req.body.title) {
        errors.push({ message: 'Please enter title' })
    }
    if (!req.body.body) {
        errors.push({ message: 'Please enter description' })
    }

    if (errors.length > 0) {
        res.render('admin/posts/create', { errors: errors })
    }
    else {


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
            req.flash('success_message', `Post ${savedPost.title} was created successfully`)
            res.redirect('/admin/posts')
        }).catch(err => {
            console.log('Error occured while saving post. ', err)
        })
    }
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
        let filename = '';
        if (!isEmpty(req.files)) {
            let file = req.files.file
            filename = Date.now() + '-' + file.name
            post.file = filename
            file.mv('./public/uploads/' + filename, (err) => {
                if (err) throw err
            })
        }
        post.save().then(updatedPost => {
            req.flash('success_message', `Post ${updatedPost.title} was updated successfully`)
            res.redirect('/admin/posts')
        }).catch(err => {
            req.flash('success_message', `There was some error while updating ${updatedPost.title} post`)
            console.log(err)
        })
    }).catch(err => {
        console.log(err)
    })
})

router.delete('/:id', (req, res) => {
    Post.findOne({ _id: req.params.id }).then(post => {
        req.flash('success_message', `Post ${post.title} was deleted successfully`)

        fs.unlink(uploadDir + post.file, (err) => {
            post.remove()
            res.redirect('/admin/posts')

        })
    }).catch(err => {
        console.log(err)
    })
})

module.exports = router
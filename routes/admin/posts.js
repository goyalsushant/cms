var express = require('express')
var router = express.Router()
var Post = require('../../models/Post')

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

    let allowComments = true;
    if (req.body.allowComments) {
        allowComments = true;
    }
    else {
        allowComments = false;
    }

    var newPost = new Post({
        title: req.body.title,
        status: req.body.status,
        allowComments: allowComments,
        body: req.body.body
    })

    newPost.save().then(savedPost => {
        console.log(savedPost)
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

router.delete('/:id', (req,res)=>{
    Post.deleteOne({_id: req.params.id}).then(result=>{
        res.redirect('/admin/posts')
    }).catch(err=>{
        console.log(err)
    })
})

module.exports = router
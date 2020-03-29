const express = require('express');
const router = express.Router();
const Post = require('../../models/Post');
const Comment = require('../../models/Comment');

router.all('/*', (req, res, next) => {
    req.app.locals.layout = 'admin';
    next();
})

router.get('/', (req, res) => {
    Comment.find({ user: req.user.id }).populate('user').then(comments => {
        const context = {
            comment: comments.map(comment => {
                return {
                    id: comment.id,
                    user: comment.user.firstName,
                    date: comment.date,
                }
            })
        }
        res.render('admin/comments', { comments: context.comment });

    })
})

router.post('/', (req, res) => {
    Post.findOne({ _id: req.body.id }).then(post => {
        const newComment = new Comment({
            user: req.user.id,
            body: req.body.body
        });

        post.comments.push(newComment)
        post.save().then(savedPost => {
            newComment.save().then(savedComment => {
                res.redirect(`/post/${post.id}`);
            });
        });
    });
});

router.delete('/:id', (req, res) => {
    Comment.findOne({ _id: req.params.id }).then(comment => {
        Post.findOneAndUpdate({ comments: req.params.id }, { $pull: { comments: req.params.id } }, (err, data) => {
            if (err) console.log(err)
            req.flash('success_message', 'Comment was deleted successfully')
            comment.remove()
            res.redirect('/admin/comments')
        })

    })
})

module.exports = router
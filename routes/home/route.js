const express = require('express')
const router = express.Router()
const bcrypt = require('bcryptjs')
const Post = require('../../models/Post')
const Category = require('../../models/Category')
const User = require('../../models/User')
const passport = require('passport')
const LocalStrategy = require('passport-local').Strategy

router.all('/*', (req, res, next) => {
    req.app.locals.layout = 'home'
    next()
})

router.get('/', (req, res) => {
    Post.find({}).populate('user').then(posts => {
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
                        body: post.body,
                        user: post.user.firstName
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

passport.use(new LocalStrategy({ usernameField: 'email' }, (email, password, done) => {
    User.findOne({ email: email }).then(user => {
        if (!user) return done(null, false, { message: 'Incorrect Username' })

        bcrypt.compare(password, user.password, (err, matched) => {
            if (err) return err

            if (matched) {
                return done(null, user)
            }
            else {
                return done(null, false, { message: 'Incorrect Password' })
            }
        })
    })
}))

passport.serializeUser((user, done) => {
    done(null, user.id)
})
passport.deserializeUser((id, done) => {
    User.findById(id, (err, user) => {
        const context = {
            user: {
                firstName: user.firstName,
                lastName: user.lastName,
                email: user.email,
                id: user.id
            },
        }
        done(err, context.user)
    })
})

router.post('/login', (req, res, next) => {
    passport.authenticate('local', {
        successRedirect: '/admin',
        failureRedirect: '/login',
        failureFlash: true
    })(req, res, next)
})

router.get('/logout', (req, res) => {
    req.logOut()
    res.redirect('/login')
})

router.get('/register', (req, res) => {
    res.render('home/register')
})

router.post('/register', (req, res) => {
    let errors = []

    if (!req.body.firstName) {
        errors.push({ message: 'Please enter first name.' })
    }
    if (!req.body.email) {
        errors.push({ message: 'Please enter email.' })
    }
    if (!req.body.password) {
        errors.push({ message: 'Please enter password.' })
    }
    if (!req.body.passwordConfirm) {
        errors.push({ message: 'Please confirm your password.' })
    }
    if (req.body.password !== req.body.passwordConfirm) {
        errors.push({ message: 'Password mismatch.' })
    }

    if (errors.length > 0) {
        res.render('home/register', {
            errors: errors,
            firstName: req.body.firstName,
            lastName: req.body.lastName,
            email: req.body.email,
        })
    }
    else {
        User.findOne({ email: req.body.email }).then(user => {
            if (!user) {
                const newUser = new User({
                    firstName: req.body.firstName,
                    lastName: req.body.lastName,
                    email: req.body.email,
                    password: req.body.password,
                })
                bcrypt.genSalt(10, (err, salt) => {
                    bcrypt.hash(newUser.password, salt, (err, hash) => {
                        newUser.password = hash
                        newUser.save().then(savedUser => {
                            req.flash('success_message', 'You registered successfully. Please login.')
                            res.redirect('/login')
                        })
                    })
                })
            }
            else {
                req.flash('error_message', 'User already exists.')
                res.redirect('/login')
            }
        })


    }

    // res.render('home/register')
})

router.get('/post/:id', (req, res) => {
    Post.findOne({ _id: req.params.id })
        .populate({ path: 'comments', match: { approveComment: true }, populate: { path: 'user', model: 'users' } })
        .populate('user').then(post => {
            Category.find({}).then(categories => {
                if (post.file) {
                    post.file = `/uploads/${post.file}`
                }
                else {
                    post.file = 'http://placehold.it/900x300'
                }
                const context = {
                    comment: post.comments.map(comment => {
                        return {
                            user: comment.user.firstName,
                            body: comment.body
                        }
                    }),
                    post: {
                        title: post.title,
                        status: post.status,
                        body: post.body,
                        allowComments: post.allowComments,
                        id: post.id,
                        file: post.file,
                        date: post.date,
                        user: post.user.firstName
                    },
                    category: categories.map(category => {
                        return {
                            name: category.name
                        }
                    })
                }
                res.render('home/post', { post: context.post, categories: context.category, comments: context.comment })
            })
        })
})

module.exports = router
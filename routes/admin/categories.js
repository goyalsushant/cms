var express = require('express')
var router = express.Router()
var faker = require('faker')
const Category = require('../../models/Category')

router.all('/*', (req, res, next) => {
    req.app.locals.layout = 'admin'
    next()
})

router.get('/', (req, res) => {
    Category.find({}).then(categories => {
        const context = {
            category: categories.map(category => {
                return {
                    name: category.name,
                    id: category.id,
                }
            })
        }
        res.render('admin/categories', { categories: context.category })
    }).catch(err => {
        console.log(err)
    })
})

router.post('/create', (req, res) => {

    let errors = []
    if (!req.body.name) {
        errors.push({ message: 'Please enter name of category' })
    }
    else {

        let newCategory = new Category({
            name: req.body.name,
        })

        newCategory.save().then(savedCategory => {
            req.flash('success_message', `Category ${savedCategory.name} was created successfully`)
            res.redirect('/admin/categories')
        }).catch(err => {
            console.log('Error occured while saving category. ', err)
        })
    }
})

router.get('/edit/:id', (req, res) => {
    Category.findOne({ _id: req.params.id }).then(category => {
        const context = {
            name: category.name,
            id: category.id
        }
        res.render('admin/categories/edit', { category: context })
    })
})

router.put('/edit/:id', (req, res) => {
    Category.findOne({ _id: req.params.id }).then(category => {
        category.name = req.body.name
        category.save().then(updatedCategory => {
            req.flash('success_message', `Category ${updatedCategory.name} was updated successfully`)
            res.redirect('/admin/categories')
        }).catch(err => {
            req.flash('success_message', `There was some error while updating ${updatedCategory.name} post`)
            console.log(err)
        })
    })
})

router.delete('/delete/:id', (req, res) => {
    Category.deleteOne  ({ _id: req.params.id }).then(category => {
        req.flash('success_message', `Category was deleted successfully`)
        res.redirect('/admin/categories')
    })
})

module.exports = router
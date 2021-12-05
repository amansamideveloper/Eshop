const express = require('express')
const { Category } = require('../models/Category')
const router = express.Router();

router.post('/', async (req, res) => {

    let category = new Category({
        name: req.body.name,
        icon: req.body.icon,
        color: req.body.color
    })
    category = await category.save();
    if (!category)
        return res.status(404).send('the category can not category')
    res.send(category)


})
router.delete('/:id', async (req, res) => {
    Category.findByIdAndRemove(req.params.id).then(category => {
        if (category) {
            return res.status(200).json({ success: true, message: `the category id ${req.params.id} is deleted` })
        } else {
            return res.status(404).json({ success: false, message: 'category not found' })
        }
    })
        .catch(err => {
            return res.status(400).json({ success: false, message: err })
        })
})
// Get app product

router.get('/', async (req, res) => {

    const categories = await Category.find()
    if (!categories) {
        res.status(400).json({ success: true, message: 'Categories not found ' })
    }
    res.send(categories)


})
router.put('/:id', async (req, res) => {
    const category = await Category.findByIdAndUpdate(
        req.params.id, {
        name: req.body.name,
        icon: req.body.icon,
        color: req.body.color
    },
        { new: true }
    )
    if (!category)
        return res.status(400).send('the category can not updated')
    res.status(200).json(category)
})
// find id
router.get('/:id', async (req, res) => {
    Category.findById(req.params.id).then(category => {
        if (category) {
            res.status(200).json(category)
        } else {
            res.status(404).json({ success: false, message: 'category not found' })
        }
    }).catch(err => {
        res.status(400).json({ success: false, message: err })
    })
})
module.exports = router
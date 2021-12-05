const { User } = require('../models/user');
const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
router.get(`/`, async (req, res) => {
    const userList = await User.find().select('-passwordHash');

    if (!userList) {
        res.status(500).json({ success: false })
    }
    res.send(userList);
})
// get one user
router.get('/:id', async (req, res) => {
    User.findById(req.params.id).select('-passwordHash').then(user => {
        if (user) {
            res.status(200).json(user)
        } else {
            res.status(404).json({ success: false, message: 'user not found' })
        }
    }).catch(err => {
        res.status(400).json({ success: false, message: err })
    })
})
// login
router.post('/login', async (req, res) => {

    const user = await User.findOne({ email: req.body.email });
    if (!user) {
        res.status(400).send('user not found')
    }
    if (user && bcrypt.compareSync(req.body.password, user.passwordHash)) {
        const token = jwt.sign({
            userId: user.id,
            isAdmin: user.isAdmin
        },
            process.env.secret,
            { expiresIn: '1y' }
        )
        res.status(200).send({ user: user.email, token: token })
    } else {
        res.status(400).send('Password incorrect')
    }
})

router.post('/', async (req, res) => {

    let user = new User({
        name: req.body.name,
        email: req.body.email,
        passwordHash: bcrypt.hashSync(req.body.password, 10),
        phone: req.body.phone,
        isAdmin: req.body.isAdmin,
        apartment: req.body.apartment,
        zip: req.body.zip,
        city: req.body.city,
        country: req.body.country
    })
    user = await user.save();
    if (!user)
        return res.status(404).send('the user can not created')
    res.send(user)


})
// get number count 
router.get('/get/count', async (req, res) => {

    const userCount = await User.countDocuments();
    if (!userCount) {
        res.status(500).json({ success: false })
    }
    res.send({ productCount: userCount })


})

module.exports = router;
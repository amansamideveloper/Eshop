const express = require('express')
const { Order } = require('../models/order')
const { OrderItem } = require('../models/order-item')
const router = express.Router();

router.post('/', async (req, res) => {
    const orderItemsIds = Promise.all(req.body.orderItems.map(async orderItem => {
        let newOrderItem = new OrderItem({
            quantity: orderItem.quantity,
            product: orderItem.product
        })
        newOrderItem = await newOrderItem.save();
        return newOrderItem._id;
    }))
    const orderItemsResolve = await orderItemsIds;

    const totalPrices = await Promise.all(orderItemsResolve.map(async (orderItemsId) => {
        const orderItem = await OrderItem.findById(orderItemsId).populate('product', 'price');
        const totalPrice = orderItem.product.price * orderItem.quantity;
        return totalPrice;
    }))
    const totalPrice = totalPrices.reduce((a, b) => a + b, 0)
    let order = new Order({
        orderItems: orderItemsResolve,
        shippingAddress1: req.body.shippingAddress1,
        shippingAddress2: req.body.shippingAddress2,
        city: req.body.city,
        zip: req.body.zip,
        country: req.body.country,
        phone: req.body.phone,
        status: req.body.status,
        totalPrice: totalPrice,
        user: req.body.user,
    })
    order = await order.save();
    if (!order)
        return res.status(404).send('the category can not Order')
    res.send(order)


})
router.delete('/:id', (req, res) => {
    Order.findByIdAndRemove(req.params.id).then(async order => {
        if (order) {
            await order.orderItems.map(async orderItem => {
                await OrderItem.findByIdAndRemove(orderItem)
            })
            return res.status(200).json({ success: true, message: `the order id ${req.params.id} is deleted` })
        } else {
            return res.status(404).json({ success: false, message: 'order not found' })
        }
    })
        .catch(err => {
            return res.status(400).json({ success: false, message: err })
        })
})
// Get product

router.get('/', async (req, res) => {

    const orders = await Order.find().populate('user', 'name').sort({ 'dateOrdered': -1 })
    if (!orders) {
        res.status(400).json({ success: true, message: 'orders not found ' })
    }
    res.send(orders)


})
router.put('/:id', async (req, res) => {
    const order = await Order.findByIdAndUpdate(
        req.params.id, {
        status: req.body.status
    },
        { new: true }
    )
    if (!order)
        return res.status(400).send('the order can not updated')
    res.status(200).json(order)
})
// find id
router.get('/:id', async (req, res) => {
    Order.findById(req.params.id).populate({ path: 'orderItems', populate: { path: 'product', populate: 'category' } }).then(order => {
        if (order) {
            res.status(200).json(order)
        } else {
            res.status(404).json({ success: false, message: 'order not found' })
        }
    }).catch(err => {
        res.status(400).json({ success: false, message: err })
    })
})

router.get('/get/totalsales', async (req, res) => {
    const totalSales = await Order.aggregate([
        { $group: { _id: null, totalsales: { $sum: '$totalPrice' } } }
    ])
    if (!totalSales) {
        res.status(400).send('The order sales can not generated')
    }
    res.status(200).send({ totalSales: totalSales.pop().totalsales })
})

// get number count 
router.get('/get/count', async (req, res) => {

    const orderCount = await Order.countDocuments();
    if (!orderCount) {
        res.status(500).json({ success: false })
    }
    res.send({ productCount: orderCount })


})

// Get app product

router.get('/get/userorders/:userid', async (req, res) => {

    const userorderList = await Order.find({ user: req.params.userid }).populate({ path: 'orderItems', populate: { path: 'product', populate: 'category' } }).sort({ 'dateOrdered': -1 })
    if (!userorderList) {
        res.status(400).json({ success: true, message: 'userorderList not found ' })
    }
    res.send(userorderList)


})

module.exports = router
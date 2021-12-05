const express = require('express');
const mongoose = require('mongoose');
const multer = require('multer');
const { Category } = require('../models/Category');
const { Product } = require('../models/Product')
const router = express.Router();

const FILE_TYPE_MAP = {
    'image/png': 'png',
    'image/jpeg': 'jpeg',
    'image/jpg': 'jpg'
}

const storage = multer.diskStorage({
    destination: function (req, file, cb) {

        const isValid = FILE_TYPE_MAP[file.mimetype];
        let uploadError = new Error('Invalid image type');
        if (isValid) {
            uploadError = null
        }
        cb(uploadError, 'public/upload')
    },
    filename: function (req, file, cb) {
        const fileName = file.originalname.split(' ').join('-')
        const extension = FILE_TYPE_MAP[file.mimetype]
        cb(null, `${fileName}-${Date.now()}.${extension}`)
    }
})

const uploadOptions = multer({ storage: storage })
router.post('/', uploadOptions.single('image'), async (req, res) => {
    const category = await Category.findById(req.body.category)
    const fileName = req.file.filename;

    const basePath = `${req.protocol}://${req.get('host')}/public/upload/`
    const file = req.file;
    if (!file) return res.status(400).send('Invalid Image')
    if (!category) return res.status(400).send('Invalid category')
    let product = new Product({
        name: req.body.name,
        description: req.body.description,
        richDescription: req.body.richDescription,
        image: `${basePath}${fileName}`,
        category: req.body.category,
        price: req.body.price,
        countInStock: req.body.countInStock,
        rating: req.body.rating,
        numReviews: req.body.numReviews,
        isFeatured: req.body.isFeatured
    })
    product = await product.save()
    if (!product)
        return res.status(500).send('Do not create product')
    res.send(product);
})
// updated Products
router.put('/:id', async (req, res) => {
    const category = await Category.findById(req.body.category)
    if (!category) return res.status(400).send('Invalid category')
    let product = await Product.findByIdAndUpdate(
        req.params.id, {
        name: req.body.name,
        description: req.body.description,
        richDescription: req.body.richDescription,
        image: req.body.image,
        category: req.body.category,
        price: req.body.price,
        countInStock: req.body.countInStock,
        rating: req.body.rating,
        numReviews: req.body.numReviews,
        isFeatured: req.body.isFeatured
    },
        { new: true }
    )
    product = await product.save()
    if (!product)
        return res.status(500).send('Do not Updated product')
    res.send(product);
})
router.get('/:id', async (req, res) => {
    let product = await Product.findById(req.params.id).populate('category')

    if (!product)
        return res.status(404).json({ success: false, message: 'product not found' })
    res.status(400).send(product)


})
// Get app product

router.get('/', async (req, res) => {
    let = filter = {}
    if (req.query.categories) {
        filter = { category: req.query.categories.split(',') }
    }


    const product = await Product.find(filter).populate('category')
    res.send(product)


})
// get featured 
router.get('/get/featured/:count', async (req, res) => {
    const count = req.params.count ? req.params.count : 0;

    const product = await Product.find({ isFeatured: true }).limit(+count)
    if (!product) {
        res.status(500).json({ success: false, message: 'Featured not found' })
    }
    res.status(200).send(product)


})

// get number count 
router.get('/get/count', async (req, res) => {

    const productCount = await Product.countDocuments();
    if (!productCount) {
        res.status(500).json({ success: false })
    }
    res.send({ productCount: productCount })


})


// delete images
router.delete('/:id', async (req, res) => {
    Product.findByIdAndRemove(req.params.id).then(product => {
        if (product) {
            return res.status(200).json({ success: true, message: `the product id ${req.params.id} is deleted` })
        } else {
            return res.status(404).json({ success: false, message: 'product not found' })
        }
    })
        .catch(err => {
            return res.status(400).json({ success: false, message: err })
        })
})

// post Images
router.put('/gallery-image/:id',
    uploadOptions.array('images', 10),
    async (req, res) => {
        if (!mongoose.isValidObjectId(req.params.id)) {
            return res.status(400).send('Invalid Product Id');
        }
        const files = req.files;

        let imagePaths = [];
        const basePath = `${req.protocol}://${req.get('host')}/public/upload/`

        if (files) {
            files.map(file => {
                imagePaths.push(`${basePath}${file.filename}`)
            })

            console.log(files);

        }


        const product = await Product.findByIdAndUpdate(
            req.params.id, {
            images: imagePaths,
        },
            { new: true }
        )
        if (!product)
            return res.status(500).send('Do not Updated product')
        res.send(product);
    }
)
module.exports = router
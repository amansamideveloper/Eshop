const express = require('express');
const app = express();
require('dotenv/config');
const bodyParser = require('body-parser');
const morgan = require('morgan')
const mongoose = require('mongoose')
const cors = require('cors');
const authJwt = require('./helpers/jwt')
const errorHandler = require('./helpers/error-handler')
const productRouter = require('./routers/products');
const categoryRouter = require('./routers/categories');
const userRouter = require('./routers/users');
const orderRouter = require('./routers/orders');

const api = process.env.API_URL;
app.use(cors())
app.options('*', cors())
app.use(bodyParser.json())
app.use(morgan('tiny'))
app.use(authJwt())
app.use(errorHandler)
app.use('/public/upload', express.static(__dirname + '/public/upload'))
app.use(`${api}/products`, productRouter)
app.use(`${api}/category`, categoryRouter)
app.use(`${api}/users`, userRouter)
app.use(`${api}/orders`, orderRouter)
// Product Model

// add products


mongoose.connect(process.env.CONNECTON_STRING,
    {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        dbName: 'e-shop'
    })
    .then(res => console.log('Connected'))
    .catch(err => console.log('err', err))

app.listen(process.env.PORT, (req, res) => {
    console.log(`Server running on port ${process.env.PORT}`)
})
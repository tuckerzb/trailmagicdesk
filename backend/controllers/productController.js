import asyncHandler from 'express-async-handler';
import Product from '../models/productModel.js';

// @desc     Fetch all products
// @route    GET /api/products
// @access   Public
const getProducts = asyncHandler(async (req, res) => {
    let keyword;
    const pageSize = 10;
    const page = Number(req.query.pageNumber) || 1;

    const isAdmin = (req.query.isAdmin === 'true');

    if (isAdmin) {
        keyword = req.query.keyword ? {
            name: {
                $regex: req.query.keyword,
                $options: 'i'
            },
        } : {};
    } else {
        keyword = req.query.keyword ? {
            name: {
                $regex: req.query.keyword,
                $options: 'i'
            },
            isActive: true
        } : {isActive: true};
    }
    
    const count = await Product.countDocuments({...keyword});

    const products = await Product.find({...keyword}).sort({price: 1}).limit(pageSize).skip(pageSize * (page - 1));
    res.json({products, page, pages: Math.ceil(count / pageSize)});
})

// @desc     Fetch single product by ID
// @route    GET /api/products/:id
// @access   Public
const getProductById = asyncHandler(async (req, res) => {
    const product = await Product.findById(req.params.id);
    if (product) {
        res.json(product);
    } else {
        res.status(404);
        throw new Error('Product not fond');
    }
})

// @desc     Delete a product
// @route    DELETE /api/products/:id
// @access   Public/Admin
const deleteProduct = asyncHandler(async (req, res) => {
    const product = await Product.findById(req.params.id);
    if (product) {
        product.remove();
        res.json({message: 'Product remove'});
    } else {
        res.status(404);
        throw new Error('Product not fond');
    }
})

// @desc     Create a product
// @route    POST /api/products/
// @access   Public/Admin
const createProduct = asyncHandler(async (req, res) => {
    const product = new Product({
        name: 'Sample Name',
        price: 0,
        user: req.user._id,
        image: '/images/sample.jpg',
        category: 'Sample Category',
        description: 'Sample Description',
        squareCatalogId: '',
        isActive: true
    })

    const createdProduct = await product.save();
    res.status(201).json(createdProduct);
})

// @desc     Update a product
// @route    PPUT /api/products/:id
// @access   Public/Admin
const updateProduct = asyncHandler(async (req, res) => {
    const {name, price, description, image, category, isCash} = req.body;
    const product = await Product.findById(req.params.id);

    if (product) {

        product.name = name;
        product.price = price;
        product.description = description;
        product.image = image;
        product.category = category;
        product.isCash = isCash;

        const updatedProduct = await product.save();
        res.status(201).json(updatedProduct);
    } else {
        res.status(404);
        throw new Error('Product not found!');
    }
})

// @desc     Create new review
// @route    POST /api/products/:id/reviews
// @access   Private
const createProductReview = asyncHandler(async (req, res) => {
    const {rating, comment} = req.body;
    const product = await Product.findById(req.params.id);

    if (product) {
        const alreadyReviewed = product.reviews.find(r => r.user.toString() == req.user._id.toString());
        if (alreadyReviewed) {
            res.status(400);
            throw new Error('User has already reviewed this product!');
        }
        const review = {name: req.user.name, rating: Number(rating), comment, user: req.user._id};
        product.reviews.push(review);
        product.numReviews = product.reviews.length;
        product.rating = product.reviews.reduce((acc, item) => item.rating + acc, 0) / product.reviews.length;
        await product.save();
        res.status(201).json({message: 'Review added!'});
        
    } else {
        res.status(404);
        throw new Error('Product not found!');
    }
})

// @desc     Get top rated products
// @route    GET /api/products/top
// @access   Public
const getTopProducts = asyncHandler(async (req, res) => {
    const products = await Product.find({isActive: true}).sort({rating: -1}).limit(3);
    res.json(products);
})

// @desc     Change a product's active status
// @route    PUT /api/products/isActive/:id
// @access   Private/Admin
const updateProductIsActive = asyncHandler(async (req, res) => {
    const product = await Product.findById(req.params.id);

    if (product) {

        product.isActive = !product.isActive;

        const updatedProduct = await product.save();
        res.status(201).json(updatedProduct);
    } else {
        res.status(404);
        throw new Error('Product not found!');
    }
})

export {getProducts, getProductById, deleteProduct, createProduct, updateProduct, createProductReview, getTopProducts, updateProductIsActive};

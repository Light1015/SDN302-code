const express = require('express');
const mongoose = require('mongoose');
const router = express.Router();
const Review = require('../models/review.model');
const Product = require('../models/product.model');

// Create review (and push to product.reviews) — use transaction
router.post('/', async (req, res) => {
    const { rating, comment, userId, productId } = req.body;
    const session = await mongoose.startSession();
    session.startTransaction();
    try {
        const product = await Product.findById(productId).session(session);
        if (!product) throw new Error('Product not found');

        const review = new Review({
            rating,
            comment,
            user: userId,
            product: productId
        });
        await review.save({ session });

        product.reviews.push(review._id);
        await product.save({ session });

        await session.commitTransaction();
        session.endSession();

        // populate the created review's user info before responding (optional)
        await review.populate('user', 'name email');
        res.status(201).json(review);
    } catch (err) {
        await session.abortTransaction();
        session.endSession();
        res.status(400).json({ error: err.message });
    }
});

module.exports = router;

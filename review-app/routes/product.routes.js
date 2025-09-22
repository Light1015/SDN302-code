const express = require('express');
const router = express.Router();
const Product = require('../models/product.model');

// Create product
router.post('/', async (req, res) => {
    try {
        const p = new Product(req.body);
        await p.save();
        res.status(201).json(p);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

// Get product with reviews populated + nested user
router.get('/:id', async (req, res) => {
    try {
        const product = await Product.findById(req.params.id)
            .populate({
                path: 'reviews',
                populate: { path: 'user', select: 'name email' },
                options: { sort: { createdAt: -1 } }
            })
            .lean();
        if (!product) return res.status(404).json({ error: 'Product not found' });
        res.json(product);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;

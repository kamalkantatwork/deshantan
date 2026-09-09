
const express = require('express');
const router = express.Router();
const Package = require('../models/Package');

// GET all packages
router.get('/', async (req, res) => {
    try {
        const packages = await Package.find();
        res.json({
            success: true,
            data: packages
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

// GET single package
router.get('/:id', async (req, res) => {
    try {
        const package = await Package.findById(req.params.id);
        if (!package) {
            return res.status(404).json({
                success: false,
                message: 'Package not found'
            });
        }
        res.json({
            success: true,
            data: package
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

// GET best seller packages
router.get('/bestsellers', async (req, res) => {
    try {
        const packages = await Package.find({ isBestSeller: true });
        res.json({
            success: true,
            data: packages
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

module.exports = router;
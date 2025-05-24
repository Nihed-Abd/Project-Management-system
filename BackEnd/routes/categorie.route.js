// Category Routes
// GET /             - Get all categories
// POST /            - Create a new category
// GET /:id          - Get category by ID
// PUT /:id          - Update category by ID
// DELETE /:id       - Delete category by ID
// GET /name/:name   - Get category by name

const express = require('express');
const router = express.Router();
const Category = require('../models/categorie');

// Get all categories
router.get('/', async (req, res) => {
    try {
        const categories = await Category.find({}, null, {sort: {'_id': -1}})
        res.status(200).json(categories);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Create a new category
router.post('/', async (req, res) => {
    const newCategory = new Category(req.body)
    try {
        await newCategory.save();
        res.status(201).json(newCategory);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// Update a category by ID
router.put('/:id', async (req, res) => {
    try {
        const updatedCategory = await Category.findByIdAndUpdate(
            req.params.id,
            { $set: req.body },
            { new: true }
        );
        if (!updatedCategory) {
            return res.status(404).json({ message: 'Category not found' });
        }
        res.status(200).json(updatedCategory);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// Delete a category by ID
router.delete('/:id', async (req, res) => {
    try {
        const deletedCategory = await Category.findByIdAndDelete(req.params.id);
        if (!deletedCategory) {
            return res.status(404).json({ message: 'Category not found' });
        }
        res.json({ message: "Category deleted successfully" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Get a category by ID
router.get('/:id', async (req, res) => {
    try {
        const category = await Category.findById(req.params.id);
        if (!category) {
            return res.status(404).json({ message: 'Category not found' });
        }
        res.status(200).json(category);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Get a category by name
router.get('/name/:name', async (req, res) => {
    try {
        const category = await Category.findOne({ name: req.params.name });
        if (!category) {
            return res.status(404).json({ message: 'Category not found' });
        }
        res.status(200).json(category);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;
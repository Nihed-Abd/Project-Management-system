// Public routes for accessing data without authentication
const express = require('express');
const router = express.Router();
const Project = require('../models/project');

// Get all public projects
router.get('/projects', async (req, res) => {
    try {
        const projects = await Project.find(
            { status: 'terminé' }, // Only show completed projects publicly
            null, 
            { sort: { 'creationDate': -1 } }
        )
        .populate('categoryId', 'name')
        .populate('userId', 'name email');

        res.status(200).json({
            success: true,
            count: projects.length,
            projects
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

// Get public projects by category
router.get('/projects/category/:categoryId', async (req, res) => {
    try {
        const projects = await Project.find(
            { 
                categoryId: req.params.categoryId,
                status: 'terminé' // Only show completed projects
            },
            null,
            { sort: { 'creationDate': -1 } }
        )
        .populate('categoryId', 'name')
        .populate('userId', 'name email');
        
        res.status(200).json({
            success: true,
            count: projects.length,
            projects
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

// Get a single project by ID
router.get('/projects/:projectId', async (req, res) => {
    try {
        const project = await Project.findById(req.params.projectId)
            .populate('categoryId', 'name')
            .populate('userId', 'name email picture');

        if (!project) {
            return res.status(404).json({ 
                success: false,
                message: 'Project not found' 
            });
        }

        res.status(200).json({
            success: true,
            project
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

module.exports = router;

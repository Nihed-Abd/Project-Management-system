// Reclamation Routes
// GET /             - Get all reclamations
// POST /            - Create a new reclamation
// GET /:id          - Get reclamation by ID
// PUT /:id          - Update reclamation by ID (admin response)
// DELETE /:id       - Delete reclamation by ID
// GET /user/:userId - Get reclamations by user ID
// GET /status/:status - Get reclamations by status

const express = require('express');
const router = express.Router();
const Reclamation = require('../models/reclamation');
const User = require('../models/user');
const sendEmail = require('../utils/sendEmail');

// Get all reclamations
router.get('/', async (req, res) => {
    try {
        const reclamations = await Reclamation.find()
            .populate('userId', 'name email')
            .sort({ dateCreation: -1 });
        res.status(200).json(reclamations);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Create a new reclamation
router.post('/', async (req, res) => {
    const newReclamation = new Reclamation(req.body);
    try {
        await newReclamation.save();
        res.status(201).json(newReclamation);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// Get a reclamation by ID
router.get('/:id', async (req, res) => {
    try {
        const reclamation = await Reclamation.findById(req.params.id)
            .populate('userId', 'name email');
        if (!reclamation) {
            return res.status(404).json({ message: 'Reclamation not found' });
        }
        res.status(200).json(reclamation);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Update a reclamation (typically for admin response)
router.put('/:id', async (req, res) => {
    try {
        const updatedReclamation = await Reclamation.findById(req.params.id)
            .populate('userId', 'name email');
        
        if (!updatedReclamation) {
            return res.status(404).json({ message: 'Reclamation not found' });
        }
        
        // If admin is providing a response
        if (req.body.adminResponse) {
            updatedReclamation.adminResponse = req.body.adminResponse;
            updatedReclamation.statusRec = 'Answered';
            updatedReclamation.dateAnswer = new Date();
            
            // Send email notification to user
            if (updatedReclamation.userId && updatedReclamation.userId.email) {
                const emailTemplate = `
                <!DOCTYPE html>
                <html>
                <head>
                    <style>
                        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                        .header { background-color: #f8f9fa; padding: 20px; text-align: center; }
                        .content { padding: 20px; }
                        .footer { background-color: #f8f9fa; padding: 10px; text-align: center; font-size: 12px; color: #777; }
                        h2 { color: #EF4444; }
                        .message { background-color: #f1f1f1; padding: 15px; border-radius: 5px; margin: 15px 0; }
                        .response { background-color: #e6f7ff; padding: 15px; border-radius: 5px; margin: 15px 0; border-left: 4px solid #1890ff; }
                    </style>
                </head>
                <body>
                    <div class="container">
                        <div class="header">
                            <h2>Response to Your Reclamation</h2>
                        </div>
                        <div class="content">
                            <p>Hello ${updatedReclamation.userId.name},</p>
                            <p>We have received and reviewed your reclamation regarding:</p>
                            <div class="message">
                                <strong>Subject:</strong> ${updatedReclamation.object}<br>
                                <strong>Submitted on:</strong> ${new Date(updatedReclamation.dateCreation).toLocaleDateString()}
                            </div>
                            <p>Our team has provided the following response:</p>
                            <div class="response">
                                ${updatedReclamation.adminResponse}
                            </div>
                            <p>If you have any further questions or concerns, please don't hesitate to contact us.</p>
                            <p>Thank you for your patience and understanding.</p>
                            <p>Best regards,<br>HEC ELECTRICITY Support Team</p>
                        </div>
                        <div class="footer">
                            <p>This is an automated email. Please do not reply directly to this message.</p>
                            <p>© ${new Date().getFullYear()} HEC ELECTRICITY. All rights reserved.</p>
                        </div>
                    </div>
                </body>
                </html>
                `;
                
                await sendEmail(
                    updatedReclamation.userId.email,
                    `Response to Your Reclamation: ${updatedReclamation.object}`,
                    emailTemplate
                );
                
                console.log(`Email notification sent to ${updatedReclamation.userId.email}`);
            }
        }
        
        // Update other fields if needed
        if (req.body.object) updatedReclamation.object = req.body.object;
        if (req.body.message) updatedReclamation.message = req.body.message;
        if (req.body.statusRec) updatedReclamation.statusRec = req.body.statusRec;
        
        await updatedReclamation.save();
        
        res.status(200).json(updatedReclamation);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// Delete a reclamation
router.delete('/:id', async (req, res) => {
    try {
        const deletedReclamation = await Reclamation.findByIdAndDelete(req.params.id);
        if (!deletedReclamation) {
            return res.status(404).json({ message: 'Reclamation not found' });
        }
        res.json({ message: "Reclamation deleted successfully" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Get reclamations by user ID
router.get('/user/:userId', async (req, res) => {
    try {
        const reclamations = await Reclamation.find({ userId: req.params.userId })
            .sort({ dateCreation: -1 });
        res.status(200).json(reclamations);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Get reclamations by status
router.get('/status/:status', async (req, res) => {
    try {
        const reclamations = await Reclamation.find({ statusRec: req.params.status })
            .populate('userId', 'name email')
            .sort({ dateCreation: -1 });
        res.status(200).json(reclamations);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;

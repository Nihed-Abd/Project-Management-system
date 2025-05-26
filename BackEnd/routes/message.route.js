const express = require('express');
const router = express.Router();
const Message = require('../models/message');

// Create a new message
router.post('/', async (req, res) => {
    try {
        const { name, email, subject, message } = req.body;
        
        // Validate required fields
        if (!name || !email || !subject || !message) {
            return res.status(400).json({ success: false, message: 'All fields are required' });
        }
        
        // Create new message
        const newMessage = new Message({
            name,
            email,
            subject,
            message
        });
        
        // Save the message
        await newMessage.save();
        
        res.status(201).json({ 
            success: true, 
            message: 'Message sent successfully'
        });
    } catch (error) {
        console.error('Error creating message:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Failed to send message'
        });
    }
});

// Get all messages (admin only route)
router.get('/', async (req, res) => {
    try {
        const messages = await Message.find().sort({ createdAt: -1 });
        res.status(200).json(messages);
    } catch (error) {
        console.error('Error fetching messages:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Failed to fetch messages'
        });
    }
});

// Mark message as read
router.put('/:id/read', async (req, res) => {
    try {
        const message = await Message.findByIdAndUpdate(
            req.params.id,
            { isRead: true },
            { new: true }
        );
        
        if (!message) {
            return res.status(404).json({ 
                success: false, 
                message: 'Message not found'
            });
        }
        
        res.status(200).json({ 
            success: true, 
            message: 'Message marked as read'
        });
    } catch (error) {
        console.error('Error updating message:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Failed to update message'
        });
    }
});

// Delete a message
router.delete('/:id', async (req, res) => {
    try {
        const message = await Message.findByIdAndDelete(req.params.id);
        
        if (!message) {
            return res.status(404).json({ 
                success: false, 
                message: 'Message not found'
            });
        }
        
        res.status(200).json({ 
            success: true, 
            message: 'Message deleted successfully'
        });
    } catch (error) {
        console.error('Error deleting message:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Failed to delete message'
        });
    }
});

module.exports = router;

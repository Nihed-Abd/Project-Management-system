const express = require('express');
const router = express.Router();
const axios = require('axios');
const Category = require('../models/categorie');

// Route to handle chatbot messages
router.post('/message', async (req, res) => {
    try {
        const { message } = req.body;
        
        if (!message) {
            return res.status(400).json({ success: false, message: 'Message is required' });
        }
        
        // Get categories to include in the prompt
        const categories = await Category.find({}, 'name');
        const categoryList = categories.map(cat => cat.name).join(', ');
        
        // Create context-aware prompt with categories
        const contextPrompt = `You are a helpful assistant for HEC ELECTRICITY, an electrical service company. 
Your name is "HEC Assistant". Always be polite, professional and helpful. 
Keep responses concise (max 10 sentences when possible) and focused on electrical services.

Our company provides these electrical services:
- Residential electrical installations
- Commercial electrical installations
- Industrial electrical solutions
- Electrical repairs and maintenance
- Electrical inspections
- Smart home automation
- Renewable energy solutions (solar panels, etc.)
- Emergency electrical services

We offer projects in these categories: ${categoryList}

Remember:
- NEVER make up information about the company or its services
- Redirect customers to contact page for specific appointments or urgent issues
- For specific pricing questions, suggest contacting us for a detailed quote
- Keep your answers related to electrical services only

USER QUERY: ${message}`;

        // Call Gemini API
        const response = await axios.post(
            `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
            {
                contents: [
                    {
                        parts: [
                            {
                                text: contextPrompt
                            }
                        ]
                    }
                ]
            },
            {
                headers: {
                    'Content-Type': 'application/json'
                }
            }
        );
        
        // Extract the response text
        const aiResponse = response.data.candidates[0].content.parts[0].text;
        
        res.status(200).json({
            success: true,
            message: aiResponse
        });
    } catch (error) {
        console.error('Chatbot API error:', error);
        
        // Provide more detailed error information for debugging
        const errorDetails = error.response ? {
            status: error.response.status,
            data: error.response.data
        } : error.message;
        
        res.status(500).json({
            success: false,
            message: 'Failed to process your message',
            error: errorDetails
        });
    }
});

module.exports = router;

const express = require('express');
const PushToken = require('../models/PushToken');
const sanitize = require('../middleware/sanitize');
const connectDB = require('./utils/db');
await connectDB();


const router = express.Router();

router.post('/subscribe', sanitize, async (req, res) => {
    const { token } = req.body;

    if (!token) {
        return res.status(400).json({ error: 'Token requis' });
    }

    try {
        const existingToken = await PushToken.findOne({ token });
        if (existingToken) {
            return res.json({ success: true, message: 'Token déjà enregistré' });
        }

        const newToken = new PushToken({ token });
        await newToken.save();

        res.json({ success: true, message: 'Souscription réussie' });
    } catch (error) {
        console.error('Erreur souscription push:', error);
        res.status(500).json({ error: 'Erreur lors de la souscription' });
    }
});

module.exports = router;
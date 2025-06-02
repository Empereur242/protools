const express = require('express');
const nodemailer = require('nodemailer');
const admin = require('firebase-admin');
const Message = require('../models/Message');
const sanitize = require('../utils/sanitize');
const connectDB = require('./utils/db');
await connectDB();


const router = express.Router();

router.post('/', sanitize, async (req, res) => {
    const { nom, email, message } = req.body;

    if (!nom || !email || !message || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        return res.status(400).json({ error: 'Données invalides' });
    }

    try {
        const newMessage = new Message({ nom, email, message });
        await newMessage.save();

        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.GMAIL_USER,
                pass: process.env.GMAIL_PASS
            }
        });

        await transporter.sendMail({
            from: '"ProTools" <${process.env.GMAIL_USER}>',
            to: 'admin@protools.com', // Remplacez par votre e-mail
            subject: 'Nouveau message de contact',
            text: `Nom: ${nom}\nE-mail: ${email}\nMessage: ${message}`,
            html: `<p><strong>Nom:</strong> ${nom}</p><p><strong>E-mail:</strong> ${email}</p><p><strong>Message:</strong> ${message}</p>`
        });

        const tokens = await PushToken.find().select('token');
        if (tokens.length > 0) {
            const messagePayload = {
                notification: {
                    title: 'Nouveau message',
                    body: `De: ${nom} (${email})`
                }
            };
            const registrationTokens = tokens.map(t => t.token);
            await admin.messaging().sendMulticast({
                tokens: registrationTokens,
                ...messagePayload
            });
        }

        res.json({ success: true, message: 'Message envoyé avec succès' });
    } catch (error) {
        console.error('Erreur envoi message:', error);
        res.status(500).json({ error: 'Erreur lors de l\'envoi du message' });
    }
});

module.exports = router;
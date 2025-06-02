const express = require('express');
const cors = require('cors');
const nodemailer = require('nodemailer');
const connectDB = require('./db');
require('dotenv').config();

const mongoose = require('mongoose');
const app = express();

// Connexion à MongoDB
connectDB();

app.use(cors());
app.use(express.json());

// Schéma pour les messages
const messageSchema = new mongoose.Schema({
    nom: String,
    email: String,
    message: String,
    date: { type: Date, default: Date.now }
});
const Message = mongoose.model('Message', messageSchema);

// Route pour recevoir les messages
app.post('/api/messages', async (req, res) => {
    const { nom, email, message } = req.body;

    if (!nom || !email || !message || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        return res.status(400).json({ error: 'Données invalides' });
    }

    const sanitizedNom = nom.replace(/<[^>]*>/g, '');
    const sanitizedEmail = email.replace(/<[^>]*>/g, '');
    const sanitizedMessage = message.replace(/<[^>]*>/g, '');

    const newMessage = new Message({ nom: sanitizedNom, email: sanitizedEmail, message: sanitizedMessage });
    await newMessage.save();

    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS
        }
    });

    await transporter.sendMail({
        from: `"ProTools" <${process.env.EMAIL_USER}>`,
        to: 'admin@protools.com',
        subject: 'Nouveau message de contact',
        text: `Nom: ${sanitizedNom}\nE-mail: ${sanitizedEmail}\nMessage: ${sanitizedMessage}`
    });

    res.json({ success: true, message: 'Message envoyé' });
});

// Port dynamique pour Railway/Vercel
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 Serveur démarré sur http://localhost:${PORT}`));

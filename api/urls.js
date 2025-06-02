const express = require('express');
const ShortUrl = require('../models/ShortUrl');
const sanitize = require('../middleware/sanitize');
const { nanoid } = require('nanoid');
const connectDB = require('./utils/db');
await connectDB();


const router = express.Router();

router.post('/', sanitize, async (req, res) => {
    const { url, alias, expiration } = req.body;

    try {
        new URL(url);
    } catch {
        return res.status(400).json({ error: 'URL invalide' });
    }

    try {
        let shortId = alias || nanoid(6);
        let expirationDate = null;

        if (expiration !== 'never') {
            const days = parseInt(expiration);
            expirationDate = new Date(Date.now() + days * 24 * 60 * 60 * 1000);
        }

        const existingUrl = await ShortUrl.findOne({ $or: [{ shortId }, { alias }] });
        if (existingUrl) {
            return res.status(400).json({ error: 'Alias ou ID déjà utilisé' });
        }

        const shortUrl = new ShortUrl({
            originalUrl: url,
            shortId,
            alias: alias || undefined,
            expiration: expirationDate
        });

        await shortUrl.save();

        res.json({
            success: true,
            shortUrl: `https://pro.tools/${shortId}`,
            expiration: expirationDate ? expirationDate.toLocaleDateString('fr-FR') : 'Jamais'
        });
    } catch (error) {
        console.error('Erreur création URL:', error);
        res.status(500).json({ error: 'Erreur lors du raccourcissement' });
    }
});

router.get('/:shortId', async (req, res) => {
    const { shortId } = req.params;

    try {
        const shortUrl = await ShortUrl.findOne({ $or: [{ shortId }, { alias: shortId }] });
        if (!shortUrl) {
            return res.status(404).send('URL non trouvée');
        }

        if (shortUrl.expiration && new Date() > shortUrl.expiration) {
            return res.status(410).send('URL expirée');
        }

        shortUrl.clicks += 1;
        await shortUrl.save();

        res.redirect(shortUrl.originalUrl);
    } catch (error) {
        console.error('Erreur redirection:', error);
        res.status(500).send('Erreur serveur');
    }
});

module.exports = router;
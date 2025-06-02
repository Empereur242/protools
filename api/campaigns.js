const express = require('express');
const Mailchimp = require('mailchimp-api-v3');
const sanitize = require('../middleware/sanitize');
const connectDB = require('./utils/db');
await connectDB();


const router = express.Router();
const mailchimp = new Mailchimp(process.env.MAILCHIMP_API_KEY);

// Mapper les valeurs de liste du frontend aux IDs Mailchimp
const listeMapping = {
    all: 'your_all_list_id',        // Remplacez par l'ID de votre liste Mailchimp
    premium: 'your_premium_list_id',
    prospects: 'your_prospects_list_id',
    active: 'your_active_list_id'
};

router.post('/', sanitize, async (req, res) => {
    const { objet, type, contenu, liste } = req.body;

    if (!objet || !type || !contenu || !liste || !listeMapping[liste]) {
        return res.status(400).json({ error: 'Données invalides ou liste non reconnue' });
    }

    try {
        const campaign = await mailchimp.post('/campaigns', {
            type: 'regular',
            recipients: { list_id: listeMapping[liste] },
            settings: {
                subject_line: objet,
                from_name: 'ProTools',
                reply_to: 'contact@protools.com'
            }
        });

        await mailchimp.put(`/campaigns/${campaign.id}/content`, {
            html: contenu
        });

        await mailchimp.post(`/campaigns/${campaign.id}/actions/send`);

        res.json({ success: true, message: 'Campagne créée et envoyée avec succès' });
    } catch (error) {
        console.error('Erreur campagne:', error);
        res.status(500).json({ error: 'Erreur lors de la création de la campagne' });
    }
});

router.post('/webhook', (req, res) => {
    const { type, data } = req.body;
    if (type === 'open') {
        console.log(`E-mail ouvert par ${data.email}`);
    } else if (type === 'click') {
        console.log(`Lien cliqué par ${data.email}: ${data.url}`);
    }
    res.sendStatus(200);
});

module.exports = router;
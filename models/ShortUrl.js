const mongoose = require('mongoose');

const shortUrlSchema = new mongoose.Schema({
    originalUrl: { type: String, required: true },
    shortId: { type: String, required: true, unique: true },
    alias: { type: String, unique: true, sparse: true },
    expiration: { type: Date },
    clicks: { type: Number, default: 0 },
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('ShortUrl', shortUrlSchema);
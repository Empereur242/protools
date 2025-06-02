const sanitizeHtml = require('sanitize-html');
const connectDB = require('./utils/db');
await connectDB();


const sanitize = (req, res, next) => {
    for (const key in req.body) {
        if (typeof req.body[key] === 'string') {
            req.body[key] = sanitizeHtml(req.body[key], {
                allowedTags: [],
                allowedAttributes: {}
            });
        }
    }
    next();
};

module.exports = sanitize;
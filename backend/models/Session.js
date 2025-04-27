const mongoose = require('mongoose');

const sessionSchema = new mongoose.Schema({
    userId: { type: String, required: true, unique: true },
    sessionKey: { type: String, required: true }
});

module.exports = mongoose.model('Session', sessionSchema);

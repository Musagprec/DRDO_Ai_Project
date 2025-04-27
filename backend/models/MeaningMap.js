const mongoose = require('mongoose');

const meaningMapSchema = new mongoose.Schema({
    doodle: { type: String, required: true, unique: true },
    mappedMeaning: { type: String, required: true }
});

module.exports = mongoose.model('MeaningMap', meaningMapSchema);

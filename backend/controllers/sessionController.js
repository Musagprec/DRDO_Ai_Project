const Session = require('../models/Session');

// ✅ Register or Update Session Key
exports.registerSession = async (req, res) => {
    const { userId, sessionKey } = req.body;

    try {
        await Session.findOneAndUpdate({ userId }, { sessionKey }, { upsert: true });
        res.json({ success: true, message: 'Session registered successfully' });
    } catch (error) {
        console.error('❌ Error registering session:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

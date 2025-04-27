const Session = require('../models/Session');
const MeaningMap = require('../models/MeaningMap');
const { encryptMessage, decryptMessage, generateHMAC } = require('../utils/encryption');
const { io } = require('../server'); // Import socket instance

// ✅ Send Encrypted Message
exports.sendMessage = async (req, res) => {
    const { sender, receiver, imageUrl, result } = req.body;

    console.log(`📨 Message from ${sender} → ${receiver} | Doodle: ${result}`);

    const session = await Session.findOne({ userId: sender });
    if (!session) {
        console.error(`❌ No session found for ${sender}`);
        return res.status(400).json({ success: false, message: 'Session key not found' });
    }

    // const mappedMeaning = await MeaningMap.findOne({ doodle: result });
    // if (!mappedMeaning) {
    //     return res.status(400).json({ success: false, message: 'Mapped meaning not found' });
    // }

    // const encryptedImage = encryptMessage(imageUrl, session.sessionKey);
    const encryptedText = encryptMessage(result, session.sessionKey);
    // const integrityHash = generateHMAC(imageUrl + mappedMeaning.mappedMeaning, session.sessionKey);

    io.to(receiver).emit('receive-message', { sender, encryptedText });
    res.json({ success: true, message: 'Message sent securely' });
};

// ✅ Decrypt Received Message
exports.decryptMessage = async (req, res) => {
    const { userId, encryptedImage, encryptedText } = req.body;

    const session = await Session.findOne({ userId });
    if (!session) return res.status(400).json({ success: false, message: 'Session key not found' });

    const decryptedImage = decryptMessage(encryptedImage, session.sessionKey);
    const decryptedText = decryptMessage(encryptedText, session.sessionKey);

    res.json({ success: true, decryptedImage, decryptedText });
};

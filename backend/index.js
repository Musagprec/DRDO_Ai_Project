// const express = require('express');
// const crypto = require('crypto');
// const cors = require('cors');
// const http = require('http');
// const { Server } = require('socket.io');
// const mongoose = require('mongoose');

// const app = express();
// const server = http.createServer(app);
// const io = new Server(server, { cors: { origin: '*' } });

// app.use(express.json());
// app.use(cors());

// // ✅ Connect to MongoDB
// mongoose.connect('mongodb://localhost:27017/SecureMessaging', {
//     useNewUrlParser: true,
//     useUnifiedTopology: true
// });

// mongoose.connection.on('connected', () => console.log('✅ MongoDB connected'));
// mongoose.connection.on('error', (err) => console.error('❌ MongoDB error:', err));
// mongoose.connection.on('disconnected', () => console.log('⚠️ MongoDB disconnected'));

// // ✅ Define Session Schema & Model
// const SessionSchema = new mongoose.Schema({
//     userId: String,
//     sessionKey: String
// });
// const Session = mongoose.model('Session', SessionSchema);

// // ✅ Encryption Functions
// function encryptMessage(message, key) {
//     const iv = crypto.randomBytes(16); // Generate IV
//     const cipher = crypto.createCipheriv('aes-256-cbc', Buffer.from(key, 'hex'), iv);
//     let encrypted = cipher.update(message, 'utf8', 'hex');
//     encrypted += cipher.final('hex');
//     return iv.toString('hex') + encrypted; // Store IV with encrypted message
// }

// function decryptMessage(encrypted, key) {
//     try {
//         const iv = Buffer.from(encrypted.slice(0, 32), 'hex'); // Extract IV
//         const encryptedData = encrypted.slice(32);
//         const decipher = crypto.createDecipheriv('aes-256-cbc', Buffer.from(key, 'hex'), iv);
//         let decrypted = decipher.update(encryptedData, 'hex', 'utf8');
//         decrypted += decipher.final('utf8');
//         return decrypted;
//     } catch (error) {
//         return null;
//     }
// }

// function generateHMAC(message, key) {
//     return crypto.createHmac('sha256', key).update(message).digest('hex');
// }

// // ✅ Register Session Key
// app.post('/register-session', async (req, res) => {
//     const { userId, sessionKey } = req.body;
//     await Session.findOneAndUpdate({ userId }, { sessionKey }, { upsert: true });
//     res.json({ success: true, message: 'Session registered successfully' });
// });

// // ✅ Send Encrypted Message
// app.post('/send-message', async (req, res) => {
//     const { sender, receiver, imageUrl, result } = req.body;

//     console.log(`📨 Message from ${sender} → ${receiver} | Doodle: ${result}`);

//     // Check if session exists
//     const session = await Session.findOne({ userId: sender });
//     if (!session) {
//         console.error(`❌ No session found for ${sender}`);
//         return res.status(400).json({ success: false, message: 'Session key not found' });
//     }

//     console.log(`✅ Found session key: ${session.sessionKey}`);

//     // Fetch mapped meaning
//     const mappedMeaning = await MeaningMap.findOne({ doodle: result });
//     if (!mappedMeaning) {
//         return res.status(400).json({ success: false, message: 'Mapped meaning not found' });
//     }

//     // Encrypt and send message
//     const encryptedImage = encryptMessage(imageUrl, session.sessionKey);
//     const encryptedText = encryptMessage(mappedMeaning.mappedMeaning, session.sessionKey);
//     const integrityHash = generateHMAC(imageUrl + mappedMeaning.mappedMeaning, session.sessionKey);

//     io.to(receiver).emit('receive-message', { sender, encryptedImage, encryptedText, integrityHash });
//     res.json({ success: true, message: 'Message sent securely', mappedMeaning: mappedMeaning.mappedMeaning });
// });


// // ✅ Receive & Decrypt Message
// app.post('/decrypt-message', async (req, res) => {
//     const { userId, encryptedImage, encryptedText } = req.body;

//     const session = await Session.findOne({ userId });
//     if (!session) return res.status(400).json({ success: false, message: 'Session key not found' });

//     const decryptedImage = decryptMessage(encryptedImage, session.sessionKey);
//     const decryptedText = decryptMessage(encryptedText, session.sessionKey);

//     res.json({ success: true, decryptedImage, decryptedText });
// });

// // ✅ Handle Socket Connections
// io.on('connection', (socket) => {
//     socket.on('register-user', (userId) => {
//         socket.join(userId);
//     });
// });

// server.listen(7000, () => console.log('🚀 Server running on port 7000'));

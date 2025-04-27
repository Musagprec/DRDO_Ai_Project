require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const http = require('http');
const { Server } = require('socket.io');
const crypto = require("crypto"); 
const sessionRoutes = require('./routes/sessionRoutes');
const messageRoutes = require('./routes/messageRoutes');
const authRoutes = require('./routes/authRoutes');

const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: '*' } });

app.use(express.json());
app.use(cors());

// ✅ MongoDB Connection
mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(() => console.log('✅ MongoDB Connected'))
.catch((err) => console.error('❌ MongoDB Error:', err));

// ✅ Routes
app.use('/api/session', sessionRoutes);
app.use('/api/message', messageRoutes);
app.use("/api/auth", authRoutes);


// Generate a **random 32-byte secret key** for each session
const SECRET_KEY = crypto.randomBytes(32); // ✅ Ensures 32-byte AES-256 key

const encryptMessage = (message) => {
    const iv = crypto.randomBytes(16); // ✅ Generates a 16-byte IV
    const key = crypto.createHash("sha256").update(SECRET_KEY).digest(); // ✅ Ensures 32-byte key

    const cipher = crypto.createCipheriv("aes-256-cbc", key, iv);
    let encrypted = cipher.update(message, "utf-8", "hex");
    encrypted += cipher.final("hex");

    return { encryptedMessage: encrypted, iv: iv.toString("hex") };
};

app.get("/api/message", (req, res) => {
    const { encryptedMessage, iv } = encryptMessage("This is a secret message");
    const secretKeyHash = crypto.createHash("sha256").update(SECRET_KEY).digest("hex");

    res.json({ encryptedMessage, secretKeyHash, iv });
});

app.post("/api/acknowledge", (req, res) => {
    const { sender, receiver, message } = req.body;
    console.log(`Acknowledgment from ${sender} to ${receiver}: ${message}`);
    res.json({ msg: "Acknowledgment sent successfully!" });
});

// ✅ Handle Socket Connections
io.on('connection', (socket) => {
    socket.on('register-user', (userId) => {
        socket.join(userId);
    });
});

// ✅ Export Socket Instance
module.exports.io = io;

// ✅ Start Server
server.listen(process.env.PORT, () => console.log(`🚀 Server running on port ${process.env.PORT}`));

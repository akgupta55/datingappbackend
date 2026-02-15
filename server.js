const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const path = require('path');
const connectDB = require('./config/db');
const User = require('./models/User');
const Message = require('./models/Message');
require('dotenv').config();

const app = express();
const server = http.createServer(app);

// CORS Origins
const allowedOrigins = [process.env.CLIENT_URL, 'http://localhost:5173'].filter(Boolean);

const io = new Server(server, {
    cors: {
        origin: (origin, callback) => {
            if (!origin || allowedOrigins.includes(origin)) {
                callback(null, true);
            } else {
                callback(new Error('Not allowed by Socket.io CORS'));
            }
        },
        methods: ['GET', 'POST'],
    },
});

// Connect to Database
connectDB();

// Middleware
app.use(cors({
    origin: (origin, callback) => {
        if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true
}));
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/profile', require('./routes/profile'));
app.use('/api/chat', require('./routes/chat'));
app.use('/api/upload', require('./routes/upload'));

// Socket.io logic
let onlineUsers = new Map(); // userId -> socketId

io.on('connection', (socket) => {
    console.log('User connected:', socket.id);

    socket.on('setup', (userId) => {
        socket.join(userId);
        onlineUsers.set(userId, socket.id);
        socket.emit('connected');
        io.emit('online-users', Array.from(onlineUsers.keys()));
    });

    socket.on('join-chat', (room) => {
        socket.join(room);
        console.log('User joined room:', room);
    });

    socket.on('typing', (room) => socket.in(room).emit('typing'));
    socket.on('stop-typing', (room) => socket.in(room).emit('stop-typing'));

    socket.on('new-message', async (newMessage) => {
        const { senderId, receiverId, text, chat } = newMessage;
        if (!chat || !text) return console.log('Invalid message data');

        try {
            // Save to database
            const message = new Message({
                senderId,
                receiverId,
                text
            });
            const savedMessage = await message.save();

            // Emit to recipient if online
            socket.in(receiverId).emit('message-received', savedMessage);

            // Optionally emit back to sender to confirm save/sync
            // socket.emit('message-sent', savedMessage);
        } catch (err) {
            console.error('Error saving message:', err);
        }
    });

    socket.on('disconnect', () => {
        onlineUsers.forEach((value, key) => {
            if (value === socket.id) {
                onlineUsers.delete(key);
            }
        });
        io.emit('online-users', Array.from(onlineUsers.keys()));
        console.log('User disconnected');
    });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));

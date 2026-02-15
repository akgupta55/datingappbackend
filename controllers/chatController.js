const Message = require('../models/Message');

// @desc    Get all messages for a specific chat
// @route   GET /api/chat/:receiverId
// @access  Private
exports.getMessages = async (req, res) => {
    try {
        const messages = await Message.find({
            $or: [
                { senderId: req.user.id, receiverId: req.params.receiverId },
                { senderId: req.params.receiverId, receiverId: req.user.id }
            ]
        }).sort({ createdAt: 1 });
        res.json(messages);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// @desc    Save a message (usually done via socket, this is a fallback or for history)
// @route   POST /api/chat
// @access  Private
exports.sendMessage = async (req, res) => {
    const { receiverId, text } = req.body;
    try {
        const message = new Message({
            senderId: req.user.id,
            receiverId,
            text
        });
        await message.save();
        res.status(201).json(message);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

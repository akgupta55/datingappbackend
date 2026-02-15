const User = require('../models/User');

// @desc    Get user profile
// @route   GET /api/profile/:id
// @access  Private
const getProfile = async (req, res) => {
    try {
        const user = await User.findById(req.params.id).select('-password');
        if (!user) return res.status(404).json({ message: 'User not found' });
        res.json(user);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// @desc    Update user profile
// @route   PUT /api/profile
// @access  Private
const updateProfile = async (req, res) => {
    const { name, age, bio, interests, avatar } = req.body;
    try {
        const user = await User.findById(req.user.id);
        if (!user) return res.status(404).json({ message: 'User not found' });

        user.name = name || user.name;
        user.age = age || user.age;
        user.bio = bio || user.bio;
        user.interests = interests || user.interests;
        user.avatar = avatar || user.avatar;

        await user.save();
        res.json(user);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// @desc    Get all profiles (Discover)
// @route   GET /api/profile
// @access  Private
const getAllProfiles = async (req, res) => {
    try {
        const profiles = await User.find({ _id: { $ne: req.user.id } }).select('-password');
        res.json(profiles);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// @desc    Get current user profile
// @route   GET /api/profile/me
// @access  Private
const getMe = async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select('-password');
        if (!user) return res.status(404).json({ message: 'User not found' });
        res.json(user);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

module.exports = {
    getProfile,
    updateProfile,
    getAllProfiles,
    getMe
};

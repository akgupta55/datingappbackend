const User = require('../models/User');
const jwt = require('jsonwebtoken');

// @desc    Register user
// @route   POST /api/auth/register
// @access  Public
exports.register = async (req, res) => {
    const { name, email, password, age } = req.body;

    try {
        let user = await User.findOne({ email });
        if (user) {
            console.log('Registration failed: User already exists', email);
            return res.status(400).json({ message: 'User already exists' });
        }

        user = new User({ name, email, password, age });
        await user.save();
        console.log('User registered successfully:', email);

        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });
        res.status(201).json({ token, user: { id: user._id, name, email } });
    } catch (err) {
        console.error('Registration error:', err);
        res.status(500).json({ message: err.message });
    }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
exports.login = async (req, res) => {
    const { email, password } = req.body;

    try {
        const user = await User.findOne({ email });
        if (!user) {
            console.log('Login failed: User not found', email);
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        const isMatch = await user.matchPassword(password);
        if (!isMatch) {
            console.log('Login failed: Password mismatch for', email);
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        console.log('Login successful for', email);
        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });
        res.json({ token, user: { id: user._id, name: user.name, email: user.email } });
    } catch (err) {
        console.error('Login error:', err);
        res.status(500).json({ message: err.message });
    }
};

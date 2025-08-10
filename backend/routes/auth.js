const express = require('express');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const router = express.Router();

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

// Register new user
router.post('/register', async (req, res) => {
    try {
        const { username, email, password } = req.body;

        if (!username || !email || !password) {
            return res.status(400).json({ message: 'All fields are required' });
        }

        const user = new User();
        
        // Check if user already exists
        const existingUser = user.findByEmail(email);
        if (existingUser) {
            return res.status(400).json({ message: 'User already exists' });
        }

        const existingUsername = user.findByUsername(username);
        if (existingUsername) {
            return res.status(400).json({ message: 'Username already taken' });
        }

        const newUser = await user.create({ username, email, password });
        const { password: _, ...userWithoutPassword } = newUser;

        const token = jwt.sign({ userId: newUser.id }, JWT_SECRET, { expiresIn: '7d' });

        res.status(201).json({
            message: 'User created successfully',
            token,
            user: userWithoutPassword
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// Login user
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ message: 'Email and password are required' });
        }

        const user = new User();
        const existingUser = user.findByEmail(email);

        if (!existingUser) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        const isValidPassword = await user.validatePassword(email, password);
        if (!isValidPassword) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        const token = jwt.sign({ userId: existingUser.id }, JWT_SECRET, { expiresIn: '7d' });
        const { password: _, ...userWithoutPassword } = existingUser;

        res.json({
            message: 'Login successful',
            token,
            user: userWithoutPassword
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// Get current user
router.get('/me', authenticateToken, (req, res) => {
    const user = new User();
    const currentUser = user.findById(req.user.userId);
    
    if (!currentUser) {
        return res.status(404).json({ message: 'User not found' });
    }

    res.json({ user: currentUser });
});

// Middleware to authenticate token
function authenticateToken(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({ message: 'Access token required' });
    }

    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) {
            return res.status(403).json({ message: 'Invalid token' });
        }
        req.user = user;
        next();
    });
}

module.exports = router;

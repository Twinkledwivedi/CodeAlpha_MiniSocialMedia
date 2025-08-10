const express = require('express');
const User = require('../models/User');
const router = express.Router();

// Middleware to authenticate token
function authenticateToken(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({ message: 'Access token required' });
    }

    const jwt = require('jsonwebtoken');
    const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';
    
    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) {
            return res.status(403).json({ message: 'Invalid token' });
        }
        req.user = user;
        next();
    });
}

// Get all users
router.get('/', (req, res) => {
    try {
        const user = new User();
        const users = user.findAll();
        res.json(users);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// Get user by ID
router.get('/:id', (req, res) => {
    try {
        const user = new User();
        const foundUser = user.findById(req.params.id);
        
        if (!foundUser) {
            return res.status(404).json({ message: 'User not found' });
        }
        
        res.json({ user: foundUser });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// Get user by username
router.get('/username/:username', (req, res) => {
    try {
        const user = new User();
        const foundUser = user.findByUsername(req.params.username);
        
        if (!foundUser) {
            return res.status(404).json({ message: 'User not found' });
        }
        
        res.json({ user: foundUser });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// Update user profile
router.put('/:id', authenticateToken, (req, res) => {
    try {
        const { username, bio, profilePicture } = req.body;
        
        if (req.params.id !== req.user.userId) {
            return res.status(403).json({ message: 'Not authorized to update this profile' });
        }
        
        const user = new User();
        const existingUser = user.findById(req.params.id);
        
        if (!existingUser) {
            return res.status(404).json({ message: 'User not found' });
        }
        
        // Check if username is already taken by another user
        if (username && username !== existingUser.username) {
            const usernameTaken = user.findByUsername(username);
            if (usernameTaken && usernameTaken.id !== req.params.id) {
                return res.status(400).json({ message: 'Username already taken' });
            }
        }
        
        const updateData = {};
        if (username) updateData.username = username;
        if (bio !== undefined) updateData.bio = bio;
        if (profilePicture !== undefined) updateData.profilePicture = profilePicture;
        
        const updatedUser = user.update(req.params.id, updateData);
        res.json({
            message: 'Profile updated successfully',
            user: updatedUser
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// Get user posts
router.get('/:id/posts', (req, res) => {
    try {
        const Database = require('../models/database');
        const postsDb = new Database('posts.json');
        const usersDb = new Database('users.json');
        
        let posts = postsDb.findAll().filter(post => post.userId === req.params.id);
        
        // Sort posts by timestamp (newest first)
        posts = posts.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        
        // Add user information to posts
        const user = usersDb.findById(req.params.id);
        posts = posts.map(post => ({
            ...post,
            user: user ? {
                id: user.id,
                username: user.username,
                profilePicture: user.profilePicture
            } : null
        }));
        
        res.json(posts);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// Follow/unfollow user
router.put('/:id/follow', authenticateToken, (req, res) => {
    try {
        const targetUserId = req.params.id;
        const currentUserId = req.user.userId;
        
        if (targetUserId === currentUserId) {
            return res.status(400).json({ message: 'Cannot follow yourself' });
        }
        
        const user = new User();
        const targetUser = user.findById(targetUserId);
        const currentUser = user.findById(currentUserId);
        
        if (!targetUser || !currentUser) {
            return res.status(404).json({ message: 'User not found' });
        }
        
        // Check if already following
        const isFollowing = currentUser.following.includes(targetUserId);
        
        if (isFollowing) {
            // Unfollow
            currentUser.following = currentUser.following.filter(id => id !== targetUserId);
            targetUser.followers = targetUser.followers.filter(id => id !== currentUserId);
        } else {
            // Follow
            currentUser.following.push(targetUserId);
            targetUser.followers.push(currentUserId);
        }
        
        user.update(currentUserId, { following: currentUser.following });
        user.update(targetUserId, { followers: targetUser.followers });
        
        res.json({
            message: isFollowing ? 'User unfollowed' : 'User followed',
            following: !isFollowing
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// Get user's followers
router.get('/:id/followers', (req, res) => {
    try {
        const user = new User();
        const foundUser = user.findById(req.params.id);
        
        if (!foundUser) {
            return res.status(404).json({ message: 'User not found' });
        }
        
        const followers = foundUser.followers.map(followerId => {
            const follower = user.findById(followerId);
            return follower ? {
                id: follower.id,
                username: follower.username,
                profilePicture: follower.profilePicture
            } : null;
        }).filter(Boolean);
        
        res.json({ followers });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// Get user's following
router.get('/:id/following', (req, res) => {
    try {
        const user = new User();
        const foundUser = user.findById(req.params.id);
        
        if (!foundUser) {
            return res.status(404).json({ message: 'User not found' });
        }
        
        const following = foundUser.following.map(followingId => {
            const followingUser = user.findById(followingId);
            return followingUser ? {
                id: followingUser.id,
                username: followingUser.username,
                profilePicture: followingUser.profilePicture
            } : null;
        }).filter(Boolean);
        
        res.json({ following });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

module.exports = router;

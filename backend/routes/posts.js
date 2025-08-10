const express = require('express');
const multer = require('multer');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const Database = require('../models/database');
const router = express.Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'backend/uploads/');
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + '-' + Math.round(Math.random() * 1E9) + path.extname(file.originalname));
    }
});

const upload = multer({
    storage: storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
    fileFilter: (req, file, cb) => {
        if (file.mimetype.startsWith('image/')) {
            cb(null, true);
        } else {
            cb(new Error('Only image files are allowed'));
        }
    }
});

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

// Get all posts
router.get('/', (req, res) => {
    try {
        const postsDb = new Database('posts.json');
        const usersDb = new Database('users.json');
        
        let posts = postsDb.findAll();
        const users = usersDb.findAll();
        
        // Sort posts by timestamp (newest first)
        posts = posts.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        
        // Add user information to posts
        posts = posts.map(post => {
            const user = users.find(u => u.id === post.userId);
            return {
                ...post,
                user: user ? {
                    id: user.id,
                    username: user.username,
                    profilePicture: user.profilePicture
                } : null
            };
        });
        
        res.json(posts);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// Get single post
router.get('/:id', (req, res) => {
    try {
        const postsDb = new Database('posts.json');
        const usersDb = new Database('users.json');
        
        const post = postsDb.findById(req.params.id);
        if (!post) {
            return res.status(404).json({ message: 'Post not found' });
        }
        
        const user = usersDb.findById(post.userId);
        const postWithUser = {
            ...post,
            user: user ? {
                id: user.id,
                username: user.username,
                profilePicture: user.profilePicture
            } : null
        };
        
        res.json(postWithUser);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// Create new post
router.post('/', authenticateToken, upload.single('image'), (req, res) => {
    try {
        const { content } = req.body;
        const image = req.file ? req.file.filename : null;
        
        if (!content && !image) {
            return res.status(400).json({ message: 'Content or image is required' });
        }
        
        const postsDb = new Database('posts.json');
        
        const newPost = {
            id: uuidv4(),
            userId: req.user.userId,
            content: content || '',
            image: image,
            likes: [],
            comments: [],
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };
        
        const createdPost = postsDb.create(newPost);
        
        // Get user info
        const usersDb = new Database('users.json');
        const user = usersDb.findById(req.user.userId);
        
        const postWithUser = {
            ...createdPost,
            user: user ? {
                id: user.id,
                username: user.username,
                profilePicture: user.profilePicture
            } : null
        };
        
        res.status(201).json({
            message: 'Post created successfully',
            post: postWithUser
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// Like/unlike post
router.put('/:id/like', authenticateToken, (req, res) => {
    try {
        const postsDb = new Database('posts.json');
        const post = postsDb.findById(req.params.id);
        
        if (!post) {
            return res.status(404).json({ message: 'Post not found' });
        }
        
        const userId = req.user.userId;
        const likeIndex = post.likes.indexOf(userId);
        
        if (likeIndex > -1) {
            post.likes.splice(likeIndex, 1);
        } else {
            post.likes.push(userId);
        }
        
        post.updatedAt = new Date().toISOString();
        postsDb.update(post.id, post);
        
        res.json({
            message: likeIndex > -1 ? 'Post unliked' : 'Post liked',
            likes: post.likes
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// Add comment to post
router.post('/:id/comments', authenticateToken, (req, res) => {
    try {
        const { content } = req.body;
        
        if (!content) {
            return res.status(400).json({ message: 'Comment content is required' });
        }
        
        const postsDb = new Database('posts.json');
        const post = postsDb.findById(req.params.id);
        
        if (!post) {
            return res.status(404).json({ message: 'Post not found' });
        }
        
        const newComment = {
            id: uuidv4(),
            userId: req.user.userId,
            content: content,
            createdAt: new Date().toISOString()
        };
        
        post.comments.push(newComment);
        post.updatedAt = new Date().toISOString();
        postsDb.update(post.id, post);
        
        res.status(201).json({
            message: 'Comment added successfully',
            comment: newComment
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// Delete post
router.delete('/:id', authenticateToken, (req, res) => {
    try {
        const postsDb = new Database('posts.json');
        const post = postsDb.findById(req.params.id);
        
        if (!post) {
            return res.status(404).json({ message: 'Post not found' });
        }
        
        if (post.userId !== req.user.userId) {
            return res.status(403).json({ message: 'Not authorized to delete this post' });
        }
        
        postsDb.delete(req.params.id);
        res.json({ message: 'Post deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

module.exports = router;

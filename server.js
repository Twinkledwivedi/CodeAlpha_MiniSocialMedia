const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public'));
app.use('/uploads', express.static('backend/uploads'));

// Import routes
const authRoutes = require('./backend/routes/auth');
const postRoutes = require('./backend/routes/posts');
const userRoutes = require('./backend/routes/users');

// Use routes
app.use('/api/auth', authRoutes);
app.use('/api/posts', postRoutes);
app.use('/api/users', userRoutes);

// Initialize database files
const initDatabase = () => {
    const dataDir = path.join(__dirname, 'backend', 'data');
    if (!fs.existsSync(dataDir)) {
        fs.mkdirSync(dataDir);
    }
    
    const files = ['users.json', 'posts.json'];
    files.forEach(file => {
        const filePath = path.join(dataDir, file);
        if (!fs.existsSync(filePath)) {
            fs.writeFileSync(filePath, JSON.stringify([]));
        }
    });
};

// Start server
app.listen(PORT, () => {
    initDatabase();
    console.log(`Server running on http://localhost:${PORT}`);
});

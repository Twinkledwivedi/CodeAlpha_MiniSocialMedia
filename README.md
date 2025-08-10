# Mini Social Media Platform

A full-stack social media platform built with Node.js, Express, and vanilla JavaScript. Features include user authentication, posts, likes, comments, and user profiles.

## Features

- **User Authentication**: Register, login, and logout functionality
- **Posts**: Create, edit, and delete posts with text and images
- **Likes**: Like/unlike posts
- **Comments**: Add comments to posts
- **User Profiles**: View and update user profiles
- **Follow System**: Follow/unfollow other users
- **Responsive Design**: Works on desktop and mobile devices

## Tech Stack

- **Backend**: Node.js, Express.js
- **Frontend**: HTML, CSS, JavaScript
- **Database**: JSON file-based storage
- **Authentication**: JWT tokens
- **File Upload**: Multer for image uploads

## Installation

1. **Clone or download the project**
2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Start the server**:
   ```bash
   npm start
   ```

4. **Open your browser** and navigate to:
   ```
   http://localhost:3000
   ```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user

### Posts
- `GET /api/posts` - Get all posts
- `GET /api/posts/:id` - Get single post
- `POST /api/posts` - Create new post
- `PUT /api/posts/:id/like` - Like/unlike post
- `POST /api/posts/:id/comments` - Add comment to post
- `DELETE /api/posts/:id` - Delete post

### Users
- `GET /api/users` - Get all users
- `GET /api/users/:id` - Get user by ID
- `GET /api/users/username/:username` - Get user by username
- `PUT /api/users/:id` - Update user profile
- `GET /api/users/:id/posts` - Get user's posts
- `PUT /api/users/:id/follow` - Follow/unfollow user
- `GET /api/users/:id/followers` - Get user's followers
- `GET /api/users/:id/following` - Get user's following

## Project Structure

```
mini-social-media/
├── server.js                 # Main server file
├── package.json             # Dependencies and scripts
├── backend/
│   ├── models/
│   │   ├── database.js      # Database helper
│   │   └── User.js         # User model
│   ├── routes/
│   │   ├── auth.js         # Authentication routes
│   │   ├── posts.js        # Posts routes
│   │   └── users.js        # Users routes
│   ├── uploads/            # Image uploads directory
│   └── data/               # JSON data files
├── public/
│   ├── index.html          # Main HTML file
│   ├── css/
│   │   └── style.css       # Styles
│   ├── js/
│   │   └── app.js          # Frontend JavaScript
│   └── images/             # Static images
└── README.md               # This file
```

## Usage

1. **Register**: Create a new account with username, email, and password
2. **Login**: Use your credentials to login
3. **Create Posts**: Add text and optionally upload images
4. **Interact**: Like posts and add comments
5. **Profile**: Update your profile information
6. **Follow**: Follow other users to see their posts

## Development

To run in development mode with auto-restart:
```bash
npm install -g nodemon
npm run dev
```

## Security Features

- Password hashing with bcrypt
- JWT token authentication
- Input validation
- File upload restrictions (images only, 5MB limit)

## Future Enhancements

- Real-time notifications
- Direct messaging
- Post sharing
- Hashtags and trending topics
- User search functionality
- Image filters and editing
- Dark mode theme

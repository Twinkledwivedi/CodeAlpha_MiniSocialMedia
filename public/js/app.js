// API Base URL
const API_BASE_URL = 'http://localhost:3000/api';

// Global variables
let currentUser = null;
let authToken = null;

// Initialize app
document.addEventListener('DOMContentLoaded', () => {
    checkAuthStatus();
    setupEventListeners();
});

// Check authentication status
function checkAuthStatus() {
    authToken = localStorage.getItem('authToken');
    if (authToken) {
        fetchCurrentUser();
    } else {
        showAppSection();
    }
}

// Setup event listeners
function setupEventListeners() {
    // Auth forms
    document.getElementById('login-form').addEventListener('submit', handleLogin);
    document.getElementById('register-form').addEventListener('submit', handleRegister);
    
    // Navigation
    document.getElementById('login-link').addEventListener('click', showAuthSection);
    document.getElementById('logout-link').addEventListener('click', handleLogout);
    document.getElementById('home-link').addEventListener('click', loadHome);
    document.getElementById('profile-link').addEventListener('click', loadProfile);
    
    // Post creation
    document.getElementById('create-post-btn').addEventListener('click', createPost);
    
    // Auth tabs
    document.querySelectorAll('.auth-tab').forEach(tab => {
        tab.addEventListener('click', switchAuthTab);
    });
}

// Switch auth tabs
function switchAuthTab(e) {
    const tabs = document.querySelectorAll('.auth-tab');
    const forms = document.querySelectorAll('.auth-form');
    
    tabs.forEach(tab => tab.classList.remove('active'));
    forms.forEach(form => form.style.display = 'none');
    
    e.target.classList.add('active');
    const tabName = e.target.dataset.tab;
    document.getElementById(`${tabName}-form`).style.display = 'block';
}

// Show auth section
function showAuthSection() {
    document.getElementById('auth-section').style.display = 'block';
    document.getElementById('app-section').style.display = 'none';
    localStorage.removeItem('authToken');
    localStorage.removeItem('currentUser');
    authToken = null;
    currentUser = null;
}

// Show app section
function showAppSection() {
    document.getElementById('auth-section').style.display = 'none';
    document.getElementById('app-section').style.display = 'block';
    document.getElementById('login-link').style.display = 'none';
    document.getElementById('logout-link').style.display = 'inline-block';
    loadHome();
}

// Fetch current user
async function fetchCurrentUser() {
    try {
        const response = await fetch(`${API_BASE_URL}/auth/me`, {
            headers: {
                'Authorization': `Bearer ${authToken}`
            }
        });
        
        if (response.ok) {
            const data = await response.json();
            currentUser = data.user;
            localStorage.setItem('currentUser', JSON.stringify(currentUser));
            showAppSection();
        } else {
            showAuthSection();
        }
    } catch (error) {
        console.error('Error fetching user:', error);
        showAuthSection();
    }
}

// Handle login
async function handleLogin(e) {
    e.preventDefault();
    
    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;
    
    try {
        const response = await fetch(`${API_BASE_URL}/auth/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email, password })
        });
        
        const data = await response.json();
        
        if (response.ok) {
            authToken = data.token;
            currentUser = data.user;
            localStorage.setItem('authToken', authToken);
            localStorage.setItem('currentUser', JSON.stringify(currentUser));
            showAppSection();
            document.getElementById('login-form').reset();
        } else {
            alert(data.message || 'Login failed');
        }
    } catch (error) {
        alert('Login error: ' + error.message);
    }
}

// Handle register
async function handleRegister(e) {
    e.preventDefault();
    
    const username = document.getElementById('register-username').value;
    const email = document.getElementById('register-email').value;
    const password = document.getElementById('register-password').value;
    
    try {
        const response = await fetch(`${API_BASE_URL}/auth/register`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ username, email, password })
        });
        
        const data = await response.json();
        
        if (response.ok) {
            authToken = data.token;
            currentUser = data.user;
            localStorage.setItem('authToken', authToken);
            localStorage.setItem('currentUser', JSON.stringify(currentUser));
            showAppSection();
            document.getElementById('register-form').reset();
        } else {
            alert(data.message || 'Registration failed');
        }
    } catch (error) {
        alert('Registration error: ' + error.message);
    }
}

// Handle logout
function handleLogout() {
    localStorage.removeItem('authToken');
    localStorage.removeItem('currentUser');
    showAuthSection();
}

// Load home page
async function loadHome() {
    await loadPosts();
}

// Load profile page
async function loadProfile() {
    // This would load the current user's profile
    console.log('Loading profile...');
}

// Load posts
async function loadPosts() {
    try {
        const headers = {};
        if (authToken) {
            headers['Authorization'] = `Bearer ${authToken}`;
        }
        const response = await fetch(`${API_BASE_URL}/posts`, {
            headers: headers
        });
        
        const posts = await response.json();
        displayPosts(posts);
    } catch (error) {
        console.error('Error loading posts:', error);
    }
}

// Display posts
function displayPosts(posts) {
    const postsList = document.getElementById('posts-list');
    postsList.innerHTML = '';
    
    if (posts.length === 0) {
        postsList.innerHTML = '<p class="no-posts">No posts yet. Be the first to post!</p>';
        return;
    }
    
    posts.forEach(post => {
        const postElement = createPostElement(post);
        postsList.appendChild(postElement);
    });
}

// Create post element
function createPostElement(post) {
    const postDiv = document.createElement('div');
    postDiv.className = 'post';
    
    const postContent = `
        <div class="post-header">
            <div class="post-avatar">${post.user.username.charAt(0).toUpperCase()}</div>
            <div class="post-user-info">
                <h4>${post.user.username}</h4>
                <span class="post-time">${new Date(post.createdAt).toLocaleDateString()}</span>
            </div>
        </div>
        <div class="post-content">${post.content}</div>
        ${post.image ? `<img src="/uploads/${post.image}" alt="Post image" class="post-image">` : ''}
        <div class="post-actions">
            <button class="post-action like-btn ${post.likes.includes(currentUser.id) ? 'liked' : ''}" 
                    onclick="toggleLike('${post.id}')">
                <i class="fas fa-heart"></i>
                <span>${post.likes.length}</span>
            </button>
            <button class="post-action comment-btn" onclick="toggleComments('${post.id}')">
                <i class="fas fa-comment"></i>
                <span>${post.comments.length}</span>
            </button>
        </div>
        <div class="comments-section" id="comments-${post.id}" style="display: none;">
            <div class="comments-list" id="comments-list-${post.id}"></div>
            <div class="add-comment">
                <input type="text" id="comment-input-${post.id}" placeholder="Add a comment...">
                <button onclick="addComment('${post.id}')">Post</button>
            </div>
        </div>
    `;
    
    postDiv.innerHTML = postContent;
    return postDiv;
}

// Create post
async function createPost() {
    const content = document.getElementById('post-content').value;
    const imageInput = document.getElementById('post-image');
    
    if (!content.trim() && !imageInput.files[0]) {
        alert('Please add some content or an image');
        return;
    }
    
    const formData = new FormData();
    formData.append('content', content);
    if (imageInput.files[0]) {
        formData.append('image', imageInput.files[0]);
    }
    
    try {
        const response = await fetch(`${API_BASE_URL}/posts`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${authToken}`
            },
            body: formData
        });
        
        const data = await response.json();
        
        if (response.ok) {
            document.getElementById('post-content').value = '';
            document.getElementById('post-image').value = '';
            loadPosts();
        } else {
            alert(data.message || 'Failed to create post');
        }
    } catch (error) {
        alert('Error creating post: ' + error.message);
    }
}

// Toggle like
async function toggleLike(postId) {
    try {
        const response = await fetch(`${API_BASE_URL}/posts/${postId}/like`, {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${authToken}`
            }
        });
        
        const data = await response.json();
        
        if (response.ok) {
            loadPosts();
        } else {
            alert(data.message || 'Failed to like post');
        }
    } catch (error) {
        alert('Error liking post: ' + error.message);
    }
}

// Toggle comments
function toggleComments(postId) {
    const commentsSection = document.getElementById(`comments-${postId}`);
    const commentsList = document.getElementById(`comments-list-${postId}`);
    
    if (commentsSection.style.display === 'none') {
        commentsSection.style.display = 'block';
        loadComments(postId);
    } else {
        commentsSection.style.display = 'none';
    }
}

// Load comments
async function loadComments(postId) {
    try {
        const response = await fetch(`${API_BASE_URL}/posts/${postId}`, {
            headers: {
                'Authorization': `Bearer ${authToken}`
            }
        });
        
        const post = await response.json();
        const commentsList = document.getElementById(`comments-list-${postId}`);
        commentsList.innerHTML = '';
        
        post.comments.forEach(comment => {
            const commentDiv = document.createElement('div');
            commentDiv.className = 'comment';
            commentDiv.innerHTML = `
                <div class="comment-avatar">${comment.user.username.charAt(0).toUpperCase()}</div>
                <div class="comment-content">
                    <div class="comment-author">${comment.user.username}</div>
                    <div>${comment.content}</div>
                </div>
            `;
            commentsList.appendChild(commentDiv);
        });
    } catch (error) {
        console.error('Error loading comments:', error);
    }
}

// Add comment
async function addComment(postId) {
    const commentInput = document.getElementById(`comment-input-${postId}`);
    const content = commentInput.value.trim();
    
    if (!content) return;
    
    try {
        const response = await fetch(`${API_BASE_URL}/posts/${postId}/comments`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${authToken}`
            },
            body: JSON.stringify({ content })
        });
        
        const data = await response.json();
        
        if (response.ok) {
            commentInput.value = '';
            loadComments(postId);
        } else {
            alert(data.message || 'Failed to add comment');
        }
    } catch (error) {
        alert('Error adding comment: ' + error.message);
    }
}

// Utility functions
function showError(message) {
    const errorDiv = document.createElement('div');
    errorDiv.className = 'error-message';
    errorDiv.textContent = message;
    document.body.appendChild(errorDiv);
    setTimeout(() => errorDiv.remove(), 3000);
}

function showSuccess(message) {
    const successDiv = document.createElement('div');
    successDiv.className = 'success-message';
    successDiv.textContent = message;
    document.body.appendChild(successDiv);
    setTimeout(() => successDiv.remove(), 3000);
}

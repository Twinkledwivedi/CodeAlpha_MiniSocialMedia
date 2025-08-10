// Sample posts data for demonstration
const samplePosts = [
    {
        id: 1,
        username: "Sarah_Adventures",
        avatar: "SA",
        content: "Just finished an amazing hiking trip in the mountains! The views were absolutely breathtaking. 🏔️ #NatureLover #AdventureTime",
        image: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=500&h=300&fit=crop",
        time: "2 hours ago",
        likes: 24,
        comments: [
            { username: "Mike_Traveler", content: "Looks incredible! Which trail did you take?" },
            { username: "Emma_Explorer", content: "The colors are amazing! Adding this to my bucket list 📸" },
            { username: "David_Hikes", content: "I was there last month! The sunrise is even more spectacular 🌅" }
        ]
    },
    {
        id: 2,
        username: "TechGuru_Alex",
        avatar: "TA",
        content: "Just launched my new app! It's been 6 months in the making and I'm so excited to share it with the community. Check it out and let me know what you think! 🚀",
        image: "https://images.unsplash.com/photo-1551650975-87deedd944c3?w=500&h=300&fit=crop",
        time: "5 hours ago",
        likes: 42,
        comments: [
            { username: "CodeMaster_Jane", content: "Congratulations Alex! The UI looks super clean 🔥" },
            { username: "Startup_Sam", content: "Amazing work! Would love to hear about your development process" },
            { username: "Dev_Diana", content: "Just downloaded it! The onboarding flow is really smooth 👏" }
        ]
    },
    {
        id: 3,
        username: "Foodie_Maria",
        avatar: "FM",
        content: "Tried this amazing new restaurant downtown! The pasta was absolutely divine and the atmosphere was perfect for a cozy dinner. Highly recommend! 🍝✨",
        image: "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=500&h=300&fit=crop",
        time: "1 day ago",
        likes: 67,
        comments: [
            { username: "Chef_Carlos", content: "The plating looks beautiful! What's the restaurant name?" },
            { username: "FoodLover_Lisa", content: "I've been wanting to try this place! Adding it to my list 📍" },
            { username: "WineExpert_Will", content: "Their wine selection is incredible - ask for the sommelier's recommendation! 🍷" }
        ]
    },
    {
        id: 4,
        username: "Fitness_Jake",
        avatar: "FJ",
        content: "Morning workout complete! There's nothing like starting the day with some cardio and strength training. Remember, consistency is key! 💪 #FitnessMotivation #HealthyLiving",
        image: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=500&h=300&fit=crop",
        time: "3 days ago",
        likes: 89,
        comments: [
            { username: "GymBuddy_Grace", content: "What workout routine are you following? Looking for new ideas!" },
            { username: "Wellness_Wendy", content: "Love the energy! Keep inspiring us 💯" },
            { username: "Trainer_Tom", content: "Great form! Your dedication is showing results 🎯" }
        ]
    },
    {
        id: 5,
        username: "ArtLover_Sophie",
        avatar: "AS",
        content: "Visited the new art exhibition at the contemporary museum today. The abstract pieces really spoke to me - especially the blue series that seemed to capture the essence of movement and emotion. Art has such a powerful way of connecting us all 🎨",
        image: "https://images.unsplash.com/photo-1541961017774-22349e4a1262?w=500&h=300&fit=crop",
        time: "4 days ago",
        likes: 156,
        comments: [
            { username: "Gallery_George", content: "I was there yesterday! The blue series is absolutely mesmerizing" },
            { username: "Creative_Claire", content: "Your description is so poetic! Art truly is universal language" },
            { username: "Painter_Paul", content: "The way the artist used negative space is brilliant. Thanks for sharing!" }
        ]
    }
];

// Function to render sample posts
function renderSamplePosts() {
    const postsContainer = document.getElementById('posts-list');
    if (!postsContainer) return;

    postsContainer.innerHTML = '';

    samplePosts.forEach(post => {
        const postElement = createSamplePostElement(post);
        postsContainer.appendChild(postElement);
    });
}

// Function to create sample post element
function createSamplePostElement(post) {
    const postDiv = document.createElement('div');
    postDiv.className = 'post';
    
    const commentsHtml = post.comments.map(comment => `
        <div class="comment">
            <div class="comment-avatar">${comment.username.substring(0, 2).toUpperCase()}</div>
            <div class="comment-content">
                <div class="comment-author">${comment.username}</div>
                <div>${comment.content}</div>
            </div>
        </div>
    `).join('');

    postDiv.innerHTML = `
        <div class="post-header">
            <div class="post-avatar">${post.avatar}</div>
            <div class="post-user-info">
                <h4>${post.username}</h4>
                <span class="post-time">${post.time}</span>
            </div>
        </div>
        <div class="post-content">${post.content}</div>
        ${post.image ? `<img src="${post.image}" alt="Post image" class="post-image">` : ''}
        <div class="post-actions">
            <button class="post-action">
                <i class="far fa-heart"></i>
                <span>${post.likes}</span>
            </button>
            <button class="post-action">
                <i class="far fa-comment"></i>
                <span>${post.comments.length}</span>
            </button>
            <button class="post-action">
                <i class="far fa-share"></i>
                <span>Share</span>
            </button>
        </div>
        <div class="comments-section">
            <h4>Comments</h4>
            ${commentsHtml}
            <div class="add-comment">
                <input type="text" placeholder="Add a comment..." maxlength="200">
                <button>Post</button>
            </div>
        </div>
    `;
    return postDiv;
}

// Initialize sample posts
document.addEventListener('DOMContentLoaded', function() {
    // Show sample posts by default
    setTimeout(() => {
        renderSamplePosts();
    }, 100);
});

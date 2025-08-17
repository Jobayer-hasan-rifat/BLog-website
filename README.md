# MiniBlog - Full Stack Blog Application

A modern, full-stack blog application built with React.js frontend and Node.js/Express backend, featuring user authentication, blog post management, and admin dashboard.

## 🚀 Features

### User Features
- **User Registration & Authentication** - Secure signup/login with JWT tokens
- **Password Reset** - Forgot password functionality with email verification
- **User Dashboard** - Manage personal blog posts and profile
- **Create & Edit Posts** - Rich text editor for creating blog content
- **User Profiles** - Public and private user profile pages
- **Blog Reading** - Browse and read blog posts from all users

### Admin Features
- **Admin Dashboard** - Complete administrative control panel

- **Leaderboard & Analytics**
  - Most liked posts tracking
  - Most active users statistics
  - Weekly picks and trending content
  - Engagement metrics and insights

### UI/UX Features
- **Modern Design System**
  - Clean pastel color scheme (blues, purples, whites)
  - Responsive design for all devices
  - Smooth animations and micro-interactions
  - Accessible components with ARIA support
  - Dark mode support (coming soon)

## 🛠 Tech Stack

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web application framework
- **MongoDB** - NoSQL database
- **Mongoose** - MongoDB object modeling
- **JWT** - JSON Web Token authentication
- **Multer** - File upload middleware
- **Nodemailer** - Email service integration
- **bcryptjs** - Password hashing

### Frontend
- **React 18** - UI library with hooks
- **React Router v6** - Client-side routing
- **Axios** - HTTP client for API calls
- **React Quill** - Rich text WYSIWYG editor
- **React Share** - Social media sharing components
- **React Icons** - Comprehensive icon library
- **React Infinite Scroll** - Infinite scrolling component

### Development Tools
- **Concurrently** - Run multiple commands
- **Nodemon** - Development server auto-restart
- **ESLint** - Code linting
- **Prettier** - Code formatting

## 📦 Installation

### Prerequisites
- Node.js (v16 or higher)
- MongoDB (v5.0 or higher)
- npm or yarn package manager

### Quick Start

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd BLog-website
   ```

2. **Install dependencies**
   ```bash
   # Install server dependencies
   cd server
   npm install
   
   # Install client dependencies
   cd ../client
   npm install
   ```

3. **Environment Configuration**
   
   Create `.env` file in the server directory:
   ```env
   # Server Configuration
   PORT=5000
   NODE_ENV=development
   
   # Database
   MONGODB_URI=mongodb://localhost:27017/miniblog
   
   # JWT Configuration
   JWT_SECRET=your_super_secure_jwt_secret_key_here
   JWT_EXPIRE=7d
   
   # Email Configuration (Gmail example)
   EMAIL_HOST=smtp.gmail.com
   EMAIL_PORT=587
   EMAIL_SECURE=false
   EMAIL_USER=your_email@gmail.com
   EMAIL_PASS=your_app_specific_password
   EMAIL_FROM=noreply@miniblog.com
   
   # Admin Configuration
   ADMIN_EMAIL=admin@miniblog.com
   ADMIN_PASSWORD=SecureAdminPassword123!
   
   # File Upload Configuration
   MAX_FILE_SIZE=5242880
   UPLOAD_PATH=./uploads
   ```

4. **Start the application**
   
   **Development Mode (Recommended):**
   ```bash
   # Start both server and client concurrently
   cd server
   npm run dev
   ```
   
   **Or start separately:**
   ```bash
   # Terminal 1 - Start server
   cd server
   npm start
   
   # Terminal 2 - Start client
   cd client
   npm start
   ```

5. **Access the application**
   - **Frontend:** http://localhost:3000
   - **Backend API:** http://localhost:5000
   - **Admin Dashboard:** http://localhost:3000/admin (after creating admin account)

## 🔗 API Documentation

### Authentication Endpoints
```
POST /api/auth/register          # Register new user
POST /api/auth/login             # User login
POST /api/auth/logout            # User logout
POST /api/auth/forgot-password   # Request password reset
POST /api/auth/reset-password/:token # Reset password with token
GET  /api/auth/verify-token      # Verify JWT token
```

### Posts Management
```
GET    /api/posts                # Get posts with filtering/sorting
GET    /api/posts/feed           # Get personalized feed
GET    /api/posts/drafts         # Get user drafts
GET    /api/posts/:id            # Get single post
POST   /api/posts               # Create new post
PUT    /api/posts/:id           # Update post
DELETE /api/posts/:id           # Delete post
POST   /api/posts/:id/like      # Toggle like
POST   /api/posts/:id/bookmark  # Toggle bookmark
POST   /api/posts/:id/reshare   # Re-share post
POST   /api/posts/:id/share     # Increment share count
POST   /api/posts/:id/publish   # Publish draft
```

### Social Features
```
POST /api/follow/:userId         # Follow/unfollow user
GET  /api/follow/followers/:userId # Get user followers
GET  /api/follow/following/:userId # Get user following
GET  /api/follow/status/:userId    # Check follow status

GET    /api/bookmarks           # Get user bookmarks
POST   /api/bookmarks           # Add bookmark
PUT    /api/bookmarks/:id       # Update bookmark note
DELETE /api/bookmarks/:id       # Remove bookmark
```

### Comments System
```
GET    /api/comments/post/:postId # Get post comments
POST   /api/comments             # Create comment
PUT    /api/comments/:id         # Update comment
DELETE /api/comments/:id         # Delete comment
POST   /api/comments/:id/like    # Toggle comment like
```

### User Management
```
GET  /api/users/profile         # Get current user profile
PUT  /api/users/profile         # Update user profile
GET  /api/users/:id             # Get public user profile
POST /api/users/upload-avatar   # Upload profile avatar
GET  /api/users/:id/posts       # Get user's posts
```

### Admin Endpoints
```
GET    /api/admin/stats         # Dashboard statistics
GET    /api/admin/users         # Get all users with filters
PUT    /api/admin/users/:id/ban # Ban/unban user
DELETE /api/admin/posts/:id     # Delete any post
DELETE /api/admin/comments/:id  # Delete any comment
PUT    /api/admin/posts/:id/feature # Toggle featured post
GET    /api/admin/leaderboard   # Get leaderboard data
```

## 📁 Project Structure

```
BLog-website/
├── client/                     # React frontend application
│   ├── public/
│   │   ├── index.html
│   │   └── favicon.ico
│   ├── src/
│   │   ├── components/         # Reusable UI components
│   │   │   ├── PostCard.js     # Enhanced post display
│   │   │   ├── PostFilters.js  # Search and filter UI
│   │   │   ├── RichTextEditor.js # WYSIWYG editor
│   │   │   ├── ShareButtons.js # Social sharing
│   │   │   ├── FollowButton.js # Follow/unfollow UI
│   │   │   ├── Sidebar.js      # Leaderboard sidebar
│   │   │   └── Navbar.js       # Navigation component
│   │   ├── pages/              # Page components
│   │   │   ├── Home.js         # Landing page
│   │   │   ├── BlogList.js     # Posts listing with filters
│   │   │   ├── BlogDetail.js   # Single post view
│   │   │   ├── CreatePost.js   # Post creation/editing
│   │   │   ├── Drafts.js       # Draft management
│   │   │   ├── Bookmarks.js    # Bookmarked posts
│   │   │   ├── AdminDashboard.js # Admin panel
│   │   │   └── UserDashboard.js # User dashboard
│   │   ├── context/            # React context providers
│   │   │   ├── AuthContext.js  # Authentication state
│   │   │   └── ToastContext.js # Notification system
│   │   ├── services/           # API service functions
│   │   └── App.js              # Main application component
│   └── package.json
├── server/                     # Node.js backend application
│   ├── config/
│   │   └── database.js         # MongoDB connection
│   ├── controllers/            # Business logic controllers
│   │   ├── authController.js   # Authentication logic
│   │   ├── postsController.js  # Posts management
│   │   ├── followController.js # Follow system
│   │   ├── bookmarkController.js # Bookmark system
│   │   └── adminController.js  # Admin operations
│   ├── middleware/             # Custom middleware
│   │   ├── auth.js            # JWT authentication
│   │   └── error.js           # Error handling
│   ├── models/                # Mongoose data models
│   │   ├── User.js            # User schema with social features
│   │   ├── Post.js            # Enhanced post schema
│   │   ├── Comment.js         # Comment schema
│   │   ├── Bookmark.js        # Bookmark schema
│   │   └── Follow.js          # Follow relationship schema
│   ├── routes/                # API route definitions
│   │   ├── auth.js            # Authentication routes
│   │   ├── posts.js           # Post management routes
│   │   ├── follow.js          # Follow system routes
│   │   ├── bookmarks.js       # Bookmark routes
│   │   └── admin.js           # Admin routes
│   ├── uploads/               # File upload directory
│   └── server.js              # Application entry point
├── .gitignore
├── LICENSE
└── README.md
```

## 🎨 Design System

### Color Palette
- **Primary Blue:** `#667eea` - Main brand color
- **Secondary Blue:** `#764ba2` - Gradient complement
- **Accent Purple:** `#9f7aea` - Highlight color
- **Text Colors:** `#2d3748`, `#4a5568`, `#718096`
- **Background:** `#f7fafc`, `#ffffff`, `#edf2f7`
- **Success:** `#48bb78`
- **Warning:** `#ed8936`
- **Error:** `#e53e3e`

### Typography
- **Font Family:** Inter, system fonts
- **Headings:** 700 weight, varied sizes
- **Body:** 400 weight, 16px base
- **Small:** 14px for metadata

## 🔧 Development

### Available Scripts

**Server:**
- `POST /api/uploads` - Upload files

## 🧪 Testing

```bash
# Run client tests
cd client
npm test

# Run server tests (if implemented)
cd server
npm test
```

## 🚀 Deployment

### Frontend Deployment (Netlify/Vercel)
1. Build the client: `cd client && npm run build`
2. Deploy the `build` folder to your hosting service
3. Configure environment variables on your hosting platform

### Backend Deployment (Heroku/Railway)
1. Set up environment variables on your hosting platform
2. Deploy the `server` directory
3. Ensure MongoDB connection is configured for production

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👥 Authors

- **MiniBlog Team** - Initial work

## 🆘 Support

If you encounter any issues or have questions:

1. Check the [Issues](https://github.com/Jobayer-hasan-rifat/BLog-website/issues) section
2. Create a new issue if your problem isn't already reported
3. Provide detailed information about your environment and the issue

## 📝 Changelog

### Version 1.0.0
- Initial release
- User authentication system
- Blog post CRUD operations
- Admin dashboard
- File upload functionality
- Password reset feature

---

**Happy Blogging! 🎉**

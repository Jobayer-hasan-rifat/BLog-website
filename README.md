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
- **User Management** - Manage all registered users
- **Content Moderation** - Approve, edit, or delete any blog posts
- **System Analytics** - Overview of platform statistics

### Technical Features
- **Responsive Design** - Mobile-friendly interface
- **File Uploads** - Image upload support for blog posts
- **RESTful API** - Clean API architecture
- **MongoDB Database** - NoSQL database for scalable data storage
- **JWT Authentication** - Secure token-based authentication
- **Email Integration** - Nodemailer for password reset emails

## 🛠️ Tech Stack

### Frontend
- **React.js** (v18.2.0) - Modern JavaScript library
- **React Router DOM** (v6.15.0) - Client-side routing
- **Axios** (v1.5.0) - HTTP client for API calls
- **SASS** (v1.66.1) - CSS preprocessor for styling

### Backend
- **Node.js** - JavaScript runtime environment
- **Express.js** (v4.18.2) - Web application framework
- **MongoDB** with **Mongoose** (v7.5.0) - Database and ODM
- **JWT** (v9.0.2) - JSON Web Tokens for authentication
- **bcryptjs** (v2.4.3) - Password hashing
- **Multer** (v2.0.2) - File upload handling
- **Nodemailer** (v6.9.12) - Email sending functionality

## 📋 Prerequisites

Before running this application, make sure you have the following installed:

- **Node.js** (v14 or higher)
- **npm** or **yarn** package manager
- **MongoDB** (local installation or MongoDB Atlas account)
- **Git** for version control

## ⚙️ Environment Setup

### 1. Clone the Repository
```bash
git clone https://github.com/Jobayer-hasan-rifat/BLog-website.git
cd BLog-website
```

### 2. Install Dependencies

#### Install Server Dependencies
```bash
cd server
npm install
```

#### Install Client Dependencies
```bash
cd ../client
npm install
```

### 3. Environment Configuration

Create a `.env` file in the `server` directory with the following variables:

```env
# Server Configuration
NODE_ENV=development
PORT=5000

# Database Configuration
MONGODB_URI=mongodb://localhost:27017/miniblog

# JWT Configuration
JWT_SECRET=your_super_secret_jwt_key_here
JWT_EXPIRE=7d

# Admin Account (will be created automatically)
ADMIN_EMAIL=admin@miniblog.com
ADMIN_PASSWORD=YourSecureAdminPassword123!

# Email Configuration (for password reset)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
```

**Important Notes:**
- Replace `your_super_secret_jwt_key_here` with a strong, random secret key
- Update `MONGODB_URI` if using MongoDB Atlas or different local setup
- Configure email settings for password reset functionality
- Use a strong admin password for security

## 🚀 Running the Application

### Development Mode

#### 1. Start the Backend Server
```bash
cd server
npm run dev
```
The server will start on `http://localhost:5000`

#### 2. Start the Frontend Client
```bash
cd client
npm start
```
The client will start on `http://localhost:3000`

### Production Mode

#### 1. Build the Client
```bash
cd client
npm run build
```

#### 2. Start the Server
```bash
cd server
npm start
```

## 📁 Project Structure

```
BLog-website/
├── client/                 # React.js Frontend
│   ├── public/            # Static files
│   ├── src/
│   │   ├── components/    # Reusable React components
│   │   ├── pages/         # Page components
│   │   ├── services/      # API service functions
│   │   ├── context/       # React Context providers
│   │   └── styles/        # SASS stylesheets
│   └── package.json
├── server/                # Node.js Backend
│   ├── config/           # Database configuration
│   ├── controllers/      # Route controllers
│   ├── middleware/       # Custom middleware
│   ├── models/          # MongoDB models
│   ├── routes/          # API routes
│   ├── utils/           # Utility functions
│   ├── public/          # Static file uploads
│   └── package.json
├── .gitignore           # Git ignore rules
└── README.md           # Project documentation
```

## 🔐 Default Admin Account

After starting the server, an admin account will be automatically created with:
- **Email:** admin@miniblog.com (or as configured in .env)
- **Password:** As configured in your .env file

## 📚 API Endpoints

### Authentication Routes
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/forgot-password` - Request password reset
- `POST /api/auth/reset-password` - Reset password

### User Routes
- `GET /api/users/profile` - Get user profile
- `PUT /api/users/profile` - Update user profile
- `GET /api/users/:id` - Get public user profile

### Posts Routes
- `GET /api/posts` - Get all posts
- `GET /api/posts/:id` - Get single post
- `POST /api/posts` - Create new post
- `PUT /api/posts/:id` - Update post
- `DELETE /api/posts/:id` - Delete post

### Upload Routes
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

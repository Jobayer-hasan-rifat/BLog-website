const express = require('express');
const path = require('path');
const dotenv = require('dotenv');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const connectDB = require('./config/database');
const errorHandler = require('./middleware/error');

// Load env vars
dotenv.config();

// Connect to database
connectDB();

const app = express();

// Cookie parser
app.use(cookieParser());

// Enable CORS
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:3000',
  credentials: true
}));

// Body parser - must be before routes so JSON bodies are parsed
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Static folders
app.use(express.static('public'));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Route files
const auth = require('./routes/auth');
const posts = require('./routes/posts');
const users = require('./routes/users');
const uploads = require('./routes/uploads');
const follow = require('./routes/follow');
const bookmarks = require('./routes/bookmarks');
const admin = require('./routes/admin');
const events = require('./routes/events');

// Mount routers
app.use('/api/auth', auth);
app.use('/api/posts', posts);
app.use('/api/users', users);
app.use('/api/uploads', uploads);
app.use('/api/follow', follow);
app.use('/api/bookmarks', bookmarks);
app.use('/api/admin', admin);
app.use('/api/events', events);

// Error handler
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, async () => {
  console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err, promise) => {
  console.log(`Error: ${err.message}`);
  // Close server & exit process
  server.close(() => {
    process.exit(1);
  });
});

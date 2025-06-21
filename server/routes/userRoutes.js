const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const auth = require('../middleware/auth.js');
const User = require('../models/User');
const Post = require('../models/Post');
const upload = require('../middleware/upload');
const Notification = require('../models/Notification');

// Register new user
router.post('/register', async (req, res) => {
  try {
    const { username, email, password } = req.body;

    // Check if user already exists
    let user = await User.findOne({ $or: [{ email }, { username }] });
    if (user) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Create new user
    user = new User({
      username,
      email,
      password
    });

    await user.save();

    // Create token
    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '7d' }
    );

    res.status(201).json({
      token,
      user: {
        _id: user._id,
        username: user.username,
        email: user.email
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Login user
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Check password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Create token
    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '7d' }
    );

    res.json({
      token,
      user: {
        _id: user._id,
        username: user.username,
        email: user.email
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Get user profile
router.get('/profile', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
      .select('-password')
      .populate('posts', 'media caption createdAt');
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Update user profile
router.put('/profile', auth, async (req, res) => {
  try {
    const { bio, profilePicture } = req.body;
    const user = await User.findById(req.user._id);

    if (bio) user.bio = bio;
    if (profilePicture) user.profilePicture = profilePicture;

    await user.save();
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Update profile picture
router.put('/profile-picture', auth, upload.single('profilePicture'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'Please upload an image' });
    }

    const user = await User.findById(req.user._id);
    user.profilePicture = `/uploads/${req.file.filename}`;
    await user.save();

    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Follow a user
router.post('/follow/:id', auth, async (req, res) => {
  try {
    if (req.params.id === req.user._id.toString()) {
      return res.status(400).json({ message: 'You cannot follow yourself' });
    }

    const userToFollow = await User.findById(req.params.id);
    const currentUser = await User.findById(req.user._id);

    if (!userToFollow) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Check if already following
    if (currentUser.following.includes(userToFollow._id)) {
      return res.status(400).json({ message: 'You are already following this user' });
    }

    // Add to following and followers lists
    currentUser.following.push(userToFollow._id);
    userToFollow.followers.push(currentUser._id);

    await currentUser.save();
    await userToFollow.save();

    // Create notification
    const notification = new Notification({
      recipient: userToFollow._id,
      sender: req.user._id,
      type: 'follow'
    });
    await notification.save();

    res.json({ message: 'Successfully followed user' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Unfollow a user
router.post('/unfollow/:id', auth, async (req, res) => {
  try {
    if (req.params.id === req.user._id.toString()) {
      return res.status(400).json({ message: 'You cannot unfollow yourself' });
    }

    const userToUnfollow = await User.findById(req.params.id);
    const currentUser = await User.findById(req.user._id);

    if (!userToUnfollow) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Check if not following
    if (!currentUser.following.includes(userToUnfollow._id)) {
      return res.status(400).json({ message: 'You are not following this user' });
    }

    // Remove from following and followers lists
    currentUser.following = currentUser.following.filter(
      id => id.toString() !== userToUnfollow._id.toString()
    );
    userToUnfollow.followers = userToUnfollow.followers.filter(
      id => id.toString() !== currentUser._id.toString()
    );

    await currentUser.save();
    await userToUnfollow.save();

    res.json({ message: 'Successfully unfollowed user' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Get user's followers
router.get('/:id/followers', auth, async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
      .populate('followers', 'username profilePicture bio');
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json(user.followers);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Get user's following
router.get('/:id/following', auth, async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
      .populate('following', 'username profilePicture bio');
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json(user.following);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Get suggested users (users not being followed)
router.get('/suggested', auth, async (req, res) => {
  try {
    const currentUser = await User.findById(req.user._id);
    
    // Find users that the current user is not following
    const suggestedUsers = await User.find({
      _id: { 
        $nin: [...currentUser.following, req.user._id] 
      }
    })
    .select('username profilePicture bio')
    .limit(5);

    res.json(suggestedUsers);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Enhanced search functionality
router.get('/search', auth, async (req, res) => {
  try {
    const { q: query, type = 'all' } = req.query;
    
    if (!query) {
      return res.status(400).json({ message: 'Search query is required' });
    }

    let results = {
      users: [],
      posts: [],
      hashtags: []
    };

    // Search users - using regex to match letters in order
    if (type === 'all' || type === 'users') {
      // Convert query to regex that matches letters in order
      // For example, 'usr' becomes 'u.*s.*r.*'
      const regexPattern = query.split('').join('.*');
      
      results.users = await User.find({
        $or: [
          { username: { $regex: regexPattern, $options: 'i' } },
          { bio: { $regex: query, $options: 'i' } }
        ],
        _id: { $ne: req.user._id } // Exclude current user
      })
      .select('username profilePicture bio followers')
      .limit(10);

      console.log('User search regex pattern:', regexPattern);
      console.log('Found users:', results.users.length);
    }

    // Search posts by caption or location
    if (type === 'all' || type === 'posts') {
      results.posts = await Post.find({
        $or: [
          { caption: { $regex: query, $options: 'i' } },
          { location: { $regex: query, $options: 'i' } }
        ]
      })
      .populate('user', 'username profilePicture')
      .sort('-createdAt')
      .limit(10);
    }

    // Search hashtags
    if (type === 'all' || type === 'hashtags') {
      // Remove # if present in query
      const tagQuery = query.startsWith('#') ? query.slice(1) : query;
      
      results.hashtags = await Post.find({
        tags: { $regex: tagQuery, $options: 'i' }
      })
      .populate('user', 'username profilePicture')
      .sort('-createdAt')
      .limit(10);

      // Add aggregated stats for hashtags
      const tagStats = await Post.aggregate([
        { $match: { 
          tags: { $regex: tagQuery, $options: 'i' }
        }},
        { $unwind: '$tags' },
        { $match: { 
          tags: { $regex: tagQuery, $options: 'i' }
        }},
        { $group: {
          _id: '$tags',
          count: { $sum: 1 }
        }},
        { $sort: { count: -1 } },
        { $limit: 5 }
      ]);
      
      results.tagStats = tagStats;
    }

    res.json(results);
  } catch (error) {
    console.error('Search error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get user by ID
router.get('/:id', auth, async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
      .select('-password')
      .populate('posts', 'media caption createdAt');
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json(user);
  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get user's posts
router.get('/:id/posts', auth, async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
      .populate({
        path: 'posts',
        select: 'media caption createdAt likes comments mediaType',
        options: { sort: { createdAt: -1 } }
      });
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json(user.posts || []);
  } catch (error) {
    console.error('Error fetching user posts:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
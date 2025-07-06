const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth.js');
const Post = require('../models/Post');
const User = require('../models/User');
const { multer, gcsUpload } = require('../middleware/gcsUpload');
const extractHashtags = require('../utils/hashtagExtractor');
const Notification = require('../models/Notification');

// Create a new post with media upload
router.post('/', auth, multer.single('media'), gcsUpload, async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'Please upload a file' });
    }
    if (req.file.gcsError) {
      return res.status(500).json({ message: 'Error uploading file to cloud storage.' });
    }

    const { caption, location } = req.body;
    
    // Extract hashtags from caption
    const extractedTags = extractHashtags(caption);
    
    // Determine media type from mimetype
    const mediaType = req.file.mimetype.startsWith('image/') ? 'image' : 'video';
    
    const post = new Post({
      user: req.user._id,
      caption,
      media: req.file.gcsUrl,
      mediaType,
      location,
      tags: extractedTags
    });

    await post.save();

    // Add post to user's posts array
    await User.findByIdAndUpdate(
      req.user._id,
      { $push: { posts: post._id } }
    );

    // Populate user info before sending response
    const populatedPost = await Post.findById(post._id)
      .populate('user', 'username profilePicture');

    res.status(201).json(populatedPost);
  } catch (error) {
    console.error('Error creating post:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get feed posts (from followed users and self)
router.get('/feed', auth, async (req, res) => {
  try {
    console.log('Fetching feed for user:', req.user._id);
    const currentUser = await User.findById(req.user._id);
    console.log('Current user following:', currentUser.following);
    
    // Get posts from followed users and self
    const posts = await Post.aggregate([
      // Match posts from followed users and self
      {
        $match: {
          user: { $in: [...currentUser.following, req.user._id] }
        }
      },
      // Sort by creation date
      { $sort: { createdAt: -1 } },
      // Limit to 50 posts
      { $limit: 50 },
      // Group by post ID to ensure uniqueness
      {
        $group: {
          _id: '$_id',
          user: { $first: '$user' },
          caption: { $first: '$caption' },
          media: { $first: '$media' },
          mediaType: { $first: '$mediaType' },
          likes: { $first: '$likes' },
          comments: { $first: '$comments' },
          createdAt: { $first: '$createdAt' },
          location: { $first: '$location' },
          tags: { $first: '$tags' }
        }
      },
      // Sort again after grouping
      { $sort: { createdAt: -1 } }
    ]);

    // Populate user information
    await Post.populate(posts, {
      path: 'user',
      select: 'username profilePicture'
    });

    // Populate comments user information
    await Post.populate(posts, {
      path: 'comments.user',
      select: 'username profilePicture'
    });
    
    console.log('Found unique posts:', posts.length);
    res.json(posts);
  } catch (error) {
    console.error('Error in feed:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get a single post
router.get('/:id', auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id)
      .populate('user', 'username profilePicture')
      .populate('comments.user', 'username profilePicture');
    
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }
    
    res.json(post);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Like/Unlike a post
router.put('/:id/like', auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    // Check if post is already liked
    const isLiked = post.likes.includes(req.user._id);
    
    if (isLiked) {
      // Unlike
      post.likes = post.likes.filter(
        like => like.toString() !== req.user._id.toString()
      );
    } else {
      // Like
      post.likes.push(req.user._id);

      // Create notification
      const notification = new Notification({
        recipient: post.user,
        sender: req.user._id,
        type: 'like',
        post: post._id
      });
      await notification.save();
    }

    await post.save();
    res.json(post);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Add a comment
router.post('/:id/comment', auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    const newComment = {
      user: req.user._id,
      text: req.body.text
    };

    post.comments.push(newComment);
    await post.save();

    // Populate the new comment's user info
    const populatedPost = await Post.findById(post._id)
      .populate('comments.user', 'username profilePicture');

    // Create notification
    const notification = new Notification({
      recipient: post.user,
      sender: req.user._id,
      type: 'comment',
      post: post._id,
      comment: req.body.text
    });
    await notification.save();

    res.json(populatedPost);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete a post
router.delete('/:id', auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    // Check if user owns the post
    if (post.user.toString() !== req.user._id.toString()) {
      return res.status(401).json({ message: 'User not authorized' });
    }

    // Remove post from user's posts array
    await User.findByIdAndUpdate(
      req.user._id,
      { $pull: { posts: post._id } }
    );

    await post.remove();
    res.json({ message: 'Post removed' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Search posts
router.get('/search', auth, async (req, res) => {
  try {
    const { query, type } = req.query;
    if (!query) {
      return res.status(400).json({ message: 'Search query is required' });
    }

    let searchQuery = {};

    if (type === 'hashtag') {
      // Search by hashtag
      searchQuery = {
        tags: { $regex: `^${query.replace('#', '')}`, $options: 'i' }
      };
    } else {
      // Search by caption
      searchQuery = {
        caption: { $regex: query, $options: 'i' }
      };
    }

    const posts = await Post.find(searchQuery)
      .populate('user', 'username profilePicture')
      .populate('comments.user', 'username profilePicture')
      .sort('-createdAt')
      .limit(20);

    res.json(posts);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Get posts by hashtag
router.get('/hashtag/:tag', auth, async (req, res) => {
  try {
    const { tag } = req.params;
    
    const posts = await Post.find({
      tags: { $regex: `^${tag}`, $options: 'i' }
    })
    .populate('user', 'username profilePicture')
    .populate('comments.user', 'username profilePicture')
    .sort('-createdAt')
    .limit(20);

    res.json(posts);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Get trending hashtags
router.get('/trending/hashtags', auth, async (req, res) => {
  try {
    const posts = await Post.aggregate([
      // Unwind the tags array
      { $unwind: '$tags' },
      // Group by tags and count occurrences
      {
        $group: {
          _id: '$tags',
          count: { $sum: 1 }
        }
      },
      // Sort by count in descending order
      { $sort: { count: -1 } },
      // Limit to top 10 hashtags
      { $limit: 10 },
      // Project the final format
      {
        $project: {
          _id: 0,
          tag: '$_id',
          count: 1
        }
      }
    ]);

    res.json(posts);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Get explore posts (all posts from all users)
router.get('/explore', async (req, res) => {
  try {
    const posts = await Post.find({})
      .populate('user', 'username profilePicture')
      .sort('-createdAt')
      .limit(100); // Adjust as needed
    res.json(posts);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Share a post
router.post('/:id/share', auth, async (req, res) => {
  try {
    const originalPost = await Post.findById(req.params.id)
      .populate('user', 'username profilePicture');
    
    if (!originalPost) {
      return res.status(404).json({ message: 'Post not found' });
    }

    const { caption } = req.body;

    // Create new post as a share
    const sharedPost = new Post({
      user: req.user._id,
      caption: caption || '',
      media: originalPost.media,
      mediaType: originalPost.mediaType,
      isShared: true,
      originalPost: originalPost._id,
      originalUser: originalPost.user._id,
      tags: extractHashtags(caption) // Extract hashtags from new caption if any
    });

    await sharedPost.save();

    // Add to user's posts
    await User.findByIdAndUpdate(
      req.user._id,
      { $push: { posts: sharedPost._id } }
    );

    // Create notification for original post owner
    const notification = new Notification({
      recipient: originalPost.user._id,
      sender: req.user._id,
      type: 'share',
      post: originalPost._id
    });
    await notification.save();

    // Populate the shared post
    const populatedPost = await Post.findById(sharedPost._id)
      .populate('user', 'username profilePicture')
      .populate('originalPost')
      .populate('originalUser', 'username profilePicture');

    res.status(201).json(populatedPost);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Get shares of a post
router.get('/:id/shares', auth, async (req, res) => {
  try {
    const shares = await Post.find({
      originalPost: req.params.id,
      isShared: true
    })
    .populate('user', 'username profilePicture')
    .sort('-createdAt');

    res.json(shares);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

const path = require('path');
const fs = require('fs');
const Post = require('../models/Post');

exports.createPost = async (req, res) => {
  try {
    const { content, mediaType } = req.body;
    const mediaPath = req.file ? req.file.filename : null; 

    const newPost = new Post({
      author: req.user._id,
      content,
      media: mediaPath,
      mediaType,
    });

    await newPost.save();

    res.status(201).json({
      message: 'Post created successfully',
      post: newPost,
    });
  } catch (error) {
    res.status(500).json({ message: 'Error creating post', error });
  }
};
exports.getAllPosts = async (req, res) => {
  try {
    const posts = await Post.find()
      .populate('author', 'username')
      .populate('likes.userId', 'username')
      .populate('comments.userId', 'username');

    res.status(200).json(posts);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching posts', error });
  }
};

// Get a single post by ID with likes and comments
exports.getPostById = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id)
      .populate('author', 'username')
      .populate('likes.userId', 'username')
      .populate('comments.userId', 'username');

    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    res.status(200).json(post);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching post', error });
  }
};

exports.updatePost = async (req, res) => {
  try {
    const { content, media, mediaType } = req.body;

    const updatedPost = await Post.findByIdAndUpdate(
      req.params.id,
      { content, media, mediaType },
      { new: true }
    ).populate('author', 'username');

    if (!updatedPost) {
      return res.status(404).json({ message: 'Post not found' });
    }

    res.status(200).json({
      message: 'Post updated successfully',
      post: updatedPost
    });
  } catch (error) {
    res.status(500).json({ message: 'Error updating post', error });
  }
};

exports.deletePost = async (req, res) => {
  try {
    const post = await Post.findByIdAndDelete(req.params.id);

    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    res.status(200).json({ message: 'Post deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting post', error });
  }
};

exports.likePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    // Check if user already liked the post
    const isLiked = post.likes.some(like => like.userId.toString() === req.user._id.toString());

    if (isLiked) {
    
      post.likes = post.likes.filter(like => like.userId.toString() !== req.user._id.toString());
      await post.save();
      return res.status(200).json({ message: 'Post unliked', post });
    }

    post.likes.push({ userId: req.user._id });
    await post.save();

    res.status(200).json({ message: 'Post liked', post });
  } catch (error) {
    res.status(500).json({ message: 'Error liking post', error });
  }
};

exports.commentOnPost = async (req, res) => {
  try {
    const { content } = req.body;

    if (!content) {
      return res.status(400).json({ message: 'Comment content is required' });
    }

    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    post.comments.push({
      userId: req.user._id,
      content,
      createdAt: Date.now(),
    });

    await post.save();

    res.status(200).json({ message: 'Comment added', post });
  } catch (error) {
    res.status(500).json({ message: 'Error adding comment', error });
  }
};
exports.getMediaFile = (req, res) => {
  try {
    const filePath = path.join(__dirname, '../uploads/', req.params.filename); // Path to the uploaded files

    if (fs.existsSync(filePath)) {
      res.sendFile(filePath);
    } else {
      res.status(404).json({ message: 'File not found' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Error fetching file', error });
  }
};
exports.getMyPostsByUser = async (req, res) => {
  try {
    const userId = req.params.userId;
    const posts = await Post.find({ author: userId })
      .populate('author', 'username')
      .populate('likes.userId', 'username')
      .populate('comments.userId', 'username');

    if (posts.length === 0) {
      return res.status(404).json({ message: 'No posts found for this user' });
    }

    res.status(200).json(posts);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching user posts', error });
  }
};


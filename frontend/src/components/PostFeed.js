import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FaComment, FaRetweet, FaHeart } from 'react-icons/fa';
import logo from '../Assets/unicef_logo.png';

const PostFeed = () => {
  const [posts, setPosts] = useState([]);
  const [newPost, setNewPost] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const [mediaType, setMediaType] = useState('text');
  const [selectedPost, setSelectedPost] = useState(null);
  const [newComment, setNewComment] = useState('');
  const [likes, setLikes] = useState({});
  
  const token = localStorage.getItem('token');

  // Fetch posts when the component mounts and periodically refresh
  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/posts', {
          headers: { Authorization: `Bearer ${token}` },
        });
        setPosts(response.data);
      } catch (error) {
        console.error('Error fetching posts:', error);
      }
    };

    fetchPosts();

    // Auto-refresh every 10 seconds
    const interval = setInterval(fetchPosts, 1000);

    // Cleanup on component unmount
    return () => clearInterval(interval);
  }, [token]);

  // Handle new post submission
  const handlePost = async () => {
    if (newPost.trim() === '' && !selectedFile) {
      alert('Please enter text or upload a file.');
      return;
    }

    const formData = new FormData();
    formData.append('content', newPost);
    formData.append('mediaType', mediaType);

    if (selectedFile) {
      formData.append('file', selectedFile);
    }

    try {
      const response = await axios.post('http://localhost:5000/api/posts', formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data',
        },
      });

      setPosts([response.data.post, ...posts]); // Add new post to the list
      setNewPost('');
      setSelectedFile(null);
      setMediaType('text');
    } catch (error) {
      console.error('Error creating post:', error);
    }
  };

  // Handle like functionality
  const handleLike = async (postId) => {
    try {
      const response = await axios.post(`http://localhost:5000/api/posts/${postId}/like`, {}, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setLikes({ ...likes, [postId]: response.data.likes });
    } catch (error) {
      console.error('Error liking post:', error);
    }
  };

  // Handle comment submission
  const handleComment = async () => {
    if (newComment.trim() === '') return;

    try {
      await axios.post(
        `http://localhost:5000/api/posts/${selectedPost._id}/comment`,
        { content: newComment },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setNewComment('');
      setSelectedPost(null); // Close the modal after comment
    } catch (error) {
      console.error('Error adding comment:', error);
    }
  };

  return (
    <div className="min-h-screen bg-white mt-5" style={{ fontFamily: 'roboto' }}>
      {/* Header */}
      <div className="flex justify-center text-center mb-3">
        <img src={logo} alt="UNICEF Logo" className="h-10" />
        <h1 className="text-4xl font-bold text-gray-800">
          Child Rights <span className="text-blue-400">ADVOCACY</span>
        </h1>
      </div>

      {/* What's Happening Section */}
      <div className="max-w-3xl mx-auto mt-8 bg-gray-300 p-4 rounded-lg shadow-md">
        <textarea
          className="w-full border-none focus:outline-none p-2 rounded-lg bg-gray-300"
          placeholder="What's happening?"
          value={newPost}
          onChange={(e) => setNewPost(e.target.value)}
        ></textarea>

        <div className="flex justify-between items-center mt-3">
          <input
            type="file"
            accept="image/*,video/*"
            onChange={(e) => {
              setSelectedFile(e.target.files[0]);
              setMediaType(e.target.files[0]?.type.startsWith('image') ? 'image' : 'video');
            }}
          />
          <button onClick={handlePost} className="bg-black text-white px-4 py-2 rounded-full">
            Post
          </button>
        </div>
      </div>

      {/* Post Feed */}
      <div className="mt-6 max-w-3xl mx-auto">
        {posts.map((post) => (
          <div key={post._id} className="p-4 mb-4 bg-gray-100 rounded-lg shadow-md">
            <div className="flex items-center">
              <h3 className="font-bold">{post.author?.username || 'Anonymous'}</h3>
              <span className="ml-2 text-sm">{new Date(post.createdAt).toLocaleString()}</span>
            </div>

            <p className="mt-2">{post.content}</p>

            {/* Display media if available */}
            {post.mediaType === 'image' && (
              <img
                src={`http://localhost:5000/api/media/${post.media}`}
                alt="Post media"
                className="mt-4 rounded-lg"
              />
            )}
            {post.mediaType === 'video' && (
              <video controls src={`http://localhost:5000/api/media/${post.media}`} className="mt-4 rounded-lg" />
            )}

            <div className="flex space-x-4 mt-3 text-gray-800">
              <button onClick={() => setSelectedPost(post)} className="hover:text-black">
                <FaComment />
                <span className="ml-2">{post.comments?.length || 0}</span>
              </button>
              <button className="hover:text-black">
                <FaRetweet />
              </button>
              <button onClick={() => handleLike(post._id)} className="hover:text-black">
                <FaHeart />
                <span className="ml-2">{likes[post._id] || post.likes?.length || 0}</span>
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Comment Modal */}
      {selectedPost && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg max-w-lg w-full">
            <h2 className="text-2xl font-bold mb-4">Comments for {selectedPost.author?.username}'s Post</h2>

            {selectedPost.comments?.map((comment, index) => (
              <div key={index} className="border-b pb-2 mb-2">
                <p className="font-bold">{comment.userId.username}</p>
                <p className="text-gray-600">{comment.content}</p>
              </div>
            ))}

            <textarea
              className="w-full p-2 border rounded mb-4"
              placeholder="Add a comment..."
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
            ></textarea>

            <button onClick={handleComment} className="bg-blue-500 text-white px-4 py-2 rounded-lg">
              Submit Comment
            </button>
            <button
              onClick={() => setSelectedPost(null)}
              className="ml-4 bg-gray-300 text-black px-4 py-2 rounded-lg"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default PostFeed;

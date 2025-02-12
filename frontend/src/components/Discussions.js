import React, { useState, useEffect } from 'react';
import axios from 'axios';
import logo from '../Assets/unicef_logo.png';

const Discussions = () => {
  const [discussions, setDiscussions] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [type, setType] = useState('Theme');
  const [hashtag, setHashtag] = useState('');
  const [link, setLink] = useState('');

  const fetchDiscussions = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:5000/api/discussions', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setDiscussions(response.data);
    } catch (error) {
      console.error('Error fetching discussions:', error);
    }
  };

  useEffect(() => {
    fetchDiscussions();
  }, []);

  const handleOpenModal = () => {
    setTitle('');
    setDescription('');
    setType('Theme');
    setHashtag('');
    setLink('');
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
  };

  const createDiscussion = async () => {
    try {
      const token = localStorage.getItem('token');
      const discussionData = { title, description, type, hashtag, link };

      await axios.post('http://localhost:5000/api/discussions', discussionData, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      fetchDiscussions();
      handleCloseModal();
    } catch (error) {
      console.error('Error creating discussion:', error);
    }
  };

  const attendForum = async (id) => {
    if (!id) {
      console.error('Invalid discussion ID:', id);
      alert('Invalid discussion ID.');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      await axios.post(`http://localhost:5000/api/discussions/${id}/attend`, {}, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      alert('You are now attending this forum!');
    } catch (error) {
      console.error('Error attending forum:', error);
    }
  };

  return (
    <div className="min-h-screen bg-white" style={{ fontFamily: 'roboto' }}>
      {/* Header Section */}
      <div className="flex justify-center text-center m-3">
        <img src={logo} alt="UNICEF Logo" className="h-10" />
        <h1 className="text-4xl font-bold text-gray-800">
          Child Rights <span className="text-blue-400">ADVOCACY</span>
        </h1>
      </div>

      {/* Discussions & Forums Section */}
      <div className="px-10 py-6">
        <h2 className="text-xl font-bold text-gray-800 text-center mb-10">
          DISCUSSIONS & FORUMS
        </h2>

        {/* Discussion Themes */}
        <div className="mb-10">
          <h3 className="text-2xl font-bold text-gray-800 mb-4">Discussion Themes</h3>
          <div className="space-y-4">
            {discussions
              .filter((discussion) => discussion.type === 'Theme')
              .map((discussion) => (
                <div
                  key={discussion._id}
                  className="bg-gray-500 rounded-md p-4 flex justify-between items-center text-white text-lg"
                >
                  <div className="flex flex-col">
                    <span>{discussion.title}</span>
                    <span className="text-sm">{discussion.hashtag && `#${discussion.hashtag}`}</span>
                    <span>Theme by {discussion.userId.username}</span>
                  </div>
                  <span className="ml-2 text-sm">{new Date(discussion.createdAt).toLocaleString()}</span>
                </div>
              ))}
          </div>
          {/* Add New Theme Button */}
          <div className="flex justify-center mt-4">
            <button
              onClick={handleOpenModal}
              className="bg-gray-400 text-white rounded-full w-10 h-10 flex items-center justify-center"
            >
              +
            </button>
          </div>
        </div>

        {/* Discussion Forums */}
        <div>
          <h3 className="text-2xl font-bold text-gray-800 mb-4">Discussion Forums</h3>
          <div className="space-y-4">
            {discussions
              .filter((discussion) => discussion.type === 'Forum')
              .map((discussion) => (
                <div
                  key={discussion._id}
                  className="bg-white rounded-md p-4 shadow-lg flex justify-between items-center"
                >
                  <div className="flex flex-col">
                    <span>{discussion.title}</span>
                    <span className="text-sm">{discussion.hashtag && `#${discussion.hashtag}`}</span>
                    <span>Forum by {discussion.userId.username}</span>
                  </div>
                  <span className="ml-2 text-sm">{new Date(discussion.createdAt).toLocaleString()}</span>
                  <a
  href={discussion.link}
  target="_blank"
  rel="noopener noreferrer"
  className="flex items-center justify-between bg-gray-800 text-white py-3 px-8 rounded-md shadow-lg transition duration-300 ease-in-out hover:bg-gray-700 transform hover:scale-105"
>
  <span className="flex items-center">
    <span className="mr-2 text-xl">➔</span>
    Click here to Attend
  </span>
  <span className="text-sm text-gray-300 underline">{discussion.link}</span>
</a>

                </div>
              ))}
          </div>
          {/* Add New Forum Button */}
          <div className="flex justify-center mt-4">
            <button
              onClick={handleOpenModal}
              className="bg-gray-400 text-white rounded-full w-10 h-10 flex items-center justify-center"
            >
              +
            </button>
          </div>
        </div>
      </div>

      {/* Modal for Create */}
      {showModal && (
        <div className="fixed inset-0 bg-gray-800 bg-opacity-75 flex items-center justify-center">
          <div className="bg-white p-8 rounded-lg shadow-lg max-w-lg w-full">
            <h2 className="text-xl font-bold mb-4">Create New Discussion</h2>

            <div className="mb-4">
              <label className="block text-gray-700">Title</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded"
              />
            </div>

            <div className="mb-4">
              <label className="block text-gray-700">Description</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded"
              ></textarea>
            </div>

            <div className="mb-4">
              <label className="block text-gray-700">Type</label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded"
              >
                <option value="Theme">Theme</option>
                <option value="Forum">Forum</option>
              </select>
            </div>

            {type === 'Theme' ? (
              <div className="mb-4">
                <label className="block text-gray-700">Hashtag</label>
                <input
                  type="text"
                  value={hashtag}
                  onChange={(e) => setHashtag(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded"
                />
              </div>
            ) : (
              <div className="mb-4">
                <label className="block text-gray-700">Link</label>
                <input
                  type="text"
                  value={link}
                  onChange={(e) => setLink(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded"
                />
              </div>
            )}

            <div className="flex justify-end">
              <button
                onClick={handleCloseModal}
                className="bg-gray-300 text-gray-700 py-2 px-4 rounded mr-2"
              >
                Cancel
              </button>
              <button
                onClick={createDiscussion}
                className="bg-blue-500 text-white py-2 px-4 rounded"
              >
                Create
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Discussions;

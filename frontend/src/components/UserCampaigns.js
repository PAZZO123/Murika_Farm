import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { ChevronDown, MessageCircle, Eye } from 'lucide-react';
import PropTypes from 'prop-types';

const Modal = ({ isOpen, onClose, children }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="fixed inset-0 bg-black bg-opacity-50" onClick={onClose} />
      <div className="relative z-50 bg-white rounded-lg shadow-xl w-full max-w-md mx-4">
        {children}
      </div>
    </div>
  );
};

Modal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  children: PropTypes.node.isRequired,
};

const UserCampaigns = () => {
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showVisitModal, setShowVisitModal] = useState(false);
  const [showConversationModal, setShowConversationModal] = useState(false);
  const [selectedCampaignId, setSelectedCampaignId] = useState(null);
  const [conversationMessage, setConversationMessage] = useState('');
  const [userId, setUserId] = useState(null);

  const getAuthToken = () => localStorage.getItem('token');

  const getHeaders = () => {
    const token = getAuthToken();
    return token ? { Authorization: `Bearer ${token}` } : {};
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        await fetchCampaigns();
        await fetchUser();
      } catch (err) {
        logError('Error fetching data:', err);
        setError('Failed to load data. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const fetchCampaigns = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/campaigns', {
        headers: getHeaders(),
      });
      setCampaigns(response.data);
    } catch (err) {
      logError('Error fetching campaigns:', err);
      setError('Failed to fetch campaigns. Please check your connection or try again later.');
    }
  };

  const fetchUser = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/auth/users', {
        headers: getHeaders(),
      });
      const currentUser = JSON.parse(localStorage.getItem('currentUser'));
      if (currentUser && currentUser._id) {
        setUserId(currentUser._id);
      } else if (response.data._id) {
        setUserId(response.data._id);
      }
    } catch (err) {
      logError('Error fetching user:', err);
      setError('Failed to fetch user data. Please check your connection or try again later.');
    }
  };

  const handleAddVisit = async (campaignId) => {
    try {
      const currentUserId = userId || JSON.parse(localStorage.getItem('currentUser'))?._id;
      if (!currentUserId) {
        throw new Error('User ID is not available. Please log in again.');
      }
  
      console.log('Data being sent to server:', { userId: currentUserId }); // Log the data
  
      const response = await axios.post(
        `http://localhost:5000/api/campaigns/${campaignId}/visits`,
        { userId: currentUserId }, // Ensure this matches the server's expected structure
        { headers: getHeaders() }
      );
      console.log('Visit added successfully:', response.data);
      await fetchCampaigns();
      setShowVisitModal(false);
    } catch (err) {
      logError('Error adding visit:', err);
      setError('Failed to add visit. Please check your connection or try again later.');
    }
  };

  const handleAddConversation = async (campaignId) => {
    try {
      if (!conversationMessage.trim()) {
        throw new Error('Message cannot be empty.');
      }

      const response = await axios.post(
        `http://localhost:5000/api/campaigns/${campaignId}/conversations`,
        { userId, message: conversationMessage },
        { headers: getHeaders() }
      );
      console.log('Conversation added successfully:', response.data);
      setConversationMessage('');
      await fetchCampaigns();
      setShowConversationModal(false);
    } catch (err) {
      logError('Error adding conversation:', err);
      setError('Failed to add conversation. Please check your connection or try again later.');
    }
  };

  const logError = (message, error) => {
    console.error(message, error);
    if (error.response) {
      // The request was made and the server responded with a status code
      console.error('Response data:', error.response.data);
      console.error('Response status:', error.response.status);
      console.error('Response headers:', error.response.headers);
    } else if (error.request) {
      // The request was made but no response was received
      console.error('Request:', error.request);
    } else {
      // Something happened in setting up the request
      console.error('Error message:', error.message);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-400" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <h1 className="text-2xl font-bold mb-6">Campaigns</h1>
        <div className="text-red-500">{error}</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <h1 className="text-2xl font-bold mb-6">Campaigns</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {campaigns.map((campaign) => (
          <div
            key={campaign._id}
            className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300"
          >
            <div className="p-6">
              <h3 className="text-lg font-semibold mb-2">{campaign.title}</h3>
              <p className="text-gray-600 mb-4">{campaign.description}</p>

              <div className="flex justify-between items-center mb-4">
                <div>
                  <p className="text-2xl font-bold">{campaign.visits.length}</p>
                  <p className="text-gray-500">Visits</p>
                </div>
                <div>
                  <p className="text-2xl font-bold">{campaign.conversations.length}</p>
                  <p className="text-gray-500">Conversations</p>
                </div>
              </div>

              <div className="flex gap-2">
                <button
                  className="flex items-center gap-2 px-4 py-2 bg-orange-400 text-white rounded-lg hover:bg-orange-500 transition-colors"
                  onClick={() => {
                    setSelectedCampaignId(campaign._id);
                    setShowVisitModal(true);
                  }}
                >
                  <Eye className="w-4 h-4" />
                  Add Visit
                </button>
                <button
                  className="flex items-center gap-2 px-4 py-2 bg-blue-400 text-white rounded-lg hover:bg-blue-500 transition-colors"
                  onClick={() => {
                    setSelectedCampaignId(campaign._id);
                    setShowConversationModal(true);
                  }}
                >
                  <MessageCircle className="w-4 h-4" />
                  Add Conversation
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      <Modal isOpen={showVisitModal} onClose={() => setShowVisitModal(false)}>
        <div className="p-6">
          <h2 className="text-xl font-semibold mb-4">Add Visit</h2>
          <p className="text-gray-600 mb-6">Are you sure you want to add a visit to this campaign?</p>
          <div className="flex justify-end gap-2">
            <button
              className="px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300"
              onClick={() => setShowVisitModal(false)}
            >
              Cancel
            </button>
            <button
              className="px-4 py-2 bg-orange-400 text-white rounded-lg hover:bg-orange-500"
              onClick={() => handleAddVisit(selectedCampaignId)}
            >
              Confirm
            </button>
          </div>
        </div>
      </Modal>

      <Modal isOpen={showConversationModal} onClose={() => setShowConversationModal(false)}>
        <div className="p-6">
          <h2 className="text-xl font-semibold mb-4">Add Conversation</h2>
          <textarea
            placeholder="Enter your message"
            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:border-blue-400 mb-4"
            value={conversationMessage}
            onChange={(e) => setConversationMessage(e.target.value)}
          />
          <div className="flex justify-end gap-2">
            <button
              className="px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300"
              onClick={() => setShowConversationModal(false)}
            >
              Cancel
            </button>
            <button
              className="px-4 py-2 bg-blue-400 text-white rounded-lg hover:bg-blue-500"
              onClick={() => handleAddConversation(selectedCampaignId)}
            >
              Send
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default UserCampaigns;
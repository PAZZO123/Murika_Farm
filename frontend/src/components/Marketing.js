import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { ChevronDown, Filter, X } from 'lucide-react';

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

const Marketing = () => {
  const [showModal, setShowModal] = useState(false);
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    dateRange: 'all',
    schedule: 'all',
    status: 'all'
  });

  const [formData, setFormData] = useState({
    title: '',
    startDate: '',
    endDate: '',
    description: '',
    schedule: {
      daily: false,
      weekly: false,
      monthly: false,
      quarterly: false
    }
  });

  useEffect(() => {
    fetchCampaigns();
  }, [filters]);

  const fetchCampaigns = async () => {
    try {
      setLoading(true);
      const queryParams = new URLSearchParams();
      if (filters.dateRange !== 'all') queryParams.append('dateRange', filters.dateRange);
      if (filters.schedule !== 'all') queryParams.append('schedule', filters.schedule);
      if (filters.status !== 'all') queryParams.append('status', filters.status);

      const response = await axios.get(`http://localhost:5000/api/campaigns?${queryParams}`);
      setCampaigns(response.data);
    } catch (error) {
      console.error('Error fetching campaigns:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleScheduleChange = (schedule) => {
    setFormData(prev => ({
      ...prev,
      schedule: {
        ...prev.schedule,
        [schedule]: !prev.schedule[schedule]
      }
    }));
  };

  const handleFilterChange = (filterType, value) => {
    setFilters(prev => ({
      ...prev,
      [filterType]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('http://localhost:5000/api/campaigns', formData);
      setCampaigns(prev => [...prev, response.data]);
      setShowModal(false);
      setFormData({
        title: '',
        startDate: '',
        endDate: '',
        description: '',
        schedule: {
          daily: false,
          weekly: false,
          monthly: false,
          quarterly: false
        }
      });
    } catch (error) {
      console.error('Error creating campaign:', error);
    }
  };

  const updateCampaignStats = async (campaignId, newStats) => {
    try {
      await axios.put(`http://localhost:5000/api/campaigns/${campaignId}/stats`, newStats);
      await fetchCampaigns();
    } catch (error) {
      console.error('Error updating campaign stats:', error);
    }
  };

  const FilterModal = () => (
    <Modal isOpen={showFilterModal} onClose={() => setShowFilterModal(false)}>
      <div className="p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Filters</h2>
          <button onClick={() => setShowFilterModal(false)}>
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Date Range</label>
            <select
              className="w-full px-3 py-2 border rounded-md"
              value={filters.dateRange}
              onChange={(e) => handleFilterChange('dateRange', e.target.value)}
            >
              <option value="all">All Time</option>
              <option value="week">Last Week</option>
              <option value="month">Last Month</option>
              <option value="quarter">Last Quarter</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Schedule</label>
            <select
              className="w-full px-3 py-2 border rounded-md"
              value={filters.schedule}
              onChange={(e) => handleFilterChange('schedule', e.target.value)}
            >
              <option value="all">All</option>
              <option value="daily">Daily</option>
              <option value="weekly">Weekly</option>
              <option value="monthly">Monthly</option>
              <option value="quarterly">Quarterly</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
            <select
              className="w-full px-3 py-2 border rounded-md"
              value={filters.status}
              onChange={(e) => handleFilterChange('status', e.target.value)}
            >
              <option value="all">All</option>
              <option value="active">Active</option>
              <option value="completed">Completed</option>
              <option value="scheduled">Scheduled</option>
            </select>
          </div>
        </div>
      </div>
    </Modal>
  );

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="flex justify-between items-center mb-6">
        <div className="flex gap-4">
          <button 
            className="flex items-center gap-2 px-4 py-2 bg-white rounded-lg shadow hover:bg-gray-50"
            onClick={() => setShowFilterModal(true)}
          >
            <Filter className="w-4 h-4" />
            Filter
          </button>
          <button
            className="bg-orange-400 text-white px-4 py-2 rounded-lg hover:bg-orange-500 transition-colors"
            onClick={() => setShowModal(true)}
          >
            Add Campaign
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-400" />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {campaigns.map(campaign => (
            <div 
              key={campaign._id} 
              className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300"
            >
              <div className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-lg font-semibold">{campaign.title}</h3>
                  <button className="text-gray-500 hover:text-gray-700">
                    <ChevronDown className="w-5 h-5" />
                  </button>
                </div>
                <p className="text-gray-600 mb-4">{campaign.description}</p>
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-2xl font-bold">{campaign.visits ? campaign.visits.length : 0}</p>
                    <p className="text-gray-500">Visits</p>
                  </div>
                  <div className="w-16 h-16 relative">
                    <svg className="w-full h-full transform -rotate-90">
                      <circle
                        className="text-gray-200"
                        strokeWidth="5"
                        stroke="currentColor"
                        fill="transparent"
                        r="30"
                        cx="32"
                        cy="32"
                      />
                      <circle
                        className="text-orange-400"
                        strokeWidth="5"
                        strokeDasharray="188.5"
                        strokeDashoffset={188.5 - (188.5 * (campaign.conversations ? campaign.conversations.length : 0) / (campaign.visits ? campaign.visits.length : 1))}
                        strokeLinecap="round"
                        stroke="currentColor"
                        fill="transparent"
                        r="30"
                        cx="32"
                        cy="32"
                      />
                    </svg>
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{campaign.conversations ? campaign.conversations.length : 0}</p>
                    <p className="text-gray-500">Conversions</p>
                  </div>
                </div>
                <div className="mt-4 pt-4 border-t border-gray-100">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Status: <span className="text-gray-700 font-medium capitalize">{campaign.status}</span></span>
                    <span className="text-gray-500">Schedule: <span className="text-gray-700 font-medium capitalize">
                      {campaign.schedule && typeof campaign.schedule === 'object' 
                        ? Object.keys(campaign.schedule).find(key => campaign.schedule[key]) || 'None'
                        : campaign.schedule}
                    </span></span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Campaign Modal */}
      <Modal isOpen={showModal} onClose={() => setShowModal(false)}>
        <div className="p-6">
          <h2 className="text-xl font-semibold text-center mb-6">Add Campaign</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <input
              type="text"
              name="title"
              placeholder="Campaign Title"
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:border-orange-400"
              value={formData.title}
              onChange={handleInputChange}
            />
            
            <div className="grid grid-cols-2 gap-4">
              <input
                type="date"
                name="startDate"
                placeholder="Start Date"
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:border-orange-400"
                value={formData.startDate}
                onChange={handleInputChange}
              />
              <input
                type="date"
                name="endDate"
                placeholder="End Date"
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:border-orange-400"
                value={formData.endDate}
                onChange={handleInputChange}
              />
            </div>

            <textarea
              name="description"
              placeholder="Campaign Description"
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:border-orange-400 h-24 resize-none"
              value={formData.description}
              onChange={handleInputChange}
            />

            <div>
              <p className="text-gray-600 mb-2">Schedule</p>
              <div className="grid grid-cols-2 gap-2">
                {['daily', 'weekly', 'monthly', 'quarterly'].map(schedule => (
                  <label
                    key={schedule}
                    className="flex items-center space-x-2 cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      checked={formData.schedule[schedule]}
                      onChange={() => handleScheduleChange(schedule)}
                      className="rounded border-gray-300 text-orange-400 focus:ring-orange-400"
                    />
                    <span className="capitalize">{schedule}</span>
                  </label>
                ))}
              </div>
            </div>

            <button
              type="submit"
              className="w-full bg-orange-400 text-white py-2 rounded-lg hover:bg-orange-500 transition-colors"
            >
              Save
            </button>
          </form>
        </div>
      </Modal>

      <FilterModal />
    </div>
  );
};

export default Marketing;
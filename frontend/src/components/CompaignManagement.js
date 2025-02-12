import React, { useState, useEffect } from 'react';
import axios from 'axios';
import logo from '../Assets/unicef_logo.png';

const CampaignManagement = () => {
  const [data, setData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortOption, setSortOption] = useState('Newest');
  const [activeTab, setActiveTab] = useState('Campaign');
  const [editCampaign, setEditCampaign] = useState(null); 
  const [formData, setFormData] = useState({
    type: '',
    meetingType: '',
    date: '',
    time: '',
    location: '',
    venue: ''
  });
  const token = localStorage.getItem('token'); 
useEffect(() => {
  const fetchData = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/campaign', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setData(response.data); // Populate data
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  fetchData();
}, []);

useEffect(() => {
  if (data.length > 0) {
    filterDataByType(activeTab); 
  }
}, [data, activeTab]);

  const filterDataByType = (type) => {
    const filtered = data.filter(item => item.type === type);
    setFilteredData(filtered);
    setActiveTab(type); 
  };

  // Handle tab switching (Campaigns, Events, Social Media)
  const handleTabSwitch = (type) => {
    filterDataByType(type);
  };

  const handleSearch = (e) => {
    setSearchQuery(e.target.value);
    const filtered = data.filter((item) =>
      item._id.toLowerCase().includes(e.target.value.toLowerCase())
    );
    setFilteredData(filtered);
  };

  const handleSortChange = (e) => {
    const selectedOption = e.target.value;
    setSortOption(selectedOption);
    const sorted = [...filteredData].sort((a, b) => {
      const dateA = new Date(a.createdAt);
      const dateB = new Date(b.createdAt);
      return selectedOption === 'Newest' ? dateB - dateA : dateA - dateB;
    });
    setFilteredData(sorted);
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`http://localhost:5000/api/campaign/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setFilteredData(filteredData.filter((item) => item._id !== id));
      alert('Deleted successfully.');
    } catch (error) {
      console.error('Error deleting:', error);
      alert('Failed to delete.');
    }
  };

  const handleEdit = (campaign) => {
    setEditCampaign(campaign._id);
    setFormData({
      type: campaign.type,
      meetingType: campaign.meetingType,
      date: campaign.date,
      time: campaign.time,
      location: campaign.location,
      venue: campaign.venue
    });
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };
  const handleUpdate = async () => {
    try {
      const response = await axios.put(
        `http://localhost:5000/api/campaign/${editCampaign}`,
        formData,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const updatedCampaigns = data.map((item) =>
        item._id === editCampaign ? { ...item, ...response.data } : item
      );
      setData(updatedCampaigns);
      filterDataByType(activeTab);
      setEditCampaign(null);
      alert('Campaign updated successfully.');
    } catch (error) {
      console.error('Error updating campaign:', error);
      alert('Failed to update campaign.');
    }
  };
  const getStatus = (date) => {
    const currentDate = new Date();
    const campaignDate = new Date(date);

    if (campaignDate < currentDate) {
      return <span className="text-red-500">Passed</span>;
    } else if (campaignDate.toDateString() === currentDate.toDateString()) {
      return <span className="text-blue-500">Active</span>;
    } else {
      return <span className="text-green-500">Upcoming</span>;
    }
  };

  return (
    <div className="p-5 bg-gray-100" style={{ fontFamily: 'roboto' }}>
      <div className="flex justify-center text-center mt-5 mb-3">
        <img src={logo} alt="UNICEF Logo" className="h-10" />
        <h1 className="text-4xl font-bold text-gray-800">
          Child Rights <span className="text-blue-400">ADVOCACY</span>
        </h1>
      </div>

      <div className="bg-white p-5 border-b-2 flex items-center justify-center">
        <nav className="flex space-x-6">
          <button
            onClick={() => handleTabSwitch('Campaign')}
            className={`text-gray-800 border-b-4 pb-2 font-bold ${activeTab === 'Campaign' ? 'border-gray-800' : 'border-transparent'}`}
          >
            Campaigns
          </button>
          <button
            onClick={() => handleTabSwitch('Event')}
            className={`text-gray-500 ${activeTab === 'Event' ? 'border-b-4 border-gray-800' : 'border-transparent'}`}
          >
            Events
          </button>

        </nav>
      </div>

      <div className="mt-8">
        {/* Search and Sort */}
        <div className="flex justify-between items-center mt-4">
          <h2 className="text-2xl font-bold text-gray-800">{activeTab} Management</h2>
          <div className="relative">
            <input
              type="text"
              className="px-4 py-2 border rounded-md"
              placeholder="Search"
              value={searchQuery}
              onChange={handleSearch}
            />
          </div>
          <div className="flex items-center">
            <span className="mr-2 text-gray-600">Sort by:</span>
            <select className="px-3 py-2 border rounded-md" value={sortOption} onChange={handleSortChange}>
              <option value="Newest">Newest</option>
              <option value="Oldest">Oldest</option>
            </select>
          </div>
        </div>
        <table className="table-auto w-full mt-6 bg-white rounded-md shadow-lg">
          <thead className="bg-gray-100">
            <tr className="text-left text-gray-600">
             
              <th className="py-3 px-4">Type</th>
              <th className="py-3 px-4">Meeting_Type</th>
              <th className="py-3 px-4">Date</th>
              <th className="py-3 px-4">Time</th>
              <th className="py-3 px-4">Location</th>
              <th className="py-3 px-4">Venue</th>
              <th className="py-3 px-4">Status</th>
              <th className="py-3 px-4">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredData.map((item) => (
              <tr key={item._id} className="border-t text-gray-700">
                
                <td className="py-3 px-4">{item.type}</td>
                <td className="py-3 px-4">{item.meetingType}</td>
                <td className="py-3 px-4">{new Date(item.date).toLocaleDateString()}</td>
                <td className="py-3 px-4">{item.time}</td>
                <td className="py-3 px-4">{item.location}</td>
                <td className="py-3 px-4">{item.venue}</td>
                <td className="py-3 px-4">{getStatus(item.date)}</td>
                <td className="py-3 px-4">
                  <button
                    className="mr-2 text-blue-500"
                    onClick={() => handleEdit(item)}
                  >
                    ✎
                  </button>
                  <button
                    className="text-red-500"
                    onClick={() => handleDelete(item._id)}
                  >
                    🗑
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Edit Form */}
      {editCampaign && (
        <div className="mt-8 bg-white p-6 rounded-md shadow-lg">
          <h2 className="text-xl font-bold mb-4">Edit Campaign</h2>
          <form className="space-y-4">
            <input
              type="text"
              name="type"
              value={formData.type}
              onChange={handleChange}
              placeholder="Type"
              className="w-full px-4 py-2 border rounded-md"
            />
            <input
              type="text"
              name="meetingType"
              value={formData.meetingType}
              onChange={handleChange}
              placeholder="Meeting Type"
              className="w-full px-4 py-2 border rounded-md"
            />
            <input
              type="date"
              name="date"
              value={formData.date}
              onChange={handleChange}
              className="w-full px-4 py-2 border rounded-md"
            />
            <input
              type="time"
              name="time"
              value={formData.time}
              onChange={handleChange}
              className="w-full px-4 py-2 border rounded-md"
            />
            <input
              type="text"
              name="location"
              value={formData.location}
              onChange={handleChange}
              placeholder="Location"
              className="w-full px-4 py-2 border rounded-md"
            />
            <input
              type="text"
              name="venue"
              value={formData.venue}
              onChange={handleChange}
              placeholder="Venue"
              className="w-full px-4 py-2 border rounded-md"
            />
            <button
              type="button"
              className="bg-blue-500 text-white px-4 py-2 rounded-md"
              onClick={handleUpdate}
            >
              Update
            </button>
          </form>
        </div>
      )}
    </div>
  );
};

export default CampaignManagement;

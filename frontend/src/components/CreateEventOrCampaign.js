import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import logo from '../Assets/unicef_logo.png'; // Adjust path to logo as necessary

const CreateEventOrCampaign = () => {
  const [formData, setFormData] = useState({
    type: '',
    meetingType: '',
    date: '',
    time: '',
    location: '',
    venue: '',
  });
 const navigate = useNavigate();

  const token = localStorage.getItem('token'); // Retrieve token from localStorage

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const endpoint = 'http://localhost:5000/api/campaign'; // Your API endpoint

    try {
      const response = await axios.post(endpoint, formData, {
        headers: {
          Authorization: `Bearer ${token}`, // Include token in headers for authentication
        },
      });
      console.log('Response:', response.data);

      alert('Campaign or Event created successfully!');
    } catch (error) {
      console.error('Error creating event/campaign:', error);
      alert('Failed to create Campaign or Event. Please try again.');
    }
  };

  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center" style={{ fontFamily: 'roboto' }}>
      <div className="flex justify-center text-center mt-5 mb-3">
        <img src={logo} alt="UNICEF Logo" className="h-10" />
        <h1 className="text-4xl font-bold text-gray-800">
          Child Rights <span className="text-blue-400">ADVOCACY</span>
        </h1>
      </div>

      <div className="bg-gray-200 p-10 text-center">
        <h2 className="text-3xl font-bold text-gray-900 mb-6">
          Create Event or Campaign
        </h2>

        <form onSubmit={handleSubmit} className="flex flex-col space-y-4">
          <select
            name="type"
            value={formData.type}
            onChange={handleChange}
            className="py-2 px-4 rounded-lg border border-gray-300"
            required
          >
            <option value="">Choose</option>
            <option value="Campaign">Campaign</option>
            <option value="Event">Event</option>
          </select>

          <select
            name="meetingType"
            value={formData.meetingType}
            onChange={handleChange}
            className="py-2 px-4 rounded-lg border border-gray-300"
            required
          >
            <option value="">Choose</option>
            <option value="Online">Online</option>
            <option value="Onsite">Onsite</option>
          </select>

          <input
            type="date"
            name="date"
            value={formData.date}
            onChange={handleChange}
            className="py-2 px-4 rounded-lg border border-gray-300"
            required
          />

          <input
            type="time"
            name="time"
            value={formData.time}
            onChange={handleChange}
            className="py-2 px-4 rounded-lg border border-gray-300"
            required
          />

          <input
            type="text"
            name="location"
            value={formData.location}
            onChange={handleChange}
            placeholder="Enter Location"
            className="py-2 px-4 rounded-lg border border-gray-300"
            required
          />

          <input
            type="text"
            name="venue"
            value={formData.venue}
            onChange={handleChange}
            placeholder="Enter Venue"
            className="py-2 px-4 rounded-lg border border-gray-300"
            required
          />

          {/* Buttons */}
          <button type="submit" className="bg-black text-white font-bold py-3 px-10 rounded-md mt-6">
            Create
          </button>
      <button
        className="bg-blue-600 text-white font-bold py-3 px-10 rounded-md mt-3"
        onClick={() => navigate('/dashboard/campaignm')}
      >
        Manage Campaigns & Events
      </button>
        </form>
      </div>
    </div>
  );
};

export default CreateEventOrCampaign;

import React, { useEffect, useState } from 'react';
import axios from 'axios';
import logo from '../Assets/unicef_logo.png';
import { FaArrowRight, FaMapMarkerAlt, FaCalendarAlt, FaClock, FaInfoCircle, FaBullhorn } from 'react-icons/fa';
import moment from 'moment';

const AdvocacyPage = () => {
  const [events, setEvents] = useState([]);
  const [campaigns, setCampaigns] = useState([]);

  const token = localStorage.getItem('token');
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/campaign', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const data = response.data;
        const eventsData = data.filter(item => item.type === 'Event');
        const campaignsData = data.filter(item => item.type === 'Campaign');

        setEvents(eventsData);
        setCampaigns(campaignsData);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchData();
  }, [token]);

  return (
    <div className="" style={{ fontFamily: 'roboto' }}>
      {/* Header Section */}
      <div className="flex justify-center text-center mt-5 mb-3">
        <img src={logo} alt="UNICEF Logo" className="h-10" />
        <h1 className="text-5xl font-extrabold text-gray-800">
          Child Rights <span className="text-blue-500">ADVOCACY</span>
        </h1>
      </div>

      {/* Events Section */}
      <div className="bg-gray-200 py-6">
        <h2 className="text-3xl font-bold text-center text-gray-800">UPCOMING EVENTS</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4 px-10">
          {events.map(event => (
            <div 
              key={event._id} 
              className="bg-white p-6 rounded-lg shadow-lg hover:shadow-2xl transition duration-300 transform hover:scale-105"
            >
              <h3 className="font-extrabold text-xl text-gray-800 mb-2">{event.title}</h3>
              <p className="text-gray-600 flex items-center"><FaInfoCircle className="mr-2 text-blue-500" /> {event.meetingType}</p>
              <p className="text-gray-600 flex items-center"><FaCalendarAlt className="mr-2 text-red-500" /> {moment(event.date).format('MMMM Do YYYY')}</p>
              <p className="text-gray-600 flex items-center"><FaClock className="mr-2 text-green-500" /> Time: {event.time}</p>
              <p className="text-gray-600 flex items-center"><FaMapMarkerAlt className="mr-2 text-purple-500" /> Location: {event.location}</p>
              <p className="text-gray-600">Venue: {event.venue}</p>
              <div className="flex mt-4">
                <FaArrowRight className="text-black text-xl pt-2" />
                <a href={event.venue} className="text-gray-900 font-semibold text-lg underline ml-2">
                  Click here to attend
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Campaigns Section */}
      <div className="bg-gray-200 pb-32">
        <h2 className="text-3xl font-bold text-center text-gray-800">UPCOMING CAMPAIGNS</h2>
        <div className="flex flex-row flex-wrap justify-center">
          {campaigns.map(campaign => (
            <div 
              key={campaign._id} 
              className="flex justify-between w-10/12 bg-white p-6 mt-4 mx-2 rounded-lg shadow-lg hover:shadow-2xl transition duration-300 transform hover:scale-105"
            >
              <h3 className="font-extrabold text-xl text-gray-800 mb-2">{campaign.title}</h3>
              <p className="text-gray-600 flex items-center"><FaBullhorn className="mr-2 text-orange-500" /> {campaign.meetingType}</p>
              <p className="text-gray-600 flex items-center"><FaCalendarAlt className="mr-2 text-red-500" /> {moment(campaign.date).format('MMMM Do YYYY')}</p>
              <p className="text-gray-600 flex items-center"><FaClock className="mr-2 text-green-500" /> Time: {campaign.time}</p>
              <p className="text-gray-600 flex items-center"><FaMapMarkerAlt className="mr-2 text-purple-500" /> Location: {campaign.location}</p>
              <p className="text-gray-600 flex items-center"><FaMapMarkerAlt className="mr-2 text-purple-500" /> Venue: {campaign.venue}</p>
              <a href={campaign.venue} className="text-blue-500 underline flex items-center mt-4">
                <FaArrowRight className="mr-2" /> Learn more
              </a>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AdvocacyPage;

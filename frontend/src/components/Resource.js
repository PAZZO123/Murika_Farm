import React, { useState, useEffect } from 'react';
import axios from 'axios';
import logo from '../Assets/unicef_logo.png';
import { FaDownload, FaCertificate } from 'react-icons/fa';

const Resource = () => {
  const [activeTab, setActiveTab] = useState('courses');
  const [resources, setResources] = useState([]);
  const [filteredResources, setFilteredResources] = useState([]);

  const token = localStorage.getItem('token'); 

  useEffect(() => {
    const fetchResources = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/resources', {
          headers: { Authorization: `Bearer ${token}` },
        });
        setResources(response.data);
      } catch (error) {
        console.error('Error fetching resources:', error);
      }
    };

    fetchResources();
  }, [token]);

  useEffect(() => {
    const filtered = resources.filter((resource) => {
      if (activeTab === 'courses') {
        return resource.title === 'courses';
      } else if (activeTab === 'visuals') {
        return resource.title === 'visuals';
      } else if (activeTab === 'infographics') {
        return resource.title === 'infographics';
      }
      return false;
    });
    setFilteredResources(filtered);
  }, [activeTab, resources]);

  const handleTabClick = (tab) => {
    setActiveTab(tab);
  };

  const handleDownload = (file) => {
    // You can trigger the download by creating a link dynamically
    const link = document.createElement('a');
    link.href = `http://localhost:5000/api/resources/file/${file}`;
    link.download = file; // Specify the filename to download as
    link.click();
  };

  return (
    <div className="p-5 bg-gray-100 text-center" style={{ fontFamily: 'roboto' }}>
      <div className="flex justify-center text-center mt-5 mb-3">
        <img src={logo} alt="UNICEF Logo" className="h-10" />
        <h1 className="text-4xl font-bold text-gray-800">
          Child Rights <span className="text-blue-400">ADVOCACY</span>
        </h1>
      </div>

      {/* Tab Navigation */}
      <div className="flex justify-center mt-5">
        <button
          className={`${
            activeTab === 'courses' ? 'bg-gray-500 text-white' : 'bg-gray-300'
          } px-4 py-2 rounded-md font-bold mr-3`}
          onClick={() => handleTabClick('courses')}
        >
          Courses with Certifications
        </button>
        <button
          className={`${
            activeTab === 'visuals' ? 'bg-gray-500 text-white' : 'bg-gray-300'
          } px-4 py-2 rounded-md font-bold mr-3`}
          onClick={() => handleTabClick('visuals')}
        >
          Visual Contents
        </button>
        <button
          className={`${
            activeTab === 'infographics' ? 'bg-gray-500 text-white' : 'bg-gray-300'
          } px-4 py-2 rounded-md font-bold`}
          onClick={() => handleTabClick('infographics')}
        >
          Infographics
        </button>
      </div>

{/* Courses with Certifications */}
{activeTab === 'courses' && (
  <section className="mt-8">
    <h2 className="text-2xl mb-6 font-bold text-gray-800">Available Courses</h2>
    <div className="flex justify-center flex-wrap gap-6">
      {filteredResources.map((resource) => (
        <div
          key={resource._id}
          className="flex items-center bg-white p-4 shadow-md rounded-lg w-80"
        >
          {/* Icon/Certificate Image */}
          <div className="mr-4">
            <FaCertificate  className="text-lg " />
          </div>

          {/* Course Details */}
          <div   className="flex justify-between gap-20"
        >
           <div>
            <h3 className="text-lg font-semibold text-gray-800">
              {resource.name}
            </h3>
            <p className="text-sm text-gray-500">{resource.description}</p>
            <p className="text-sm text-gray-500 mt-1">{resource.date}</p>
            </div>
            {/* Download Button */}
           <div>
            <a
              href="#"
              className="flex items-center text-blue-500 mt-2 hover:underline"
              onClick={() => handleDownload(resource.file)}
            >
              <FaDownload className="text-lg " />
             
            </a>
            </div>
          </div>
        </div>
      ))}
    </div>
  </section>
)}

      {/* Visual Contents with Video Playback */}
      {activeTab === 'visuals' && (
        <section className="mt-8">
          <h2 className="text-2xl mb-4 font-bold">Visual Contents</h2>
          <div className="flex justify-center flex-wrap">
            {filteredResources.map((resource) => (
              <div key={resource._id} className="w-1/4 m-4 p-4 border rounded-lg bg-white">
                <video controls className="w-full rounded-lg">
                  <source
                    src={`http://localhost:5000/api/resources/file/${resource.file}`}
                    type="video/mp4"
                  />
                  Your browser does not support the video tag.
                </video>
                <p className="my-2 flex">
                  <h2 className="font-bold">Video:</h2> {resource.description}
                </p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Infographics */}
      {activeTab === 'infographics' && (
        <section className="mt-8">
          <h2 className="text-2xl font-bold">Infographics</h2>
          <div className="flex justify-center flex-wrap gap-6">
      {filteredResources.map((resource) => (
        <div
          key={resource._id}
          className="flex items-center bg-white p-4 shadow-md rounded-lg w-80"
        >
          <div   className="flex justify-between gap-20"
        >
           <div>
            <h3 className="text-lg font-semibold text-gray-800">
              {resource.name}
            </h3>
            <p className="text-sm text-gray-500">{resource.description}</p>
            <p className="text-sm text-gray-500 mt-1">{resource.date}</p>
            </div>
            {/* Download Button */}
           <div>
            <a
              href="#"
              className="flex items-center text-blue-500 mt-2 hover:underline"
              onClick={() => handleDownload(resource.file)}
            >
              <FaDownload className="text-lg " />
             
            </a>
            </div>
          </div>
        </div>
      ))}
    </div>
        </section>
      )}
    </div>
  );
};

export default Resource;

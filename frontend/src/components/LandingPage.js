import React from 'react';
import logo from '../Assets/unicef_logo.png'; 
import backgroundImage from '../Assets/children_bg.jpg'; 
import { FaTwitter, FaFacebook, FaCloudDownloadAlt, FaInfoCircle } from 'react-icons/fa';
import { Link } from 'react-router-dom';


const LandingPage = () => {
  return (
    <div className="min-h-screen flex flex-col" style={{ fontFamily: 'roboto' }}>
      <div className=" flex justify-center text-center mt-5 mb-3">
        <img src={logo} alt="UNICEF Logo" className="h-10" />
        <h1 className="text-4xl font-bold text-gray-800">
          Child Rights <span className="text-blue-400">ADVOCACY</span>
        </h1>
      </div>
       <div
        className="flex-grow bg-cover bg-center"
        style={{ backgroundImage: `url(${backgroundImage})` }}
      >
       <p className="text-center  text-lg text-white bg-gray-500">
          Convention on the Rights of a Child (CRC)
        </p>
        <div className="bg-black bg-opacity-40 py-8">
        
          {/* Cards Section */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-6 mx-10">
            {[
              { title: 'Civil Rights', desc: 'Essential rights for every individual...', icon: <FaInfoCircle /> },
              { title: 'Political Rights', desc: 'Rights related to political engagement...', icon: <FaCloudDownloadAlt /> },
              { title: 'Economical Rights', desc: 'Rights to work, salary, and fair treatment...', icon: <FaInfoCircle /> },
              { title: 'Educational Rights', desc: 'Rights to receive an education...', icon: <FaCloudDownloadAlt /> },
              { title: 'Health Rights', desc: 'Access to healthcare for all children...', icon: <FaInfoCircle /> },
              { title: 'Cultural Rights', desc: 'Rights to practice and participate in cultural traditions...', icon: <FaCloudDownloadAlt /> },
            ].map((card, index) => (
              <div key={index} className="bg-white bg-opacity-80 p-4 rounded-lg shadow-lg">
                <h3 className="text-xl font-semibold text-blue-600 mb-3">
                  {card.title}
                </h3>
                <p className="text-sm text-gray-800 mb-6">
                  {card.desc}
                </p>
                <div className="flex justify-between items-center">
                  <button className="text-blue-600 font-bold hover:underline">Actions</button>
                  {card.icon}
                </div>
              </div>
            ))}
          </div>
          <div className="flex justify-center mt-12">
            <Link to="/join">
           <button className="px-6 py-3 text-blue bg-white font-semibold rounded-full hover:bg-blue-700 transition duration-300">
            Get Started
           </button>
          </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LandingPage;

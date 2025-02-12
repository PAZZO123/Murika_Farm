import React, { useEffect, useState } from 'react';
import logo from '../Assets/unicef_logo.png'; 
import { FaUser } from 'react-icons/fa';


const WelcomeUser = () => {
  
  const [loggedInUser, setLoggedInUser] = useState(null);
  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('loggedInUser'));
    if (user) {
      setLoggedInUser(user); 
    }
  }, []);
  if (!loggedInUser) {
    return <p>Loading...</p>;
  }

  return (
    <div className="min-h-screen flex flex-col" style={{ fontFamily: 'roboto' }}>
      <div className=" flex justify-center text-center mt-5 mb-3">
        <img src={logo} alt="UNICEF Logo" className="h-10" />
        <h1 className="text-4xl font-bold text-gray-800">
          Child Rights <span className="text-blue-400">ADVOCACY</span>
        </h1>
      </div>
      <div className="bg-white shadow-lg p-8 rounded-lg text-center max-w-lg mx-auto mt-8">
  <div className="flex justify-center mb-6">
    <div className="bg-gray-300 rounded-full w-24 h-24 flex items-center justify-center">
       <FaUser className="text-gray-700 text-4xl" />
    </div>
  </div>
  <h2 className="border-b-2 border-gray-300 text-2xl font-semibold mb-6">
    {loggedInUser.username}
  </h2>
  <p className="text-gray-600 leading-relaxed mb-6">
    Welcome again, <strong>{loggedInUser.username}</strong>. Your assistance in 
    achieving the goal of Child Advocacy is invaluable. Our community deeply 
    appreciates your efforts in creating a safer place for children.
  </p>
  <h3 className="text-xl font-bold text-gray-800">Have a great day!</h3>
</div>

    </div>
  );
};

export default WelcomeUser;

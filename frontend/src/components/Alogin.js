import React, { useState } from 'react';
import axios from 'axios';
import { FaUser, FaPhone, FaLock } from 'react-icons/fa'; // React Icons for input fields
import logo from '../Assets/unicef_logo.png'; 
import { Link, useNavigate } from 'react-router-dom';

const Alogin = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    username: '',
    password: '',
  });

  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await axios.post('http://localhost:5000/api/auth/signin', {
        username: formData.username,
        password: formData.password,
      });
      const { token, loggedInUser } = response.data;
      localStorage.setItem('token', token);
      localStorage.setItem('loggedInUser', JSON.stringify(loggedInUser));
      setSuccess('Signup successful!');
        if (loggedInUser.role === 'USER') {
          navigate('/dashboard/postfeed');
        } else if (loggedInUser.role === 'ADMIN') {
          navigate('/dashboard/listuser');
        } else {
          navigate('/dashboard/postfeed'); 
        }
      }  catch (err) {
      setError('Error signing up');
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6" style={{ fontFamily: 'roboto' }}>
      <div className="w-full max-w-md p-8 rounded-lg shadow-lg">
        {/* UNICEF Logo */}
        <div className="flex justify-center mb-6">
          <img src={logo} alt="UNICEF Logo" className="h-12" />
        </div>

        {/* Child Rights Advocacy Header */}
        <h2 className="text-2xl font-bold text-center text-gray-900">
          Child Rights <span className="text-blue-600">ADVOCACY</span>
        </h2>

        {/* SignUp Form */}
        <form onSubmit={handleSubmit} className="mt-3 bg-gray-500 p-5 text-white font-bold rounded">
          <h3 className="text-2xl font-semibold text-center mb-6 ">
            ADMIN Login
          </h3>

          <div className="mb-4">
            <label htmlFor="username" className="sr-only">
              Username
            </label>
            <div className="flex items-center border-b border-white rounded-md p-3">
              <FaUser className="text-white mr-2" />
              <input
                id="username"
                name="username"
                type="text"
                placeholder="Enter Username"
                value={formData.username}
                onChange={handleChange}
                className="w-full focus:outline-none bg-gray-500 text-white"
              />
            </div>
          </div>
         <div className="mb-4">
            <label htmlFor="password" className="sr-only">
              Password
            </label>
            <div className="flex items-center border-b border-white rounded-md p-3">
              <FaLock className="text-white mr-2" />
              <input
                id="password"
                name="password"
                type="password"
                placeholder="Enter Password"
                value={formData.password}
                onChange={handleChange}
                className="w-full focus:outline-none bg-gray-500 text-white"
              />
            </div>
          </div>

          {/* Error or Success Message */}
          {error && <p className="text-red-500 text-sm text-center mb-4">{error}</p>}
          {success && <p className="text-green-500 text-sm text-center mb-4">{success}</p>}

          {/* SignUp Button */}
          <button
            type="submit"
            className="w-full p-3 text-white bg-blue-600 rounded-md hover:bg-blue-700 transition duration-300"
          >
            Login
          </button>
        </form>
      </div>
    </div>
  );
};

export default Alogin;

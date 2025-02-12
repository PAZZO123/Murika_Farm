import React, { useState, useEffect } from 'react';
import axios from 'axios';
import logo from '../Assets/unicef_logo.png';
import { FaUser } from 'react-icons/fa';

const ProfilePage = () => {
  const [profile, setProfile] = useState({
    firstName: '',
    lastName: '',
    email: '',
    dateOfBirth: '',
    nationality: '',
    phone: '',
  });

  const [editMode, setEditMode] = useState(false); // Toggle edit mode
  const [updatedProfile, setUpdatedProfile] = useState(profile); // State to hold updated values

  const token = localStorage.getItem('token'); // For authorization header

  // Fetch profile data
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/auth/profile', {
          headers: { Authorization: `Bearer ${token}` },
        });
        setProfile(response.data);
        setUpdatedProfile(response.data); // Set the initial values for the form
      } catch (error) {
        console.error('Error fetching profile:', error);
      }
    };
    fetchProfile();
  }, [token]);

  // Handle form input changes
  const handleChange = (e) => {
    setUpdatedProfile({
      ...updatedProfile,
      [e.target.name]: e.target.value,
    });
  };

  // Submit updated profile
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.put('http://localhost:5000/api/auth/profile', updatedProfile, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setProfile(response.data); // Update profile data
      setEditMode(false); // Exit edit mode
      alert('Profile updated successfully');
    } catch (error) {
      console.error('Error updating profile:', error);
      alert('Failed to update profile');
    }
  };

  return (
    <div className="min-h-screen" style={{ fontFamily: 'roboto' }}>
      <div className="flex justify-center text-center mt-5 mb-3">
        <img src={logo} alt="UNICEF Logo" className="h-10" />
        <h1 className="text-4xl font-bold text-gray-800">
          Child Rights <span className="text-blue-400">ADVOCACY</span>
        </h1>
      </div>

      <div className="flex flex-col p-6 bg-gray-200">
        <div className="flex items-center space-x-4">
          <FaUser className="text-gray-700 text-4xl  p-2 bg-white rounded-full" />
          <h2 className="text-xl font-bold text-gray-800">{profile.firstName} {profile.lastName} <br></br>
         <p className="text-sm text-gray-500">@{profile.username}</p></h2>  
        </div>
        <button
          className="ml-auto bg-gray-500 text-white font-bold px-4 py-2 rounded-full"
          onClick={() => setEditMode(!editMode)}
        >
          {editMode ? 'Cancel' : 'Edit Profile'}
        </button>
      </div>

      {/* Profile Details */}
      <div>
        {!editMode ? (
          <div className="bg-white w-10/12 mt-6 p-6 rounded-lg shadow-md mx-auto">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-gray-800">
              <div>
                <h4 className="text-sm font-bold text-gray-500">Firstname</h4>
                <p className="text-lg">{profile.firstName}</p>
              </div>
              <div>
                <h4 className="text-sm font-bold text-gray-500">Lastname</h4>
                <p className="text-lg">{profile.lastName}</p>
              </div>
              <div>
                <h4 className="text-sm font-bold text-gray-500">Email</h4>
                <p className="text-lg">{profile.email}</p>
              </div>
              <div>
                <h4 className="text-sm font-bold text-gray-500">Date of Birth</h4>
                <p className="text-lg">{profile.dateOfBirth ? new Date(profile.dateOfBirth).toLocaleDateString() : 'N/A'}</p>
              </div>
              <div>
                <h4 className="text-sm font-bold text-gray-500">Nationality</h4>
                <p className="text-lg">{profile.nationality}</p>
              </div>
              <div>
                <h4 className="text-sm font-bold text-gray-500">Phone</h4>
                <p className="text-lg">{profile.phone}</p>
              </div>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="bg-white w-10/12 mt-6 p-6 rounded-lg shadow-md">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-gray-800">
              <div>
                <label className="text-sm font-bold text-gray-500">Firstname</label>
                <input
                  type="text"
                  name="firstName"
                  value={updatedProfile.firstName}
                  onChange={handleChange}
                  className="block w-full p-2 border border-gray-300 rounded-md"
                />
              </div>
              <div>
                <label className="text-sm font-bold text-gray-500">Lastname</label>
                <input
                  type="text"
                  name="lastName"
                  value={updatedProfile.lastName}
                  onChange={handleChange}
                  className="block w-full p-2 border border-gray-300 rounded-md"
                />
              </div>
              <div>
                <label className="text-sm font-bold text-gray-500">Email</label>
                <input
                  type="email"
                  name="email"
                  value={updatedProfile.email}
                  onChange={handleChange}
                  className="block w-full p-2 border border-gray-300 rounded-md"
                />
              </div>
              <div>
                <label className="text-sm font-bold text-gray-500">Date of Birth</label>
                <input
                  type="date"
                  name="dateOfBirth"
                  value={updatedProfile.dateOfBirth ? updatedProfile.dateOfBirth.split('T')[0] : ''} // Handling undefined case
                  onChange={handleChange}
                  className="block w-full p-2 border border-gray-300 rounded-md"
                />
              </div>
              <div>
                <label className="text-sm font-bold text-gray-500">Nationality</label>
                <input
                  type="text"
                  name="nationality"
                  value={updatedProfile.nationality}
                  onChange={handleChange}
                  className="block w-full p-2 border border-gray-300 rounded-md"
                />
              </div>
              <div>
                <label className="text-sm font-bold text-gray-500">Phone</label>
                <input
                  type="text"
                  name="phone"
                  value={updatedProfile.phone}
                  onChange={handleChange}
                  className="block w-full p-2 border border-gray-300 rounded-md"
                />
              </div>
            </div>
            <button
              type="submit"
              className="mt-6 bg-blue-500 text-white px-4 py-2 rounded-full hover:bg-blue-700"
            >
              Save Changes
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default ProfilePage;

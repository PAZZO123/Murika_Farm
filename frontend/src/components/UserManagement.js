import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FaSearch, FaTrash, FaPen, FaChevronRight, FaPlus } from 'react-icons/fa';

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    dateOfBirth: "",
    nationality: "",
    password:"",
    username: "",
    phone: "",
    email: "",
    password: "",
    role: "employee"
  });
  const [selectedId, setSelectedId] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

  // Function to get the token from localStorage
  const getAuthToken = () => {
    return localStorage.getItem('token');
  };

  // Function to configure headers for axios
  const getHeaders = () => {
    const token = getAuthToken();
    return token ? { Authorization: `Bearer ${token}` } : {};
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await axios.get("http://localhost:5000/api/auth/users", {
        headers: getHeaders()
      });
      setUsers(response.data);
    } catch (error) {
      if (error.response?.status === 401) {
        alert("Please sign in to access this page");
        window.location.href = '/login';
      }
      console.error("Error fetching users", error);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this user?")) return;
    try {
      await axios.delete(`http://localhost:5000/api/auth/users/${id}`, {
        headers: getHeaders()
      });
      fetchUsers();
    } catch (error) {
      if (error.response?.status === 401) {
        alert("Unauthorized to perform this action");
        return;
      }
      console.error("Error deleting user", error);
      alert(error.response?.data?.message || "Error deleting user");
    }
  };

  const handleSave = async () => {
    try {
      const dataToSend = { ...formData };
      if (!dataToSend.password) delete dataToSend.password;

      if (editMode) {
        await axios.put(`http://localhost:5000/api/auth/profile`, dataToSend, {
          headers: getHeaders()
        });
      } else {
        await axios.post("http://localhost:5000/api/auth/signup", formData, {
          headers: getHeaders()
        });
      }

      setIsOpen(false);
      setEditMode(false);
      setFormData({
        firstName: "",
        lastName: "",
        dateOfBirth: "",
        nationality: "",
        username: "",
        password:"",
        phone: "",
        email: "",
        password: "",
        role: "employee"
      });
      fetchUsers();
    } catch (error) {
      if (error.response?.status === 401) {
        alert("Unauthorized to perform this action");
        return;
      }
      console.error("Error saving user", error);
      alert(error.response?.data?.message || "Error saving user");
    }
  };

  const handleEdit = async (userId) => {
    try {
      const response = await axios.get(`http://localhost:5000/api/auth/users/${userId}`, {
        headers: getHeaders()
      });
      const user = response.data;
      
      setEditMode(true);
      setSelectedId(user._id);
      setFormData({
        ...user,
        password: "",
        dateOfBirth: user.dateOfBirth ? new Date(user.dateOfBirth).toISOString().split('T')[0] : ""
      });
      setIsOpen(true);
    } catch (error) {
      if (error.response?.status === 401) {
        alert("Unauthorized to access user details");
        return;
      }
      console.error("Error fetching user details", error);
      alert(error.response?.data?.message || "Error fetching user details");
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const filteredUsers = users.filter(user => 
    user.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.lastName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.username?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-6">
      {/* Header Section */}
      <div className="flex justify-between items-center mb-6">
        <div className="relative w-64">
          <input
            type="text"
            placeholder="Search users"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-200"
          />
          <FaSearch className="absolute left-3 top-2.5 text-gray-400 w-5 h-5" />
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => {
              setIsOpen(true);
              setEditMode(false);
              setFormData({
                firstName: "",
                lastName: "",
                dateOfBirth: "",
                nationality: "",
                username: "",
                phone: "",
                email: "",
                password: "",
                role: "employee"
              });
            }}
            className="flex items-center gap-2 px-4 py-2 bg-orange-400 text-white rounded-lg hover:bg-orange-500"
          >
            <FaPlus className="w-4 h-4" />
            Add User
          </button>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-lg shadow overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">Name</th>
              <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">Username</th>
              <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">Email</th>
              <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">Phone</th>
              <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">Role</th>
              <th className="px-6 py-3 text-right text-sm font-medium text-gray-500">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {filteredUsers.map((user) => (
              <tr key={user._id} className="hover:bg-gray-50">
                <td className="px-6 py-4 text-sm font-medium text-gray-900">
                  {`${user.firstName || ''} ${user.lastName || ''}`}
                </td>
                <td className="px-6 py-4 text-sm text-gray-500">{user.username}</td>
                <td className="px-6 py-4 text-sm text-gray-500">{user.email}</td>
                <td className="px-6 py-4 text-sm text-gray-500">{user.phone}</td>
                <td className="px-6 py-4 text-sm text-gray-500">
                  <span className={`inline-flex px-3 py-1 rounded-full ${
                    user.role === 'admin' ? 'bg-orange-100 text-orange-400' : 'bg-gray-100 text-gray-500'
                  }`}>
                    {user.role}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <div className="flex justify-end items-center gap-3">
                    <button 
                      onClick={() => handleDelete(user._id)}
                      className="text-red-500 hover:text-red-700"
                    >
                      <FaTrash className="w-4 h-4" />
                    </button>
                    <button 
                      onClick={() => handleEdit(user._id)}
                      className="text-orange-400 hover:text-orange-600"
                    >
                      <FaPen className="w-4 h-4" />
                    </button>
                    <button className="text-gray-400 hover:text-gray-600">
                      <FaChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal for User Form */}
      {isOpen && (
        <div className="fixed inset-0 flex justify-center items-center z-50">
          <div className="bg-white rounded-lg shadow-xl w-96 p-6">
            <h3 className="text-lg font-semibold mb-4">{editMode ? "Edit User" : "Add User"}</h3>
            <form onSubmit={(e) => { e.preventDefault(); handleSave(); }}>
            <div className="mb-4">
              <label htmlFor="firstName" className="block text-sm font-medium text-gray-700">First Name</label>
              <input
                type="text"
                name="firstName"
                id="firstName"
                placeholder="First Name"
                value={formData.firstName}
                onChange={handleInputChange}
                className="w-full p-2 mt-1 border border-gray-300 rounded-lg"
                required
              />
            </div>

            <div className="mb-4">
              <label htmlFor="lastName" className="block text-sm font-medium text-gray-700">Last Name</label>
              <input
                type="text"
                name="lastName"
                id="lastName"
                placeholder="Last Name"
                value={formData.lastName}
                onChange={handleInputChange}
                className="w-full p-2 mt-1 border border-gray-300 rounded-lg"
                required
              />
            </div>
            <div className="mb-4">
              <label htmlFor="username" className="block text-sm font-medium text-gray-700">username</label>
              <input
                type="text"
                name="username"
                id="username"
                placeholder="Username"
                value={formData.username}
                onChange={handleInputChange}
                className="w-full p-2 mt-1 border border-gray-300 rounded-lg"
                required
              />
            </div>
            <div className="mb-4">
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email</label>
              <input
                type="email"
                name="email"
                id="email"
                placeholder="Email"
                value={formData.email}
                onChange={handleInputChange}
                className="w-full p-2 mt-1 border border-gray-300 rounded-lg"
                required
              />
            </div>
            <div className="mb-4">
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">Password</label>
              <input
                type="password"
                name="password"
                id="password"
                placeholder="password"
                value={formData.password}
                onChange={handleInputChange}
                className="w-full p-2 mt-1 border border-gray-300 rounded-lg"
                required
              />
            </div>

            <div className="mb-4">
              <label htmlFor="phone" className="block text-sm font-medium text-gray-700">Phone</label>
              <input
                type="text"
                name="phone"
                id="phone"
                placeholder="Phone"
                value={formData.phone}
                onChange={handleInputChange}
                className="w-full p-2 mt-1 border border-gray-300 rounded-lg"
              />
            </div>

            <div className="mb-4">
              <label htmlFor="role" className="block text-sm font-medium text-gray-700">Role</label>
              <select
                name="role"
                id="role"
                value={formData.role}
                onChange={handleInputChange}
                className="w-full p-2 mt-1 border border-gray-300 rounded-lg"
              >
                <option value="employee">Employee</option>
                <option value="admin">Admin</option>
                <option value="manager">Manager</option>
              </select>
            </div>

            <div className="flex justify-end gap-4">
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="px-4 py-2 bg-gray-200 rounded-lg"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-orange-400 text-white rounded-lg hover:bg-orange-500"
              >
                Save
              </button>
            </div>
          </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserManagement;

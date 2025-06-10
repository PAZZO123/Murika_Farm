import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FaSearch, FaTrash, FaPen, FaChevronRight, FaPlus, FaChevronLeft, FaDownload, FaEye } from 'react-icons/fa';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

const UserManagement = () => {
    const [users, setUsers] = useState([]);
    const [isFormModalOpen, setIsFormModalOpen] = useState(false);
    const [isViewModalOpen, setIsViewModalOpen] = useState(false);
    const [editMode, setEditMode] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [usersPerPage] = useState(5);
    const [formData, setFormData] = useState({
        firstName: "",
        lastName: "",
        dateOfBirth: "",
        nationality: "",
        password: "",
        username: "",
        phone: "",
        email: "",
        role: "employee"
    });
    const [viewedUser, setViewedUser] = useState(null);
    const [selectedId, setSelectedId] = useState(null);
    const [searchTerm, setSearchTerm] = useState("");

    const getAuthToken = () => {
        return localStorage.getItem('token');
    };

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
                alert("Unauthorized to perform this action. Only an admin can delete users.");
                return;
            }
            console.error("Error deleting user", error);
            alert(error.response?.data?.message || "Error deleting user");
        }
    };

    const handleSave = async () => {
        try {
            const dataToSend = { ...formData };
            if (editMode && !dataToSend.password) {
                delete dataToSend.password;
            }

            if (editMode) {
                await axios.put(`http://localhost:5000/api/auth/users/${selectedId}`, dataToSend, {
                    headers: getHeaders()
                });
            } else {
                // For new user creation, always use the /api/auth/signup endpoint
                await axios.post("http://localhost:5000/api/auth/signup", dataToSend, {
                    headers: getHeaders()
                });
            }

            setIsFormModalOpen(false);
            setEditMode(false);
            setSelectedId(null);
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
            fetchUsers();
        } catch (error) {
            if (error.response?.status === 401 || error.response?.status === 403) {
                alert(error.response?.data?.message || "Unauthorized to perform this action.");
                return;
            }
            console.error("Error saving user", error);
            alert(error.response?.data?.error || error.response?.data?.message || "Error saving user");
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
                firstName: user.firstName || "",
                lastName: user.lastName || "",
                dateOfBirth: user.dateOfBirth ? new Date(user.dateOfBirth).toISOString().split('T')[0] : "",
                nationality: user.nationality || "",
                username: user.username || "",
                phone: user.phone || "",
                email: user.email || "",
                password: "",
                role: user.role || "employee"
            });
            setIsFormModalOpen(true);
        } catch (error) {
            if (error.response?.status === 401 || error.response?.status === 403) {
                alert(error.response?.data?.message || "Unauthorized to access user details.");
                return;
            }
            console.error("Error fetching user details for edit", error);
            alert(error.response?.data?.message || "Error fetching user details");
        }
    };

    const handleViewUser = async (userId) => {
        try {
            const response = await axios.get(`http://localhost:5000/api/auth/users/${userId}`, {
                headers: getHeaders()
            });
            setViewedUser(response.data);
            setIsViewModalOpen(true);
        } catch (error) {
            if (error.response?.status === 401 || error.response?.status === 403) {
                alert(error.response?.data?.message || "Unauthorized to view user details.");
                return;
            }
            console.error("Error fetching user details for view", error);
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
        user.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.role?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const indexOfLastUser = currentPage * usersPerPage;
    const indexOfFirstUser = indexOfLastUser - usersPerPage;
    const currentUsers = filteredUsers.slice(indexOfFirstUser, indexOfLastUser);
    const totalPages = Math.ceil(filteredUsers.length / usersPerPage);

    const nextPage = () => {
        if (currentPage < totalPages) {
            setCurrentPage(currentPage + 1);
        }
    };

    const prevPage = () => {
        if (currentPage > 1) {
            setCurrentPage(currentPage - 1);
        }
    };

    const downloadPDF = () => {
        const doc = new jsPDF();
        doc.text("User Registration Report", 10, 10);
        doc.autoTable({
            head: [['Name', 'Username', 'Email', 'Phone', 'Role']],
            body: filteredUsers.map(user => [
                `${user.firstName || ''} ${user.lastName || ''}`,
                user.username,
                user.email,
                user.phone,
                user.role
            ]),
            startY: 20
        });
        doc.save('user_management_report.pdf');
    };

    return (
        <div className="p-6">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-gray-800">User Registration</h1>
                <div className="flex items-center gap-4">
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
                    <button
                        onClick={() => {
                            setIsFormModalOpen(true);
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
                    <button
                        onClick={downloadPDF}
                        className="flex items-center gap-2 px-4 py-2 bg-blue-400 text-white rounded-lg hover:bg-blue-500"
                    >
                        <FaDownload className="w-4 h-4" />
                        Download PDF
                    </button>
                </div>
            </div>

            <div className="bg-white rounded-lg shadow overflow-hidden">
                <table className="w-full">
                    <thead className="bg-orange-50">
                        <tr>
                            <th className="px-6 py-4 text-left text-sm font-semibold text-orange-600">Name</th>
                            <th className="px-6 py-4 text-left text-sm font-semibold text-orange-600">Username</th>
                            <th className="px-6 py-4 text-left text-sm font-semibold text-orange-600">Email</th>
                            <th className="px-6 py-4 text-left text-sm font-semibold text-orange-600">Phone</th>
                            <th className="px-6 py-4 text-left text-sm font-semibold text-orange-600">Role</th>
                            <th className="px-6 py-4 text-right text-sm font-semibold text-orange-600">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                        {currentUsers.map((user) => (
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
                                            onClick={() => handleViewUser(user._id)}
                                            className="text-blue-500 hover:text-blue-700"
                                        >
                                            <FaEye className="w-4 h-4" />
                                        </button>
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
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>

                <div className="flex items-center justify-between px-6 py-4 bg-gray-50">
                    <div className="text-sm text-gray-500">
                        Showing {indexOfFirstUser + 1} to {Math.min(indexOfLastUser, filteredUsers.length)} of {filteredUsers.length} users
                    </div>
                    <div className="flex gap-2">
                        <button
                            onClick={prevPage}
                            disabled={currentPage === 1}
                            className={`p-2 rounded ${
                                currentPage === 1
                                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                    : 'bg-orange-100 text-orange-600 hover:bg-orange-200'
                            }`}
                        >
                            <FaChevronLeft className="w-4 h-4" />
                        </button>
                        <button
                            onClick={nextPage}
                            disabled={currentPage === totalPages}
                            className={`p-2 rounded ${
                                currentPage === totalPages
                                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                    : 'bg-orange-100 text-orange-600 hover:bg-orange-200'
                            }`}
                        >
                            <FaChevronRight className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            </div>

            {isFormModalOpen && (
                <div className="fixed inset-0 flex justify-center items-center z-50 bg-black bg-opacity-50">
                    <div className="bg-white rounded-lg shadow-xl w-[500px] p-6">
                        <h3 className="text-lg font-semibold mb-4">{editMode ? "Edit User" : "Add User"}</h3>

                        <form onSubmit={(e) => { e.preventDefault(); handleSave(); }}>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
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

                                <div>
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

                                <div>
                                    <label htmlFor="username" className="block text-sm font-medium text-gray-700">Username</label>
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

                                <div>
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

                                <div>
                                    <label htmlFor="password" className="block text-sm font-medium text-gray-700">Password</label>
                                    <input
                                        type="password"
                                        name="password"
                                        id="password"
                                        placeholder={editMode ? "Leave blank to keep current" : "Password"}
                                        value={formData.password}
                                        onChange={handleInputChange}
                                        className="w-full p-2 mt-1 border border-gray-300 rounded-lg"
                                        required={!editMode}
                                    />
                                </div>

                                <div>
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

                                <div>
                                    <label htmlFor="dateOfBirth" className="block text-sm font-medium text-gray-700">Date of Birth</label>
                                    <input
                                        type="date"
                                        name="dateOfBirth"
                                        id="dateOfBirth"
                                        value={formData.dateOfBirth}
                                        onChange={handleInputChange}
                                        className="w-full p-2 mt-1 border border-gray-300 rounded-lg"
                                    />
                                </div>

                                <div>
                                    <label htmlFor="nationality" className="block text-sm font-medium text-gray-700">Nationality</label>
                                    <input
                                        type="text"
                                        name="nationality"
                                        id="nationality"
                                        placeholder="Nationality"
                                        value={formData.nationality}
                                        onChange={handleInputChange}
                                        className="w-full p-2 mt-1 border border-gray-300 rounded-lg"
                                    />
                                </div>

                                <div className="col-span-2">
                                    <label htmlFor="role" className="block text-sm font-medium text-gray-700">Role</label>
                                    <select
                                        name="role"
                                        id="role"
                                        value={formData.role}
                                        onChange={handleInputChange}
                                        className="w-full p-2 mt-1 border border-gray-300 rounded-lg"
                                    >
                                        <option value="employee">Employee</option>
                                        <option value="finance">Finance Manager</option>
                                        <option value="marketing">Marketing Manager</option>
                                        <option value="manager">Manager</option>
                                        {/* Removed client role option if this form is exclusively for staff signup */}
                                    </select>
                                </div>
                            </div>

                            <div className="flex justify-end gap-4 mt-6">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setIsFormModalOpen(false);
                                        setEditMode(false);
                                        setSelectedId(null);
                                        setFormData({
                                            firstName: "", lastName: "", dateOfBirth: "", nationality: "",
                                            username: "", phone: "", email: "", password: "", role: "employee"
                                        });
                                    }}
                                    className="px-4 py-2 bg-gray-200 text-gray-600 rounded-lg hover:bg-gray-300"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="px-4 py-2 bg-orange-400 text-white rounded-lg hover:bg-orange-500"
                                >
                                    {editMode ? "Update" : "Save"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {isViewModalOpen && viewedUser && (
                <div className="fixed inset-0 flex justify-center items-center z-50 bg-black bg-opacity-50">
                    <div className="bg-white rounded-lg shadow-xl w-[400px] p-6">
                        <h3 className="text-lg font-semibold mb-4">User Details</h3>
                        <div className="space-y-2">
                            <p><strong>Name:</strong> {viewedUser.firstName} {viewedUser.lastName}</p>
                            <p><strong>Username:</strong> {viewedUser.username}</p>
                            <p><strong>Email:</strong> {viewedUser.email}</p>
                            <p><strong>Phone:</strong> {viewedUser.phone}</p>
                            <p><strong>Role:</strong> {viewedUser.role}</p>
                            {viewedUser.dateOfBirth && <p><strong>Date of Birth:</strong> {new Date(viewedUser.dateOfBirth).toLocaleDateString()}</p>}
                            {viewedUser.nationality && <p><strong>Nationality:</strong> {viewedUser.nationality}</p>}
                        </div>
                        <div className="flex justify-end mt-6">
                            <button
                                type="button"
                                onClick={() => setIsViewModalOpen(false)}
                                className="px-4 py-2 bg-gray-200 text-gray-600 rounded-lg hover:bg-gray-300"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default UserManagement;
import React, { useState, useEffect } from "react";
import { FiSearch, FiPlus, FiFilter } from "react-icons/fi";
import { IoClose } from "react-icons/io5";
import axios from "axios";

const Project = () => {
  const [projects, setProjects] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [newProject, setNewProject] = useState({
    title: "",
    type: "",
    startDate: "",
    endDate: "",
    description: "",
    teamMembers: [],
  });
  const [users, setUsers] = useState([]); // To store users
  const [filterType, setFilterType] = useState(""); // To store filter type

  // Fetch users (team members) from API
  useEffect(() => {
    const fetchUsers = async () => {
      const token = localStorage.getItem("token");

      try {
        const response = await axios.get("http://localhost:5000/api/auth/users", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setUsers(response.data);
      } catch (error) {
        console.error("Error fetching users:", error);
      }
    };

    fetchUsers();
  }, []);

  // Fetch projects from API
  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const response = await axios.get("http://localhost:5000/api/projects");
        setProjects(response.data);
      } catch (error) {
        console.error("Error fetching projects:", error);
      }
    };

    fetchProjects();
  }, []);

  // Handle input change for form
  const handleChange = (e) => {
    const { name, value } = e.target;
    setNewProject({ ...newProject, [name]: value });
  };

  // Handle checkbox change for team members
  const handleCheckboxChange = (memberId) => {
    setNewProject((prev) => ({
      ...prev,
      teamMembers: prev.teamMembers.includes(memberId)
        ? prev.teamMembers.filter((m) => m !== memberId)
        : [...prev.teamMembers, memberId],
    }));
  };

  // Add new project
  const handleAddProject = async () => {
    try {
      const response = await axios.post("http://localhost:5000/api/projects", newProject, {
        headers: {
          "Content-Type": "application/json",
        },
      });
      setProjects([...projects, response.data]);
      setShowModal(false);
      setNewProject({
        title: "",
        type: "",
        startDate: "",
        endDate: "",
        description: "",
        teamMembers: [],
      });
    } catch (error) {
      console.error("Error adding project:", error);
    }
  };

  // Delete project
  const handleDeleteProject = async (id) => {
    try {
      await axios.delete(`http://localhost:5000/api/projects/${id}`);
      setProjects(projects.filter((project) => project._id !== id));
    } catch (error) {
      console.error("Error deleting project:", error);
    }
  };

  // Update project
  const handleUpdateProject = async (id) => {
    try {
      const response = await axios.put(`http://localhost:5000/api/projects/${id}`, newProject);
      setProjects(projects.map((project) => (project._id === id ? response.data : project)));
      setShowModal(false);
      setNewProject({
        title: "",
        type: "",
        startDate: "",
        endDate: "",
        description: "",
        teamMembers: [],
      });
    } catch (error) {
      console.error("Error updating project:", error);
    }
  };

  // Handle filter change
  const handleFilterChange = (e) => {
    setFilterType(e.target.value);
  };

  return (
    <div className="container mx-auto p-6">
      {/* Header with Search, Filter, and Add Project */}
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center space-x-2 border px-3 py-2 rounded-lg shadow-md">
          <FiSearch className="text-gray-500" />
          <input
            type="text"
            placeholder="Search"
            className="outline-none bg-transparent"
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {/* Filter Dropdown */}
        <select
          onChange={handleFilterChange}
          value={filterType}
          className="bg-gray-200 px-4 py-2 rounded-lg"
        >
          <option value="">Filter</option>
          <option value="Ongoing">Ongoing</option>
          <option value="Completed">Completed</option>
          <option value="Pending">Pending</option>
        </select>

        <button
          onClick={() => setShowModal(true)}
          className="bg-orange-500 text-white px-4 py-2 rounded-lg flex items-center gap-2"
        >
          <FiPlus /> Add Project
        </button>
      </div>

      {/* Project List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {projects
          .filter(
            (project) =>
              project.title.toLowerCase().includes(searchTerm.toLowerCase()) &&
              (filterType ? project.type === filterType : true)
          )
          .map((project) => (
            <div key={project._id} className="bg-white shadow-md p-4 rounded-lg">
              <div className="flex justify-between items-center mb-2">
                <h2 className="text-xl font-bold">{project.title}</h2>
                <span className="text-sm px-2 py-1 bg-gray-200 rounded">{project.type}</span>
              </div>
              <p className="text-gray-600">{project.description}</p>
              <p className="text-gray-500 mt-2">
                📅 {new Date(project.startDate).toLocaleDateString()} - {new Date(project.endDate).toLocaleDateString()}
              </p>
              <div className="mt-2">
                <span className="text-gray-500">👥 Team:</span>
                <div className="flex space-x-2 mt-1">
                  {project.teamMembers.map((member) => (
                    <span key={member._id} className="bg-gray-100 px-2 py-1 rounded text-sm">
                      {member.firstName} {member.lastName}
                    </span>
                  ))}
                </div>
              </div>
              <div className="mt-4 flex space-x-4">
                <button
                  className="bg-orange-500 text-white px-4 py-2 rounded-lg"
                  onClick={() => handleUpdateProject(project._id)}
                >
                  Update
                </button>
                <button
                  className="bg-red-500 text-white px-4 py-2 rounded-lg"
                  onClick={() => handleDeleteProject(project._id)}
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
      </div>

      {/* Modal for Adding Project */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center">
          <div className="bg-white p-6 rounded-lg shadow-lg w-96">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-bold">Add Project</h2>
              <IoClose className="cursor-pointer text-gray-500" onClick={() => setShowModal(false)} />
            </div>
            <input
              type="text"
              name="title"
              placeholder="Project Title"
              value={newProject.title}
              onChange={handleChange}
              className="w-full border rounded p-2 mt-4"
            />
            <input
              type="text"
              name="type"
              placeholder="Project Type"
              value={newProject.type}
              onChange={handleChange}
              className="w-full border rounded p-2 mt-4"
            />
            <div className="flex space-x-2 mt-4">
              <input
                type="date"
                name="startDate"
                value={newProject.startDate}
                onChange={handleChange}
                className="w-1/2 border rounded p-2"
              />
              <input
                type="date"
                name="endDate"
                value={newProject.endDate}
                onChange={handleChange}
                className="w-1/2 border rounded p-2"
              />
            </div>
            <textarea
              name="description"
              placeholder="Project Description"
              value={newProject.description}
              onChange={handleChange}
              className="w-full border rounded p-2 mt-4"
            />
            <div className="mt-4">
              <label className="text-gray-700">Team Members</label>
              <div className="flex flex-col mt-2">
                {users.map((user) => (
                  <label key={user._id} className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={newProject.teamMembers.includes(user._id)}
                      onChange={() => handleCheckboxChange(user._id)}
                    />
                    <span>{user.firstName} {user.lastName}</span>
                  </label>
                ))}
              </div>
            </div>
            <button onClick={handleAddProject} className="w-full bg-orange-500 text-white mt-4 py-2 rounded-lg">
              Add
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Project;

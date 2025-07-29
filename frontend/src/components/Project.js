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
  const [users, setUsers] = useState([]);
  const [filterType, setFilterType] = useState("");
  const [editingProjectId, setEditingProjectId] = useState(null);

  // Fetch users with auth token
  useEffect(() => {
    const fetchUsers = async () => {
      const token = localStorage.getItem("token");
      try {
        const response = await axios.get("http://localhost:5000/api/auth/users", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
  
        // Filter users based on allowed roles
        const allowedRoles = ["inventory manager", "finance", "marketing", "manager"];
        const filteredUsers = response.data.filter(user => allowedRoles.includes(user.role));
  
        setUsers(filteredUsers);
      } catch (error) {
        console.error("Error fetching users:", error);
      }
    };
  
    fetchUsers();
  }, []);
  

  // Fetch projects with populated team members
  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const response = await axios.get("http://localhost:5000/api/projects");
        console.log("Fetched projects:", response.data); // Debug log
        setProjects(response.data);
      } catch (error) {
        console.error("Error fetching projects:", error);
      }
    };

    fetchProjects();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setNewProject({ ...newProject, [name]: value });
  };

  const handleCheckboxChange = (memberId) => {
    setNewProject((prev) => ({
      ...prev,
      teamMembers: prev.teamMembers.includes(memberId)
        ? prev.teamMembers.filter((m) => m !== memberId)
        : [...prev.teamMembers, memberId],
    }));
  };

  const handleAddProject = async () => {
    try {
      const response = await axios.post("http://localhost:5000/api/projects", newProject);
      // Fetch projects again to get the populated data
      const updatedProjects = await axios.get("http://localhost:5000/api/projects");
      setProjects(updatedProjects.data);
      setShowModal(false);
      setNewProject({
        title: "",
        startDate: "",
        endDate: "",
        description: "",
        teamMembers: [],
      });
    } catch (error) {
      console.error("Error adding project:", error);
    }
  };

  const handleDeleteProject = async (id) => {
    try {
      await axios.delete(`http://localhost:5000/api/projects/${id}`);
      setProjects(projects.filter((project) => project._id !== id));
    } catch (error) {
      console.error("Error deleting project:", error);
    }
  };

  const handleUpdateProject = async () => {
    if (!editingProjectId) return;

    try {
      await axios.put(`http://localhost:5000/api/projects/${editingProjectId}`, newProject);
      // Fetch projects again to get the populated data
      const updatedProjects = await axios.get("http://localhost:5000/api/projects");
      setProjects(updatedProjects.data);
      setShowModal(false);
      setNewProject({
        title: "",
        type: "",
        startDate: "",
        endDate: "",
        description: "",
        teamMembers: [],
      });
      setEditingProjectId(null);
    } catch (error) {
      console.error("Error updating project:", error);
    }
  };

  const openEditModal = (project) => {
    setNewProject({
      title: project.title,
      type: project.type,
      startDate: project.startDate,
      endDate: project.endDate,
      description: project.description,
      teamMembers: project.teamMembers.map(member => member._id),
    });
    setEditingProjectId(project._id);
    setShowModal(true);
  };

  return (
    <div className="container mx-auto p-8">
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

        <select
          onChange={(e) => setFilterType(e.target.value)}
          value={filterType}
          className="bg-gray-200 px-4 py-2 rounded-lg"
        >
          <option value="">Filter</option>
          <option value="Ongoing">Ongoing</option>
          <option value="Completed">Completed</option>
          <option value="Todo">Todo</option>
        </select>

        <button
          onClick={() => {
            setEditingProjectId(null);
            setShowModal(true);
          }}
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
                <div className="flex flex-wrap gap-2 mt-1">
                  {Array.isArray(project.teamMembers) && project.teamMembers.map((member) => (
                    <span key={member._id} className="bg-gray-100 px-2 py-1 rounded text-sm">
                      {`${member.firstName || ''} ${member.lastName || ''}`}
                      {(!member.firstName && !member.lastName) && member.email}
                    </span>
                  ))}
                </div>
              </div>
              <div className="mt-4 flex space-x-4">
                <button
                  className="bg-orange-500 text-white px-4 py-2 rounded-lg"
                  onClick={() => openEditModal(project)}
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

      {/* Modal for Adding/Editing Project */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center">
          <div className="bg-white p-6 rounded-lg shadow-lg w-96">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-bold">{editingProjectId ? "Edit Project" : "Add Project"}</h2>
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
            <select
              name="type"
              value={newProject.type}
              onChange={handleChange}
              className="w-full border rounded p-2 mt-4"
            >
              <option value="">Select Type</option>
              <option value="Ongoing">Ongoing</option>
              <option value="Completed">Completed</option>
              <option value="Todo">Todo</option>
            </select>
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
              <div className="flex flex-col mt-2 max-h-40 overflow-y-auto">
                {users.map((user) => (
                  <label key={user._id} className="flex items-center space-x-2 p-1 hover:bg-gray-100">
                    <input
                      type="checkbox"
                      checked={newProject.teamMembers.includes(user._id)}
                      onChange={() => handleCheckboxChange(user._id)}
                    />
                    <span>{`${user.firstName || ''} ${user.lastName || ''} (${user.role})`}</span>
                  </label>
                ))}
              </div>
            </div>
            <button
              onClick={editingProjectId ? handleUpdateProject : handleAddProject}
              className="w-full bg-orange-500 text-white mt-4 py-2 rounded-lg"
            >
              {editingProjectId ? "Update" : "Add"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Project;
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { ClipboardCheck, Users, FolderGit2, Activity } from 'lucide-react';

const getAuthToken = () => localStorage.getItem("token");

const getHeaders = () => {
  const token = getAuthToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
};

const ProjectDashboard = () => {
  const [projects, setProjects] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const itemsPerPage = 4;

  useEffect(() => {
    const currentUser = JSON.parse(localStorage.getItem("currentUser")) || null;
    if (!currentUser) {
      setError("User not authenticated");
      setLoading(false);
      return;
    }
    const teamMemberId = currentUser._id;

    const fetchProjects = async () => {
      try {
        setLoading(true);
        const response = await axios.get(
          `http://localhost:5000/api/projects/team-member/${teamMemberId}`,
          { headers: getHeaders() }
        );
        setProjects(response.data);
        setError(null);
      } catch (error) {
        console.error("Error fetching projects:", error);
        setError("Failed to fetch projects. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchProjects();
  }, []);

  const getStatusColor = (type) => {
    const colors = {
      'Ongoing': 'bg-blue-100 text-blue-600',
      'Todo': 'bg-orange-100 text-orange-600',
      'Completed': 'bg-green-100 text-green-600'
    };
    return colors[type] || 'bg-gray-100 text-gray-600';
  };

  // Calculate statistics based on filtered projects
  const stats = [
    {
      icon: ClipboardCheck,
      count: `${projects.filter(p => p.type === 'Completed').length} Projects`,
      label: 'Completed',
      color: 'bg-yellow-50'
    },
    {
      icon: Users,
      count: `${projects.filter(p => p.type === 'Todo').length} Projects`,
      label: 'To Do',
      color: 'bg-blue-50'
    },
    {
      icon: FolderGit2,
      count: `${projects.filter(p => p.type === 'Ongoing').length} Projects`,
      label: 'Ongoing Projects',
      color: 'bg-red-50'
    },
    {
      icon: Activity,
      count: `${projects.length} Projects`,
      label: 'Total Projects',
      color: 'bg-cyan-50'
    }
  ];

  // Pagination logic
  const totalPages = Math.ceil(projects.length / itemsPerPage);
  const currentProjects = projects.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 text-red-600 bg-red-50 rounded-xl">
        {error}
      </div>
    );
  }


  return (
    <div className="p-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        {stats.map((stat, index) => (
          <div key={index} className="flex items-center p-4 bg-white rounded-xl shadow-sm">
            <div className={`${stat.color} p-3 rounded-lg mr-4`}>
              <stat.icon className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-semibold text-lg">{stat.count}</h3>
              <p className="text-gray-500 text-sm">{stat.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Project List */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr className="text-left">
                <th className="px-6 py-3 text-gray-500">Title</th>
                <th className="px-6 py-3 text-gray-500">Type</th>
                <th className="px-6 py-3 text-gray-500">Description</th>
                <th className="px-6 py-3 text-gray-500">Start Date</th>
                <th className="px-6 py-3 text-gray-500">End Date</th>
                <th className="px-6 py-3 text-gray-500">Team Size</th>
                <th className="px-6 py-3 text-gray-500"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {currentProjects.map((project) => (
                <tr key={project._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">{project.title}</td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 rounded-full text-sm ${getStatusColor(project.type)}`}>
                      {project.type}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    {project.description.length > 50 
                      ? `${project.description.substring(0, 50)}...` 
                      : project.description}
                  </td>
                  <td className="px-6 py-4">
                    {new Date(project.startDate).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4">
                    {new Date(project.endDate).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4">
                    {project.teamMembers.length} members
                  </td>
                  <td className="px-6 py-4">
                    <button className="text-blue-600 hover:text-blue-800 font-medium">
                      View
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-end px-6 py-3 border-t">
          <div className="flex items-center gap-2">
            <button 
              className="text-green-600 hover:text-green-800 disabled:text-gray-400" 
              onClick={() => setCurrentPage(prev => prev - 1)} 
              disabled={currentPage === 1}
            >
              Previous
            </button>
            <div className="flex gap-1">
              {Array.from({ length: totalPages }, (_, index) => (
                <button
                  key={index}
                  className={`w-8 h-8 flex items-center justify-center rounded ${
                    currentPage === index + 1 ? 'bg-green-600 text-white' : 'hover:bg-gray-100'
                  }`}
                  onClick={() => setCurrentPage(index + 1)}
                >
                  {index + 1}
                </button>
              ))}
            </div>
            <button 
              className="text-green-600 hover:text-green-800 disabled:text-gray-400" 
              onClick={() => setCurrentPage(prev => prev + 1)} 
              disabled={currentPage === totalPages}
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProjectDashboard;
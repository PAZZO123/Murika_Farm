import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { ClipboardCheck, Users, FolderGit2, Activity, X } from 'lucide-react';
import { Bar, Pie } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement } from 'chart.js';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import html2canvas from 'html2canvas';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement);

const getAuthToken = () => localStorage.getItem("token");

const getHeaders = () => {
  const token = getAuthToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
};

const ProjectTask = () => {
  const [projects, setProjects] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedProject, setSelectedProject] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [projectDetails, setProjectDetails] = useState(null);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const itemsPerPage = 4;

  const barChartRef = useRef(null);
  const pieChartRef = useRef(null);
  const statsRef = useRef(null);

  useEffect(() => {
    const currentUser = JSON.parse(localStorage.getItem("currentUser")) || null;
    if (!currentUser) {
      setError("User not authenticated");
      setLoading(false);
      return;
    }

    const fetchProjects = async () => {
      try {
        setLoading(true);
        const response = await axios.get(
          `http://localhost:5000/api/projects/`,
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

  // Function to fetch project details by ID
  const fetchProjectDetails = async (projectId) => {
    try {
      setDetailsLoading(true);
      const response = await axios.get(
        `http://localhost:5000/api/projects/${projectId}`,
        { headers: getHeaders() }
      );
      setProjectDetails(response.data);
      setIsModalOpen(true);
    } catch (error) {
      console.error("Error fetching project details:", error);
      setError("Failed to fetch project details. Please try again later.");
    } finally {
      setDetailsLoading(false);
    }
  };

  const handleViewProject = (projectId) => {
    setSelectedProject(projectId);
    fetchProjectDetails(projectId);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setProjectDetails(null);
  };

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

  // Data for charts
  const chartData = {
    labels: ['Completed', 'To Do', 'Ongoing'],
    datasets: [
      {
        label: 'Projects',
        data: [
          projects.filter(p => p.type === 'Completed').length,
          projects.filter(p => p.type === 'Todo').length,
          projects.filter(p => p.type === 'Ongoing').length
        ],
        backgroundColor: ['#4CAF50', '#FF9800', '#2196F3'],
      },
    ],
  };

  const pieChartData = {
    labels: ['Completed', 'To Do', 'Ongoing'],
    datasets: [
      {
        data: [
          projects.filter(p => p.type === 'Completed').length,
          projects.filter(p => p.type === 'Todo').length,
          projects.filter(p => p.type === 'Ongoing').length
        ],
        backgroundColor: ['#4CAF50', '#FF9800', '#2196F3'],
      },
    ],
  };

  // Pagination logic
  const totalPages = Math.ceil(projects.length / itemsPerPage);
  const currentProjects = projects.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Function to download PDF with charts and stats
  const downloadPDF = async () => {
    const doc = new jsPDF('p', 'mm', 'a4');

    // Add title
    doc.setFontSize(20);
    doc.text("Projects Report", 10, 20);

    // Add stats section
    doc.setFontSize(12);
    doc.text("Statistics", 10, 40);
    const statsImage = await html2canvas(statsRef.current);
    doc.addImage(statsImage, 'PNG', 10, 50, 180, 50);

    // Add bar chart
    doc.text("Projects Status Bar Chart", 10, 120);
    const barChartImage = await html2canvas(barChartRef.current);
    doc.addImage(barChartImage, 'PNG', 10, 130, 180, 100);

    // Add pie chart
    doc.text("Projects Status Pie Chart", 10, 250);
    const pieChartImage = await html2canvas(pieChartRef.current);
    doc.addImage(pieChartImage, 'PNG', 10, 260, 180, 100);

    // Add project table
    doc.text("Project List", 10, 380);
    doc.autoTable({
      startY: 390,
      head: [['Title', 'Type', 'Description', 'Start Date', 'End Date', 'Team Size']],
      body: projects.map(project => [
        project.title,
        project.type,
        project.description.length > 50 ? `${project.description.substring(0, 50)}...` : project.description,
        new Date(project.startDate).toLocaleDateString(),
        new Date(project.endDate).toLocaleDateString(),
        project.teamMembers.length
      ]),
    });

    // Save the PDF
    doc.save("projects_report.pdf");
  };

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
      {/* Project Details Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center p-4 border-b">
              <h3 className="text-xl font-semibold">
                {detailsLoading ? 'Loading...' : projectDetails?.title || 'Project Details'}
              </h3>
              <button 
                onClick={closeModal}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            
            {detailsLoading ? (
              <div className="p-8 flex justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
              </div>
            ) : projectDetails ? (
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  <div>
                    <h4 className="text-sm font-medium text-gray-500">Project Type</h4>
                    <p className="mt-1">
                      <span className={`px-3 py-1 rounded-full text-sm ${getStatusColor(projectDetails.type)}`}>
                        {projectDetails.type}
                      </span>
                    </p>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-gray-500">Duration</h4>
                    <p className="mt-1">
                      {new Date(projectDetails.startDate).toLocaleDateString()} - {new Date(projectDetails.endDate).toLocaleDateString()}
                    </p>
                  </div>
                </div>

                <div className="mb-6">
                  <h4 className="text-sm font-medium text-gray-500">Description</h4>
                  <p className="mt-1 text-gray-800">{projectDetails.description}</p>
                </div>

                <div>
                  <h4 className="text-sm font-medium text-gray-500 mb-3">Team Members ({projectDetails.teamMembers.length})</h4>
                  <div className="space-y-3">
                    {projectDetails.teamMembers.map((member, index) => (
                      <div key={index} className="flex items-center p-3 bg-gray-50 rounded-lg">
                        <div className="bg-blue-100 text-blue-600 rounded-full w-10 h-10 flex items-center justify-center mr-3">
                          {member.firstName.charAt(0)}{member.lastName.charAt(0)}
                        </div>
                        <div>
                          <p className="font-medium">{member.firstName} {member.lastName}</p>
                          <p className="text-sm text-gray-500">{member.email}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-6 text-red-500">Failed to load project details</div>
            )}
          </div>
        </div>
      )}

      {/* Stats Grid */}
      <div ref={statsRef} className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
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

      {/* Charts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
        <div ref={barChartRef} className="bg-white p-4 rounded-xl shadow-sm">
          <h3 className="text-lg font-semibold mb-4">Projects Status Bar Chart</h3>
          <Bar data={chartData} />
        </div>
        <div ref={pieChartRef} className="bg-white p-4 rounded-xl shadow-sm">
          <h3 className="text-lg font-semibold mb-4">Projects Status Pie Chart</h3>
          <Pie data={pieChartData} />
        </div>
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
                    <button 
                      onClick={() => handleViewProject(project._id)}
                      className="text-blue-600 hover:text-blue-800 font-medium py-1 px-3 rounded-full border border-gray-400"
                    >
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

      {/* Download PDF Button */}
      <div className="mt-8">
        <button 
          onClick={downloadPDF} 
          className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
        >
          Download PDF Report
        </button>
      </div>
    </div>
  );
};

export default ProjectTask;
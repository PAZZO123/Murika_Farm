import React, { useState } from 'react';
import { ClipboardCheck, Users, FolderGit2, Activity } from 'lucide-react';

const Task = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 4; // Default items per page

  // Sample tasks data
  const tasks = [
    { id: '01', assignee: 'SHYAKA Don', status: 'In-Progress', project: 'Techzis', date: '28 August 2024 8:00 AM', progress: '25%' },
    { id: '02', assignee: 'SHYAKA Don', status: 'Pending', project: 'Unipak', date: '28 August 2024 8:00 AM', progress: '25%' },
    { id: '03', assignee: 'SHYAKA Don', status: 'Completed', project: 'Tentekere National', date: '28 August 2024 8:00 AM', progress: '30%' },
    { id: '04', assignee: 'SHYAKA Don', status: 'In-Review', project: 'Amara', date: '28 August 2024 8:00 AM', progress: '30%' },
    { id: '05', assignee: 'SHYAKA Don', status: 'Done', project: 'Wordpress', date: '28 August 2024 8:00 AM', progress: '25%' },
    { id: '06', assignee: 'SHYAKA Don', status: 'Done', project: 'Techzis', date: '28 August 2024 8:00 AM', progress: '35%' },
    { id: '07', assignee: 'SHYAKA Don', status: 'In-Review', project: 'Techzis', date: '28 August 2024 8:00 AM', progress: '30%' },
    { id: '08', assignee: 'SHYAKA Don', status: 'Done', project: 'Techzis', date: '28 August 2024 8:00 AM', progress: '30%' }
  ];

  const getStatusColor = (status) => {
    const colors = {
      'In-Progress': 'bg-blue-100 text-blue-600',
      'Pending': 'bg-orange-100 text-orange-600',
      'Completed': 'bg-green-100 text-green-600',
      'In-Review': 'bg-purple-100 text-purple-600',
      'Done': 'bg-gray-100 text-gray-600'
    };
    return colors[status] || 'bg-gray-100 text-gray-600';
  };

  const stats = [
    { icon: ClipboardCheck, count: '15 Tasks', label: 'Completed', color: 'bg-yellow-50' },
    { icon: Users, count: '20 Tasks', label: 'To Do', color: 'bg-blue-50' },
    { icon: FolderGit2, count: '3 Projects', label: 'Ongoing Projects', color: 'bg-red-50' },
    { icon: Activity, count: '28 Tasks', label: 'Total Tasks', color: 'bg-cyan-50' }
  ];

  // Calculate total pages
  const totalPages = Math.ceil(tasks.length / itemsPerPage);

  // Get current tasks based on the current page
  const currentTasks = tasks.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const handleNext = () => {
    if (currentPage < totalPages) {
      setCurrentPage(prev => prev + 1);
    }
  };

  const handlePrevious = () => {
    if (currentPage > 1) {
      setCurrentPage(prev => prev - 1);
    }
  };

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

      {/* Task List */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr className="text-left">
                <th className="px-6 py-3 text-gray-500">No</th>
                <th className="px-6 py-3 text-gray-500">Cancel</th>
                <th className="px-6 py-3 text-gray-500">Status</th>
                <th className="px-6 py-3 text-gray-500">Project</th>
                <th className="px-6 py-3 text-gray-500">Due date</th>
                <th className="px-6 py-3 text-gray-500">Progress</th>
                <th className="px-6 py-3 text-gray-500"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {currentTasks.map((task) => (
                <tr key={task.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">{task.id}</td>
                  <td className="px-6 py-4">{task.assignee}</td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 rounded-full text-sm ${getStatusColor(task.status)}`}>
                      {task.status}
                    </span>
                  </td>
                  <td className="px-6 py-4">{task.project}</td>
                  <td className="px-6 py-4">{task.date}</td>
                  <td className="px-6 py-4">{task.progress}</td>
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
              className="text-green-600 hover:text-green-800" 
              onClick={handlePrevious} 
              disabled={currentPage === 1}
            >
              Previous
            </button>
            <div className="flex gap-1">
              {Array.from({ length: totalPages }, (_, index) => (
                <button
                  key={index}
                  className={`w-8 h-8 flex items-center justify-center rounded ${currentPage === index + 1 ? 'bg-green-600 text-white' : 'hover:bg-gray-100'}`}
                  onClick={() => setCurrentPage(index + 1)}
                >
                  {index + 1}
                </button>
              ))}
            </div>
            <button 
              className="text-green-600 hover:text-green-800" 
              onClick={handleNext} 
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

export default Task;
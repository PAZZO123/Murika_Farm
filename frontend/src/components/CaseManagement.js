import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import logo from '../Assets/unicef_logo.png';
import { EyeIcon, TrashIcon } from '@heroicons/react/solid';

const CaseManagement = () => {
  const [caseReports, setCaseReports] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage] = useState(8);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortOption, setSortOption] = useState('Newest');
  const token = localStorage.getItem('token');

  const BASE_URL = 'http://localhost:5000/api';

  const fetchCaseReports = async () => {
    try {
      const response = await axios.get(`${BASE_URL}/reports`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setCaseReports(response.data);
    } catch (error) {
      if (error.response && error.response.status === 404) {
        console.error('No case reports found');
        setCaseReports([]); 
      } else {
        console.error('Error fetching case reports:', error.message);
      }
    }
  };
  

  useEffect(() => {
    fetchCaseReports();
  }, []);

  const handleStatusUpdate = async (id, currentStatus) => {
    const newStatus = currentStatus === 'pending' ? 'reported' : 'pending';
    await axios.put(`${BASE_URL}/reports/${id}`, { status: newStatus }, {
      headers: { Authorization: `Bearer ${token}` },
    });
    fetchCaseReports();
  };

  const handleDelete = async (id) => {
    await axios.delete(`${BASE_URL}/reports/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    fetchCaseReports();
  };

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };

  const handleSortChange = (e) => {
    setSortOption(e.target.value);
    setCurrentPage(1);
  };

  const handleDownloadPDF = () => {
    const doc = new jsPDF();

    // Add Title and Logo
    doc.setFontSize(18);
    doc.text('Case Management Report', 14, 20);
    doc.addImage(logo, 'PNG', 150, 10, 40, 20); // Adjust size and position as needed
    doc.setFontSize(14);
    doc.text('Child Right Advocacy', 60, 35);

    // Table Columns and Rows
    const columns = [
      'Child Name',
      'Child Age',
      'Type of Abuse',
      'Guardian Name',
      'Case Severity Level',
      'Status',
    ];

    const rows = caseReports.map(report => [
      report.abusedChildName,
      report.abusedChildAge,
      report.typeOfAbuse,
      report.guardianName,
      report.reportAs,
      report.status,
    ]);

    // Add Table
    doc.autoTable({
      startY: 40,
      head: [columns],
      body: rows,
    });

    // Save the PDF
    doc.save('Case_Management_Report.pdf');
  };

  const filteredReports = caseReports
    .filter(report =>
      report.abusedChildName.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => {
      if (sortOption === 'Newest') {
        return new Date(b.createdAt) - new Date(a.createdAt);
      } else {
        return new Date(a.createdAt) - new Date(b.createdAt);
      }
    });

  const indexOfLastRow = currentPage * rowsPerPage;
  const indexOfFirstRow = indexOfLastRow - rowsPerPage;
  const currentRows = filteredReports.slice(indexOfFirstRow, indexOfLastRow);
  const totalPages = Math.ceil(filteredReports.length / rowsPerPage);

  return (
    <div className="p-5 bg-gray-100" style={{ fontFamily: 'Roboto' }}>
      <div className="flex justify-center text-center mt-5 mb-3">
        <img src={logo} alt="UNICEF Logo" className="h-10" />
        <h1 className="text-4xl font-bold text-gray-800">
          Child Rights <span className="text-blue-400">ADVOCACY</span>
        </h1>
      </div>
      <div className="mt-8">
        <div className="flex justify-between items-center mt-4">
          <h2 className="text-2xl font-bold text-gray-800">Case Management</h2>
          <div className="relative">
            <input
              type="text"
              className="px-4 py-2 border rounded-md"
              placeholder="Search by Child Name"
              value={searchTerm}
              onChange={handleSearch}
            />
          </div>
          <div className="flex items-center">
            <span className="mr-2 text-gray-600">Sort by:</span>
            <select
              className="px-3 py-2 border rounded-md"
              value={sortOption}
              onChange={handleSortChange}
            >
              <option value="Newest">Newest</option>
              <option value="Oldest">Oldest</option>
            </select>
          </div>
        </div>

        <button
          onClick={handleDownloadPDF}
          className="bg-blue-500 text-white px-4 py-2 rounded mt-4"
        >
          Download PDF
        </button>

        <table className="min-w-full bg-white border border-gray-300 mt-4">
          <thead>
            <tr>
              <th className="py-2 border-b">Child Name</th>
              <th className="py-2 border-b">Child Age</th>
              <th className="py-2 border-b">Type of Abuse</th>
              <th className="py-2 border-b">Guardian Name</th>
              <th className="py-2 border-b">Case Severity Level</th>
              <th className="py-2 border-b">Status</th>
              <th className="py-2 border-b">Actions</th>
            </tr>
          </thead>
          <tbody>
            {currentRows.map(report => (
              <tr key={report._id}>
                <td className="py-2 border-b">{report.abusedChildName}</td>
                <td className="py-2 border-b">{report.abusedChildAge}</td>
                <td className="py-2 border-b">{report.typeOfAbuse}</td>
                <td className="py-2 border-b">{report.guardianName}</td>
                <td className="py-2 border-b">{report.reportAs}</td>
                <td className="py-2 border-b">
                  <button
                    onClick={() => handleStatusUpdate(report._id, report.status)}
                    className={`px-3 py-1 rounded ${
                      report.status === 'pending'
                        ? 'bg-yellow-500 text-white'
                        : 'bg-green-500 text-white'
                    }`}
                  >
                    {report.status}
                  </button>
                </td>
                <td className="py-2 border-b">
                  <button
                    className="text-blue-500 hover:text-blue-700 mr-2"
                  >
                    <EyeIcon className="h-5 w-5 inline" />
                  </button>
                  <button
                    onClick={() => handleDelete(report._id)}
                    className="text-red-500 hover:text-red-700"
                  >
                    <TrashIcon className="h-5 w-5 inline" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="flex justify-between mt-4">
          <button
            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
            className="border border-gray-300 px-4 py-2 rounded"
            disabled={currentPage === 1}
          >
            Previous
          </button>
          <span>
            Page {currentPage} of {totalPages}
          </span>
          <button
            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
            className="border border-gray-300 px-4 py-2 rounded"
            disabled={currentPage === totalPages}
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
};

export default CaseManagement;

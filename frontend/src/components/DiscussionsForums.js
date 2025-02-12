import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FaEdit, FaTrash } from 'react-icons/fa';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import logo from '../Assets/unicef_logo.png';

const DiscussionsForums = () => {
  const [discussions, setDiscussions] = useState([]);
  const [posts, setPosts] = useState([]);
  const [caseReports, setCaseReports] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState('Update');
  const [currentDiscussion, setCurrentDiscussion] = useState(null);
  const [currentPost, setCurrentPost] = useState(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [mediaType, setMediaType] = useState('');
  const [type, setType] = useState('All');
  const [discussionSort, setDiscussionSort] = useState('newest');
  const [postSort, setPostSort] = useState('newest');
  const [caseReportSort, setCaseReportSort] = useState('newest');

  const fetchDiscussions = async () => {
    try {
      const token = localStorage.getItem('token');
      const loggedInUser = JSON.parse(localStorage.getItem('loggedInUser'));
      if (!loggedInUser || !loggedInUser._id) return;
      const userId = loggedInUser._id;
      const response = await axios.get(`http://localhost:5000/api/discussions/user/${userId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setDiscussions(response.data);
    } catch (error) {
      console.error('Error fetching discussions:', error);
    }
  };

  const fetchPosts = async () => {
    try {
      const token = localStorage.getItem('token');
      const loggedInUser = JSON.parse(localStorage.getItem('loggedInUser'));
      if (!loggedInUser || !loggedInUser._id) return;
      const userId = loggedInUser._id;
      const response = await axios.get(`http://localhost:5000/api/posts/user/${userId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setPosts(response.data);
    } catch (error) {
      console.error('Error fetching posts:', error);
    }
  };

  const fetchCasereports = async () => {
    const loggedInUser = JSON.parse(localStorage.getItem('loggedInUser'));
    const token = localStorage.getItem('token');
     const BASE_URL = 'http://localhost:5000/api';
    if (!loggedInUser || !loggedInUser._id) {
      console.error("Logged in user information is missing or incomplete");
      return;
    }
    
    const userId = loggedInUser._id;

    try {
      const response = await axios.get(`${BASE_URL}/reports/${userId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setCaseReports(response.data);
    } catch (error) {
      console.error("Error fetching case reports:", error);
    }
  };
  useEffect(() => {
    fetchDiscussions();
    fetchPosts();
    fetchCasereports();
  }, []);

  const handleOpenDiscussionModal = (discussion) => {
    setModalMode('Update');
    setCurrentDiscussion(discussion);
    setTitle(discussion.title);
    setDescription(discussion.description);
    setShowModal(true);
  };

  const handleOpenPostModal = (post) => {
    setModalMode('Update');
    setCurrentPost(post);
    setTitle(post.title);
    setMediaType(post.mediaType);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
  };

  const updateDiscussion = async () => {
    try {
      const token = localStorage.getItem('token');
      const discussionData = { title, description };
      await axios.put(`http://localhost:5000/api/discussions/${currentDiscussion._id}`, discussionData, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchDiscussions();
      handleCloseModal();
    } catch (error) {
      console.error('Error updating discussion:', error);
    }
  };

  const updatePost = async () => {
    try {
      const token = localStorage.getItem('token');
      const postData = { title, mediaType };
      await axios.put(`http://localhost:5000/api/posts/${currentPost._id}`, postData, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchPosts();
      handleCloseModal();
    } catch (error) {
      console.error('Error updating post:', error);
    }
  };

  const deleteDiscussion = async (id) => {
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`http://localhost:5000/api/discussions/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchDiscussions();
    } catch (error) {
      console.error('Error deleting discussion:', error);
    }
  };

  const deletePost = async (id) => {
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`http://localhost:5000/api/posts/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchPosts();
    } catch (error) {
      console.error('Error deleting post:', error);
    }
  };

  const sortedDiscussions = discussions
    .filter((discussion) => type === 'All' || discussion.type === type)
    .sort((a, b) => (discussionSort === 'newest' ? new Date(b.createdAt) - new Date(a.createdAt) : new Date(a.createdAt) - new Date(b.createdAt)));

  const sortedPosts = posts.sort((a, b) =>
    postSort === 'newest' ? new Date(b.createdAt) - new Date(a.createdAt) : new Date(a.createdAt) - new Date(b.createdAt)
  );

  const sortedCaseReports = caseReports.sort((a, b) =>
    caseReportSort === 'newest' ? new Date(b.createdAt) - new Date(a.createdAt) : new Date(a.createdAt) - new Date(b.createdAt)
  );
  const generatePDF = () => {
    const content = document.getElementById('content-to-pdf'); // Specify the container ID
    html2canvas(content).then((canvas) => {
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save('Discussions_Forums.pdf');
    });
  };

  return (
    <div  id="content-to-pdf" className="min-h-screen bg-white" style={{ fontFamily: 'roboto' }} >
      <div className="flex justify-center text-center m-3">
        <img src={logo} alt="UNICEF Logo" className="h-10" />
        <h1 className="text-4xl font-bold text-gray-800">
          Child Rights <span className="text-blue-400">ADVOCACY</span>
        </h1>
      </div>
      <div className="flex justify-center mt-4">
        <button
          onClick={generatePDF}
          className="bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-700 transition duration-200"
        >
          Download as PDF
        </button>
      </div>

      <div className="px-10 py-6">
        <h2 className="text-xl font-bold text-gray-800 text-center mb-10">DISCUSSIONS</h2>
        <div className="flex justify-between mb-4">
          <div>
            <label className="mr-2 font-semibold text-gray-700">Select Type:</label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value)}
              className="p-2 border border-gray-300 rounded"
            >
              <option value="All">All</option>
              <option value="Theme">Theme</option>
              <option value="Forum">Forum</option>
            </select>
          </div>
          <div>
            <label className="mr-2 font-semibold text-gray-700">Sort by:</label>
            <select
              value={discussionSort}
              onChange={(e) => setDiscussionSort(e.target.value)}
              className="p-2 border border-gray-300 rounded"
            >
              <option value="newest">Newest</option>
              <option value="oldest">Oldest</option>
            </select>
          </div>
        </div>

        <table className="min-w-full bg-white shadow-md rounded-lg overflow-hidden mb-8">
          <thead>
            <tr className="bg-gray-800 text-white text-left">
              <th className="py-3 px-4">Title</th>
              <th className="py-3 px-4">Type</th>
              <th className="py-3 px-4">Date</th>
              <th className="py-3 px-4">Attendees</th>
              <th className="py-3 px-4">Actions</th>
            </tr>
          </thead>
          <tbody>
            {sortedDiscussions.map((discussion) => (
              <tr key={discussion._id} className="border-t hover:bg-gray-100 transition duration-150 ease-in-out">
                <td className="py-3 px-4">{discussion.title}</td>
                <td className="py-3 px-4">{discussion.type}</td>
                <td className="py-3 px-4">{new Date(discussion.createdAt).toLocaleString()}</td>
                <td className="py-3 px-4">{discussion.attendees.length}</td>
                <td className="py-3 px-4 flex space-x-4">
                  <button
                    onClick={() => handleOpenDiscussionModal(discussion)}
                    className="text-blue-500 hover:text-blue-700"
                  >
                    <FaEdit />
                  </button>
                  <button
                    onClick={() => deleteDiscussion(discussion._id)}
                    className="text-red-500 hover:text-red-700"
                  >
                    <FaTrash />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <h2 className="text-xl font-bold text-gray-800 text-center mb-10">POSTS</h2>
        <div className="flex justify-end mb-4">
          <div>
            <label className="mr-2 font-semibold text-gray-700">Sort by:</label>
            <select
              value={postSort}
              onChange={(e) => setPostSort(e.target.value)}
              className="p-2 border border-gray-300 rounded"
            >
              <option value="newest">Newest</option>
              <option value="oldest">Oldest</option>
            </select>
          </div>
        </div>

        <table className="min-w-full bg-white shadow-md rounded-lg overflow-hidden mb-8">
          <thead>
            <tr className="bg-gray-800 text-white text-left">
              <th className="py-3 px-4">Title</th>
              <th className="py-3 px-4">Media Type</th>
              <th className="py-3 px-4">Date</th>
              <th className="py-3 px-4">Actions</th>
            </tr>
          </thead>
          <tbody>
            {posts.map((post) => (
              <tr key={post._id} className="border-t hover:bg-gray-100 transition duration-150 ease-in-out">
                <td className="py-3 px-4">{post.content}</td>
                <td className="py-3 px-4">{post.mediaType}</td>
                <td className="py-3 px-4">{post.likes.length}</td>
                <td className="py-3 px-4">{post.comments.length}</td>
                <td className="py-3 px-4 flex space-x-4">
                  <button onClick={() => handleOpenPostModal(post)} className="text-blue-500 hover:text-blue-700">
                    <FaEdit />
                  </button>
                  <button onClick={() => deletePost(post._id)} className="text-red-500 hover:text-red-700">
                    <FaTrash />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <h2 className="text-xl font-bold text-gray-800 text-center mb-10">CASE REPORTS</h2>
        <div className="flex justify-end mb-4">
          <div>
            <label className="mr-2 font-semibold text-gray-700">Sort by:</label>
            <select
              value={caseReportSort}
              onChange={(e) => setCaseReportSort(e.target.value)}
              className="p-2 border border-gray-300 rounded"
            >
              <option value="newest">Newest</option>
              <option value="oldest">Oldest</option>
            </select>
          </div>
        </div>

        <table className="min-w-full bg-white shadow-md rounded-lg overflow-hidden">
          <thead>
             <tr>
              <th className="py-2 border-b">Child Name</th>
              <th className="py-2 border-b">Child Age</th>
              <th className="py-2 border-b">Type of Abuse</th>
              <th className="py-2 border-b">Guardian Name</th>
              <th className="py-2 border-b">Case Severity Level</th>
              <th className="py-2 border-b">Status</th>
            </tr>
          </thead>
          <tbody>
            {sortedCaseReports.map((caseReport) => (
              <tr key={caseReport._id} className="border-t hover:bg-gray-100 transition duration-150 ease-in-out">
                <td className="py-2 border-b">{caseReport.abusedChildName}</td>
                <td className="py-2 border-b">{caseReport.abusedChildAge}</td>
                <td className="py-2 border-b">{caseReport.typeOfAbuse}</td>
                <td className="py-2 border-b">{caseReport.guardianName}</td>
                <td className="py-2 border-b">{caseReport.reportAs}</td>
                <td className="py-2 border-b">
                  <button
                   
                    className={`px-3 py-1 rounded ${
                      caseReport.status === 'pending'
                        ? 'bg-yellow-500 text-white'
                        : 'bg-green-500 text-white'
                    }`}
                  >
                    {caseReport.status}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default DiscussionsForums;

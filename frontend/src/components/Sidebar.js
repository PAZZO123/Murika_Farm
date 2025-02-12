import React, { useEffect, useState } from 'react';
import { 
  FaHome, FaReceipt, FaUserTie, FaEnvelope, FaPlus,
  FaSignOutAlt, FaUser, FaComments, FaFileAlt, FaGavel, FaBullhorn,FaFileContract 
} from 'react-icons/fa';
import { Link, useNavigate } from 'react-router-dom';

const Sidebar = ({ onClose }) => {
  const navigate = useNavigate();
  const [userRole, setUserRole] = useState(null);
  const [activeItem, setActiveItem] = useState('/dashboard/postfeed');
  const loggedInUser = JSON.parse(localStorage.getItem('loggedInUser'));

  useEffect(() => {
    const fetchUserRole = () => {
      const loggedInUser = JSON.parse(localStorage.getItem('loggedInUser'));
      if (loggedInUser) {
        setUserRole(loggedInUser.role);
      }
    };
    fetchUserRole();
  }, []);

  const handleItemClick = (path) => {
    setActiveItem(path);
    navigate(path);
    onClose();
  };

  const handleLogout = () => {
    navigate('/join');
  };

  return (
    <div className="fixed top-0 bottom-0 left-0 w-50 bg-gradient-to-r from-blue-600  to-blue-500 text-white shadow-lg z-50" style={{ fontFamily: 'roboto' }}>
      {/* User Info Section */}
      <div className="flex p-3 bg-gradient-to-r from-blue-600  to-blue-500  to-gray-950 text-white text-center">
        <div className="bg-gray-300 rounded-full w-30 h-9 flex items-center justify-center">
          <FaUser className="text-gray-700 text-xl mx-2" />
        </div>
        <div>
          <span className="font-semibold block">{loggedInUser?.username}</span>
          <span className="text-sm block">{loggedInUser?.email}</span>
        </div>
      </div>

      {/* Navigation Links */}
      <nav className="mt-1">
        {userRole === 'USER' && (
          <>
            <Link
              to="/dashboard/postfeed"
              onClick={() => handleItemClick('/dashboard/postfeed')}
              className={`flex items-center p-3 mb-1 rounded-md ${
                activeItem === '/dashboard/postfeed' ? 'bg-blue-700 text-white' : 'text-white hover:bg-blue-500'
              } transition duration-150`}
            >
              <FaHome className="mr-3" />
              Home
            </Link>
            <Link
              to="/dashboard/profile"
              onClick={() => handleItemClick('/dashboard/profile')}
              className={`flex items-center p-3 mb-1 rounded-md ${
                activeItem === '/dashboard/profile' ? 'bg-blue-700 text-white' : 'text-white hover:bg-blue-500'
              } transition duration-150`}
            >
              <FaUserTie className="mr-3" />
              Profile
            </Link>
            <Link
              to="/dashboard/legaldoc"
              onClick={() => handleItemClick('/dashboard/legaldoc')}
              className={`flex items-center p-3 mb-1 rounded-md ${
                activeItem === '/dashboard/legaldoc' ? 'bg-blue-700 text-white' : 'text-white hover:bg-blue-500'
              } transition duration-150`}
            >
              <FaFileContract className="mr-3" />
              Legal Documents
            </Link>
            <Link
              to="/dashboard/message"
              onClick={() => handleItemClick('/dashboard/message')}
              className={`flex items-center p-3 mb-1 rounded-md ${
                activeItem === '/dashboard/message' ? 'bg-blue-700 text-white' : 'text-white hover:bg-blue-500'
              } transition duration-150`}
            >
              <FaEnvelope className="mr-3" />
              Messages
            </Link>
            <Link
              to="/dashboard/discussions"
              onClick={() => handleItemClick('/dashboard/discussions')}
              className={`flex items-center p-3 mb-1 rounded-md ${
                activeItem === '/dashboard/discussions' ? 'bg-blue-700 text-white' : 'text-white hover:bg-blue-500'
              } transition duration-150`}
            >
              <FaComments className="mr-3" />
              Discussions
            </Link>
            <Link
              to="/dashboard/resources"
              onClick={() => handleItemClick('/dashboard/resources')}
              className={`flex items-center p-3 mb-1 rounded-md ${
                activeItem === '/dashboard/resources' ? 'bg-blue-700 text-white' : 'text-white hover:bg-blue-500'
              } transition duration-150`}
            >
              <FaFileAlt className="mr-3" />
              Resources
            </Link>
            <Link
              to="/dashboard/case"
              onClick={() => handleItemClick('/dashboard/case')}
              className={`flex items-center p-3 mb-21rounded-md ${
                activeItem === '/dashboard/case' ? 'bg-blue-700 text-white' : 'text-white hover:bg-blue-500'
              } transition duration-150`}
            >
              <FaGavel className="mr-3" />
              Cases
            </Link>
            <Link
              to="/dashboard/advocacy"
              onClick={() => handleItemClick('/dashboard/advocacy')}
              className={`flex items-center p-3 mb-1 rounded-md ${
                activeItem === '/dashboard/advocacy' ? 'bg-blue-700 text-white' : 'text-white hover:bg-blue-500'
              } transition duration-150`}
            >
              <FaBullhorn className="mr-3" />
              Campaigns
            </Link>
            <Link
              to="/dashboard/discussion"
              onClick={() => handleItemClick('/dashboard/discussion')}
              className={`flex items-center p-3 mb-2 rounded-md ${
                activeItem === '/dashboard/discussion' ? 'bg-blue-700 text-white' : 'text-white hover:bg-blue-500'
              } transition duration-150`}
            >
              <FaComments className="mr-3" />
              My Activities
            </Link>
          </>
        )}

        {userRole === 'ADMIN' && (
          <>
            <Link
              to="/dashboard/listuser"
              onClick={() => handleItemClick('/dashboard/listuser')}
              className={`flex items-center p-3 mb-2 rounded-md ${
                activeItem === '/dashboard/listuser' ? 'bg-blue-700 text-white' : 'text-white hover:bg-blue-500'
              } transition duration-150`}
            >
              <FaHome className="mr-3" />
              Manage Users
            </Link>
            <Link
              to="/dashboard/casema"
              onClick={() => handleItemClick('/dashboard/casema')}
              className={`flex items-center p-3 mb-2 rounded-md ${
                activeItem === '/dashboard/casema' ? 'bg-blue-700 text-white' : 'text-white hover:bg-blue-500'
              } transition duration-150`}
            >
              <FaGavel className="mr-3" />
              Case Management
            </Link>
            <Link
              to="/dashboard/resourcema"
              onClick={() => handleItemClick('/dashboard/resourcema')}
              className={`flex items-center p-3 mb-2 rounded-md ${
                activeItem === '/dashboard/resourcema' ? 'bg-blue-700 text-white' : 'text-white hover:bg-blue-500'
              } transition duration-150`}
            >
              <FaFileAlt className="mr-3" />
              Manage Resources
            </Link>
            <Link
              to="/dashboard/campaignm"
              onClick={() => handleItemClick('/dashboard/campaignm')}
              className={`flex items-center p-3 mb-2 rounded-md ${
                activeItem === '/dashboard/campaignm' ? 'bg-blue-700 text-white' : 'text-white hover:bg-blue-500'
              } transition duration-150`}
            >
              <FaBullhorn className="mr-3" />
              Campaigns
            </Link>
            <Link
              to="/dashboard/eventm"
              onClick={() => handleItemClick('/dashboard/eventm')}
              className={`flex items-center p-3 mb-2 rounded-md ${
                activeItem === '/dashboard/eventm' ? 'bg-blue-700 text-white' : 'text-white hover:bg-blue-500'
              } transition duration-150`}
            >
              <FaPlus className="mr-3" />
               Campaigns or events
            </Link>
            <Link
              to="/dashboard/stats"
              onClick={() => handleItemClick('/dashboard/stats')}
              className={`flex items-center p-3 mb-2 rounded-md ${
                activeItem === '/dashboard/stats' ? 'bg-blue-700 text-white' : 'text-white hover:bg-blue-500'
              } transition duration-150`}
            >
              <FaReceipt className="mr-3" />
              Statistics
            </Link>
          </>
        )}
      </nav>

      {/* Logout Section */}
      <div className="absolute bottom-0 left-0 w-full">
        <button
          onClick={handleLogout}
          className="flex items-center justify-center w-full p-3 text-white bg-gray-700 hover:bg-blue-800"
        >
          <FaSignOutAlt className="mr-3" />
          Logout
        </button>
      </div>
    </div>
  );
};

export default Sidebar;

import React, { useEffect, useState } from "react";
import { NavLink } from "react-router-dom";
import axios from "axios";
import logo from "../Assets/Logo.png";
import { FaChartBar, FaBoxes, FaCog, FaUsers, FaSignOutAlt } from "react-icons/fa";

const Lsidebar = () => {
  const [userRole, setUserRole] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const getAuthToken = () => {
    return localStorage.getItem('token');
  };

  const getHeaders = () => {
    const token = getAuthToken();
    return token ? { Authorization: `Bearer ${token}` } : {};
  };

  useEffect(() => {
    const fetchUserRole = () => {
      // Get current user from localStorage
      const currentUser = JSON.parse(localStorage.getItem('currentUser'));
      
      if (currentUser) {
        // If user is found, set the role
        const role = currentUser.role;
        setUserRole(role);
        console.log("User Role from localStorage:", role); // Log the role here
      } else {
        console.log("No currentUser found in localStorage.");
      }
      
      setLoading(false);
    };

    fetchUserRole();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('currentUser');  // Also remove currentUser during logout
    window.location.href = '/login';
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>{error}</div>;

  return (
    <div className="bg-white w-64 h-screen fixed flex flex-col border-r shadow-md">
      {/* Logo */}
      <div className="p-4 flex items-center justify-center border-b">
        <img src={logo} alt="Logo" className="h-10" />
      </div>

      {/* Navigation */}
      <nav className="flex-grow p-2">
        <ul className="space-y-2">
          {/* Items for Client role */}
          {userRole === "client" && (
            <>
              <SidebarItem to="/dashboard/clientoverview" icon={<FaChartBar />} label="Client Overview" />
              <SidebarItem to="/dashboard/clienttasks" icon={<FaCog />} label="Client Tasks" />
            </>
          )}

          {/* Items for Employee role */}
          {userRole === "employee" && (
            <>
              <SidebarItem to="/dashboard/stats" icon={<FaChartBar />} label="Overview" />
              <SidebarItem to="/dashboard/product" icon={<FaBoxes />} label="Inventory" />
              <SidebarItem to="/dashboard/chat" icon={<FaCog />} label="Chat" />
              <SidebarItem to="/dashboard/project" icon={<FaCog />} label="Project" />
              <SidebarItem to="/dashboard/task" icon={<FaCog />} label="Task" />
              <SidebarItem to="/dashboard/marketing" icon={<FaCog />} label="Marketing" />
              <SidebarItem to="/dashboard/settings" icon={<FaCog />} label="Settings" />
            </>
          )}

          {/* Items for Admin role */}
          {userRole === "admin" && (
            <>
              <SidebarItem to="/dashboard/listuser" icon={<FaUsers />} label="Manage Users" />
            </>
          )}
        </ul>
      </nav>

      {/* Logout Button */}
      <div className="p-2 border-t">
        <button onClick={handleLogout} className="w-full flex items-center justify-center bg-green-600 text-white p-3 rounded-md hover:bg-green-700">
          <FaSignOutAlt className="mr-2" /> Logout
        </button>
      </div>
    </div>
  );
};

const SidebarItem = ({ to, icon, label }) => {
  return (
    <li>
      <NavLink
        to={to}
        className="flex items-center space-x-3 text-gray-700 p-2 rounded-md hover:bg-gray-100"
        activeClassName="font-semibold text-green-600"
      >
        {icon} <span>{label}</span>
      </NavLink>
    </li>
  );
};

export default Lsidebar;

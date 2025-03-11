import React, { useEffect, useState } from "react";
import { NavLink } from "react-router-dom";
import logo from "../Assets/Logo.png";
import { 
  FaChartBar, FaBoxes, FaCog, FaUsers, FaSignOutAlt, 
  FaBriefcase, FaMoneyBillWave, FaBullhorn, FaTasks 
} from "react-icons/fa";

const Lsidebar = () => {
  const [userRole, setUserRole] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserRole = () => {
      const currentUser = JSON.parse(localStorage.getItem('currentUser'));
      if (currentUser) {
        setUserRole(currentUser.role);
        console.log("User Role:", currentUser.role);
      }
      setLoading(false);
    };

    fetchUserRole();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('currentUser');
    window.location.href = '/login';
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div className="bg-white w-64 h-screen fixed flex flex-col border-r shadow-md">
      {/* Logo */}
      <div className="p-4 flex items-center justify-center border-b">
        <img src={logo} alt="Logo" className="h-10" />
      </div>

      {/* Navigation */}
      <nav className="flex-grow p-2">
        <ul className="space-y-2">

          {/* Client Navigation */}
          {userRole === "client" && (
            <>
              <SidebarItem to="/dashboard/clientoverview" icon={<FaChartBar />} label="Client Overview" />
              <SidebarItem to="/dashboard/clienttasks" icon={<FaTasks />} label="Client Tasks" />
              <SidebarItem to="/dashboard/chat" icon={<FaCog />} label="Chat" />
            </>
          )}

          {/* Employee Navigation */}
          {userRole === "employee" && (
            <>
              <SidebarItem to="/dashboard/stats" icon={<FaChartBar />} label="Overview" />
              <SidebarItem to="/dashboard/product" icon={<FaBoxes />} label="Inventory" />
              <SidebarItem to="/dashboard/chat" icon={<FaCog />} label="Chat" />
              <SidebarItem to="/dashboard/task" icon={<FaTasks />} label="Task" />
              <SidebarItem to="/dashboard/settings" icon={<FaCog />} label="Settings" />
            </>
          )}

          {/* Admin Navigation */}
          {userRole === "admin" && (
            <>
              <SidebarItem to="/dashboard/listuser" icon={<FaUsers />} label="Manage Users" />
              <SidebarItem to="/dashboard/chat" icon={<FaCog />} label="Chat" />
              
            </>
          )}

          {/* Manager Navigation */}
          {userRole === "manager" && (
            <>
              <SidebarItem to="/dashboard/manageroverview" icon={<FaChartBar />} label="Manager Overview" />
              <SidebarItem to="/dashboard/project" icon={<FaBriefcase />} label="Manage Projects" />
              <SidebarItem to="/dashboard/task" icon={<FaTasks />} label="Task" />
              <SidebarItem to="/dashboard/chat" icon={<FaCog />} label="Chat" />
            </>
          )}

          {/* Finance Navigation */}
          {userRole === "finance" && (
            <>
              <SidebarItem to="/dashboard/financeoverview" icon={<FaChartBar />} label="Finance Overview" />
              <SidebarItem to="/dashboard/adminproduct" icon={<FaBoxes />} label="Products" />
              <SidebarItem to="/dashboard/task" icon={<FaTasks />} label="Task" />
              <SidebarItem to="/dashboard/chat" icon={<FaCog />} label="Chat" />
            </>
          )}

          {/* Marketing Navigation */}
          {userRole === "marketing" && (
            <>
              <SidebarItem to="/dashboard/marketingoverview" icon={<FaChartBar />} label="Marketing Overview" />
              <SidebarItem to="/dashboard/marketing" icon={<FaBullhorn />} label="Campaigns" />
              <SidebarItem to="/dashboard/chat" icon={<FaCog />} label="Chat" />
              <SidebarItem to="/dashboard/task" icon={<FaTasks />} label="Task" />
              <SidebarItem to="/dashboard/ads" icon={<FaBullhorn />} label="Ad Management" />
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

const SidebarItem = ({ to, icon, label }) => (
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

export default Lsidebar;

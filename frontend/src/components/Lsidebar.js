import React, { useEffect, useState } from "react";
import { NavLink } from "react-router-dom";
import logo from "../Assets/Logo.png";
import { getUnreadTotal } from "../socket";
import { 
  FaChartBar, FaBoxes, FaCog, FaUsers, FaSignOutAlt, 
  FaBriefcase, FaMoneyBillWave, FaBullhorn, FaTasks,
  FaCommentAlt, FaShoppingBag, FaUserCog, FaProjectDiagram,
  FaChartLine, FaAd, FaClipboardList, FaWarehouse
} from "react-icons/fa";

const Lsidebar = () => {
  const [userRole, setUserRole] = useState(null);
  const [loading, setLoading] = useState(true);
  const [chatUnread, setChatUnread] = useState(0);

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

    // Pick up any unread count already saved (e.g. after page refresh)
    setChatUnread(getUnreadTotal());

    const handleUnread = (e) => setChatUnread(e.detail?.total || 0);
    window.addEventListener('chat-unread-update', handleUnread);
    return () => window.removeEventListener('chat-unread-update', handleUnread);
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
          {userRole === "supplier" && (
            <>
              <SidebarItem to="/dashboard/clientoverview" icon={<FaChartLine />} label="Supplier Overview" />
              <SidebarItem to="/dashboard/usercampaign" icon={<FaBullhorn />} label="Campaigns" />
              <SidebarItem to="/dashboard/clienttasks" icon={<FaShoppingBag />} label="Add Product" />
              <SidebarItem to="/dashboard/products" icon={<FaBoxes />} label="My products" />
            </>
          )}

          {/* Employee Navigation */}
          {userRole === "inventory manager" && (
            <>
              <SidebarItem to="/dashboard/stats" icon={<FaChartBar />} label="Overview" />
              <SidebarItem to="/dashboard/product" icon={<FaBoxes />} label="Inventory" />
              <SidebarItem to="/dashboard/expenses" icon={<FaMoneyBillWave />} label="Expenses" />
              <SidebarItem to="/dashboard/chat" icon={<FaCommentAlt />} label="Chat" badge={chatUnread} />
              <SidebarItem to="/dashboard/task" icon={<FaClipboardList />} label="Task" />
            </>
          )}

          {/* Admin Navigation */}
          {userRole === "admin" && (
            <>
              <SidebarItem to="/dashboard/overview" icon={<FaChartLine />} label="Overview" />
              <SidebarItem to="/dashboard/listuser" icon={<FaUserCog />} label="Manage Users" />
              <SidebarItem to="/dashboard/chat" icon={<FaCommentAlt />} label="Chat" badge={chatUnread} />
            </>
          )}

          {/* Manager Navigation */}
          {userRole === "manager" && (
            <>
              <SidebarItem to="/dashboard/tasks" icon={<FaChartLine />} label="Manager Overview" />
              <SidebarItem to="/dashboard/project" icon={<FaProjectDiagram />} label="Manage Projects" />
              <SidebarItem to="/dashboard/task" icon={<FaClipboardList />} label="My Task" />
              <SidebarItem to="/dashboard/chat" icon={<FaCommentAlt />} label="Chat" badge={chatUnread} />
            </>
          )}

          {/* Finance Navigation */}
          {userRole === "finance" && (
            <>
              <SidebarItem to="/dashboard/adminproduct" icon={<FaWarehouse />} label="Finance Overview" />
              <SidebarItem to="/dashboard/task" icon={<FaClipboardList />} label="Task" />
              <SidebarItem to="/dashboard/chat" icon={<FaCommentAlt />} label="Chat" badge={chatUnread} />
            </>
          )}

          {/* Marketing Navigation */}
          {userRole === "marketing" && (
            <>
              <SidebarItem to="/dashboard/marketing" icon={<FaChartLine />} label="Marketing Overview" />
              <SidebarItem to="/dashboard/chat" icon={<FaCommentAlt />} label="Chat" badge={chatUnread} />
              <SidebarItem to="/dashboard/task" icon={<FaClipboardList />} label="Task" />
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

const SidebarItem = ({ to, icon, label, badge = 0 }) => (
  <li>
    <NavLink
      to={to}
      className="flex items-center space-x-3 text-gray-700 p-2 rounded-md hover:bg-gray-100"
      activeClassName="font-semibold text-green-600"
    >
      {icon}
      <span className="flex-1">{label}</span>
      {badge > 0 && (
        <span className="bg-green-600 text-white text-[10px] font-bold rounded-full
                         min-w-[18px] h-[18px] flex items-center justify-center px-1">
          {badge > 99 ? '99+' : badge}
        </span>
      )}
    </NavLink>
  </li>
);

export default Lsidebar;
import React from 'react';
import { NavLink } from 'react-router-dom';
import logo from '../Assets/Logo.png'; 
import { FaChartBar, FaFileInvoice, FaMoneyBill, FaBoxes, FaCog, FaSignOutAlt } from 'react-icons/fa';

const Lsidebar = () => {
  return (
    <div className="bg-white w-64 h-screen fixed flex flex-col border-r shadow-md">
      {/* Logo */}
      <div className="p-4 flex items-center justify-center border-b">
      <img src={logo} alt="UNICEF Logo" className="h-20" />
      </div>

      {/* Navigation */}
      <nav className="flex-grow p-4">
        <ul className="space-y-4">
          <SidebarItem to="/overview" icon={<FaChartBar />} label="Overview" />
          <SidebarItem to="/invoices" icon={<FaFileInvoice />} label="Invoices" />
          <SidebarItem to="/expenses" icon={<FaMoneyBill />} label="Expenses" />
          <SidebarItem to="/inventory" icon={<FaBoxes />} label="Inventory" />
          <SidebarItem to="/settings" icon={<FaCog />} label="Setting" />
        </ul>
      </nav>

      {/* Logout Button */}
      <div className="p-4 border-t">
        <button className="w-full flex items-center justify-center bg-green-600 text-white p-3 rounded-md hover:bg-green-700">
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

import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Lsidebar from './Lsidebar';

const DashboardLayout = () => {
  return (
    <div className="flex h-screen bg-gray-100" style={{ fontFamily: 'roboto' }}>
      {/* Sidebar */}
      <Lsidebar className='mr-5'/>
      
      {/* Main Content */}
      <div className="flex flex-col flex-grow">
        <div className="flex items-center justify-between bg-gray-200 p-3 shadow-sm">
          
          <div className="flex items-center space-x-4">
            <span className="text-sm font-semibold">MUNYESHYAKA Don</span>
            <span className="text-xs text-gray-500">Administrator</span>
          </div>
        </div>
        
        {/* Content Outlet */}
        <div className="flex-grow bg-white p-4 ml-52 ">
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default DashboardLayout;

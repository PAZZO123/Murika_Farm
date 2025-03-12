// client/src/App.js
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LandingPage from './components/LandingPage';
import Join from './components/Product';

import Signup from './components/Signup';

import Login from './components/Login';
import Sidebar from './components/Sidebar';
import DashboardLayout from './components/DashboardLayout'; 
import WelcomeUser from './components/WelcomeUser';
import UserManagement from './components/UserManagement';
import Statistics from './components/Statistics';
import Expenses from './components/Expenses';
import Invoice from './components/Invoice';
import Pay from './components/Pay';
import Marketing from './components/Marketing';
import Task from './components/Task';
import Tasks from './components/Tasks';
import Project from './components/Project';
import Expense from './components/Expense';
import Product from './components/Product'
import Chat from './components/Chat';
import ClientInformationForm from './components/ClientInformationForm';
import AdminProductDetails from './components/AdminProductDetails';
import AdminProductManagement from './components/AdminProductManagement';
import ClientOverview from './components/ClientOverview';
import UserCampaigns from './components/UserCampaigns';

function App() {
  return (
    <Router>
       <Routes>
          <Route  path="/" element={<LandingPage/>} ></Route>
          <Route  path="/landingpage" element={<LandingPage/>} ></Route>
          <Route  path="/signup" element={<Signup/>} ></Route>
          <Route  path="/sidebar" element={<Sidebar/>} ></Route>
      
          <Route  path="/login" element={<Login/>} ></Route>
        
      
          <Route  path="/dashboard" element={<DashboardLayout/>} >
          <Route  path="welcome" element={<WelcomeUser/>} />
          <Route  path="listuser" element={<UserManagement/>} />
          <Route  path="stats" element={<Statistics/>} />
          <Route  path="expenses" element={<Expenses/>} />
          <Route  path="invoice" element={<Invoice/>} />
          <Route  path="pay" element={<Pay/>} />
          <Route  path="marketing" element={<Marketing/>} />
          <Route  path="task" element={<Task/>} />
          <Route  path="tasks" element={<Tasks/>} />
          <Route  path="usercampaign" element={<UserCampaigns/>} />
          <Route  path="project" element={<Project/>} />
          <Route  path="expense" element={<Expense/>} />
          <Route  path="chat" element={<Chat/>} />
          <Route  path="product" element={<Product/>} /> 
          <Route  path="clienttasks" element={<ClientInformationForm/>} /> 
          <Route  path="clientproduct" element={<AdminProductDetails/>} /> 
          <Route  path="clientoverview" element={<ClientOverview/>} /> 
          <Route  path="adminproduct" element={<AdminProductManagement/>} /> 
          </Route> 
        </Routes>
    </Router>
  );
}

export default App;

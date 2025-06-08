import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Elements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import LandingPage from './components/LandingPage';
import Join from './components/ProductInventory';
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
import ExpenseRecorder from './components/ExpenseRecorder';
import Chat from './components/Chat';
import ClientInformationForm from './components/ClientInformationForm';
import AdminProductDetails from './components/AdminProductDetails';
import AdminProductManagement from './components/AdminProductManagement';
import ClientOverview from './components/ClientOverview';
import UserCampaigns from './components/UserCampaigns';
import ProductDetail from './components/ProductDetail';
import EditProduct from './components/EditProduct';
import ProductList from './components/ProductList';
import AdminDashboard from './components/AdminDashboard';
import ProductInventory from './components/ProductInventory';

// Initialize Stripe with your publishable key
const stripePromise = (async () => {
  try {
    const stripe = await loadStripe(
      process.env.REACT_APP_STRIPE_PUBLIC_KEY || 
      "pk_test_51RRrQyBTV48ydIXJiHcsoN1A3Ra9TUc0LFxcbMGuFl4A1I4Ag6lzjVI5gvQ12rvnj9y2fsdsdT1qNEHW0LbBQzIG00kFnztbyF"
    );
    if (!stripe) {
      throw new Error("Stripe failed to initialize");
    }
    return stripe;
  } catch (error) {
    console.error("Stripe initialization error:", error);
    return null;
  }
})();

function App() {
  return (
    <Elements stripe={stripePromise}>
      <Router>
        <Routes>
          <Route path="/" element={<LandingPage/>} />
          <Route path="/landingpage" element={<LandingPage/>} />
          <Route path="/signup" element={<Signup/>} />
          <Route path="/sidebar" element={<Sidebar/>} />
          <Route path="/login" element={<Login/>} />
          
          <Route path="/dashboard" element={<DashboardLayout/>}>
          <Route path="overview" element={<AdminDashboard />} />
            <Route path="welcome" element={<WelcomeUser/>} />
            <Route path="listuser" element={<UserManagement/>} />
            <Route path="stats" element={<Statistics/>} />
            <Route path="expenses" element={<ExpenseRecorder />} />
            <Route path="invoice" element={<Invoice/>} />
            <Route path="pay" element={<Pay/>} />
            <Route path="marketing" element={<Marketing/>} />
            <Route path="task" element={<Task/>} />
            <Route path="tasks" element={<Tasks/>} />
            <Route path="usercampaign" element={<UserCampaigns/>} />
            <Route path="project" element={<Project/>} />
           
            <Route path="chat" element={<Chat/>} />
            <Route path="product" element={<ProductInventory/>} /> 
            <Route path="clienttasks" element={<ClientInformationForm/>} /> 
            <Route path="products/:id" element={<ProductDetail />} />
            <Route path="products/edit/:id" element={<EditProduct />} />
            <Route path="products" element={<ProductList />} />
            <Route path="clientproduct" element={<AdminProductDetails/>} /> 
            <Route path="clientoverview" element={<ClientOverview/>} /> 
            <Route path="adminproduct" element={<AdminProductManagement/>} /> 
          </Route> 
        </Routes>
      </Router>
    </Elements>
  );
}

export default App;
import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { FaUsers, FaChartLine, FaProjectDiagram, FaBars, FaChartPie, FaBuilding, FaHandshake, FaMoneyBillWave } from 'react-icons/fa'; // Added FaMoneyBillWave
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

// --- Reusable Chart Component ---
const ChartComponent = ({ type, data }) => {
  if (!data || data.length === 0) {
    return <div className="text-center text-gray-500 py-10">No data available for this chart.</div>;
  }

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#A28DFF', '#E3A000', '#6A0DAD', '#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0'];

  switch (type) {
    case 'bar':
      return (
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="value" fill="#8884d8" name="Count" />
          </BarChart>
        </ResponsiveContainer>
      );
    case 'pie':
      return (
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              labelLine={false}
              outerRadius={80}
              fill="#8884d8"
              dataKey="value"
              nameKey="name"
              label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      );
    default:
      return <div className="text-center text-gray-500">No chart type specified</div>;
  }
};

// --- Dashboard Card Component ---
const DashboardCard = ({ title, value, icon, color }) => (
  <div className={`${color} text-white p-6 rounded-lg shadow-md flex items-center justify-between transition-transform transform hover:scale-105`}>
    <div>
      <h3 className="text-lg font-semibold">{title}</h3>
      <p className="text-4xl font-bold mt-2">{value.toLocaleString()}</p> {/* Added toLocaleString() for number formatting */}
    </div>
    <div className="text-5xl opacity-75">{icon}</div>
  </div>
);

// --- Chart Card Component ---
const ChartCard = ({ title, icon, children }) => (
  <div className="bg-white p-6 rounded-lg shadow-md">
    <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
      {icon} {title}
    </h3>
    {children}
  </div>
);

// --- Main Admin Dashboard Component ---
const AdminDashboard = () => {
  const [dashboardData, setDashboardData] = useState({
    totalUsers: 0,
    totalCampaigns: 0,
    totalCompanyProducts: 0,
    totalClientProducts: 0,
    totalExpenses: 0, // Added totalExpenses
    totalProjects: 0,
    userRoles: [],
    campaignStatus: [],
    companyProductCategories: [],
    clientProductStatuses: [],
    clientPaymentStatuses: [],
    expenseCategories: [], // Added expenseCategories
    projectStatus: [],
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const getAuthToken = useCallback(() => localStorage.getItem('token'), []);

  const getHeaders = useCallback(() => {
    const token = getAuthToken();
    return token ? { Authorization: `Bearer ${token}` } : {};
  }, [getAuthToken]);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        const headers = getHeaders();

        const [
          usersResponse,
          campaignsResponse,
          companyProductsResponse,
          clientProductsResponse,
          expensesResponse, // Added expensesResponse
          projectsResponse,
        ] = await Promise.all([
          axios.get("http://localhost:5000/api/auth/users", { headers }),
          axios.get("http://localhost:5000/api/campaigns", { headers }),
          axios.get("http://localhost:5000/api/products", { headers }), // Your inventory products
          axios.get("http://localhost:5000/api/clientproducts", { headers }), // Client-related products
          axios.get("http://localhost:5000/api/expenses", { headers }), // Fetch expenses
          axios.get("http://localhost:5000/api/projects", { headers }),
        ]);

        const users = Array.isArray(usersResponse.data) ? usersResponse.data : [];
        const campaigns = Array.isArray(campaignsResponse.data) ? campaignsResponse.data : [];
        const companyProducts = Array.isArray(companyProductsResponse.data) ? companyProductsResponse.data : [];
        const clientProducts = Array.isArray(clientProductsResponse.data) ? clientProductsResponse.data : [];
        // Assuming expenses API returns an array directly or under a 'expenses' key
        const expenses = Array.isArray(expensesResponse.data) ? expensesResponse.data : expensesResponse.data.expenses || [];
        const projects = Array.isArray(projectsResponse.data) ? projectsResponse.data : [];

        // Helper to aggregate data for charts
        const aggregateData = (data, key, defaultVal = 'Unknown') =>
          data.reduce((acc, item) => {
            const val = item[key] || defaultVal;
            acc[val] = (acc[val] || 0) + 1;
            return acc;
          }, {});

        // Helper to transform aggregated data to chart-friendly format
        const transformToChartData = (aggregatedData) =>
          Object.keys(aggregatedData).map((name) => ({
            name: name.charAt(0).toUpperCase() + name.slice(1),
            value: aggregatedData[name],
          }));

        // Calculate total expense amount
        const totalExpenseAmount = expenses.reduce((sum, exp) => sum + (exp.amount || 0), 0);

        setDashboardData({
          totalUsers: users.length,
          totalCampaigns: campaigns.length,
          totalCompanyProducts: companyProducts.length,
          totalClientProducts: clientProducts.length,
          totalExpenses: totalExpenseAmount, // Set total expenses amount
          totalProjects: projects.length,
          userRoles: transformToChartData(aggregateData(users, 'role')),
          campaignStatus: transformToChartData(aggregateData(campaigns, 'status', 'Active')),
          companyProductCategories: transformToChartData(aggregateData(companyProducts, 'category', 'Uncategorized')),
          clientProductStatuses: transformToChartData(aggregateData(clientProducts, 'status')),
          clientPaymentStatuses: transformToChartData(aggregateData(clientProducts, 'paymentStatus')),
          expenseCategories: transformToChartData(aggregateData(expenses, 'category', 'General')), // New: Expense Categories
          projectStatus: transformToChartData(aggregateData(projects, 'status', 'Pending')),
        });
      } catch (err) {
        if (axios.isAxiosError(err) && err.response?.status === 401) {
          alert("Session expired or unauthorized. Please sign in.");
          window.location.href = '/login';
        }
        setError("Failed to load dashboard data. Please try again.");
        console.error("Dashboard data fetch error:", err.response?.data || err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [getHeaders]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-100">
        <div className="text-lg font-semibold text-gray-700">Loading Dashboard...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-screen bg-red-100 text-red-700">
        <div className="text-lg font-semibold">{error}</div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <h1 className="text-3xl font-bold text-gray-800 mb-8">Admin Dashboard Overview</h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6 mb-8"> {/* Changed to xl:grid-cols-6 */}
        <DashboardCard title="Total Users" value={dashboardData.totalUsers} icon={<FaUsers />} color="bg-gradient-to-r from-blue-500 to-blue-600" />
        <DashboardCard title="Total Campaigns" value={dashboardData.totalCampaigns} icon={<FaChartLine />} color="bg-gradient-to-r from-green-500 to-green-600" />
        <DashboardCard title="Your Products" value={dashboardData.totalCompanyProducts} icon={<FaBuilding />} color="bg-gradient-to-r from-orange-500 to-orange-600" />
        <DashboardCard title="Supplier Products" value={dashboardData.totalClientProducts} icon={<FaHandshake />} color="bg-gradient-to-r from-purple-500 to-purple-600" />
        <DashboardCard title="Total Projects" value={dashboardData.totalProjects} icon={<FaProjectDiagram />} color="bg-gradient-to-r from-yellow-500 to-yellow-600" />
        <DashboardCard title="Total Expenses" value={dashboardData.totalExpenses} icon={<FaMoneyBillWave />} color="bg-gradient-to-r from-red-500 to-red-600" /> {/* New Card */}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChartCard title="User Roles Distribution" icon={<FaChartPie />}>
          <ChartComponent type="pie" data={dashboardData.userRoles} />
        </ChartCard>

        <ChartCard title="Campaign Status" icon={<FaBars />}>
          <ChartComponent type="bar" data={dashboardData.campaignStatus} />
        </ChartCard>

        <ChartCard title="Your Product Categories" icon={<FaChartPie />}>
          <ChartComponent type="pie" data={dashboardData.companyProductCategories} />
        </ChartCard>

        <ChartCard title="Supplier Product Status" icon={<FaBars />}>
          <ChartComponent type="bar" data={dashboardData.clientProductStatuses} />
        </ChartCard>

        <ChartCard title="Supplier Payment Status" icon={<FaChartPie />}>
          <ChartComponent type="pie" data={dashboardData.clientPaymentStatuses} />
        </ChartCard>

        <ChartCard title="Project Status" icon={<FaChartPie />}>
          <ChartComponent type="pie" data={dashboardData.projectStatus} />
        </ChartCard>

        {/* New Chart: Expense Categories Distribution */}
        <ChartCard title="Expense Categories" icon={<FaChartPie />}>
          <ChartComponent type="pie" data={dashboardData.expenseCategories} />
        </ChartCard>
      </div>
    </div>
  );
};

export default AdminDashboard;
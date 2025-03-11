import React, { useState, useEffect } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import axios from 'axios';
import { 
  Users,
  Building,
  MapPin,
  Sprout,
  Calendar,
  Truck,
  DollarSign,
  Phone,
  Mail
} from 'lucide-react';

const getAuthToken = () => localStorage.getItem("token");

const getHeaders = () => {
  const token = getAuthToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
};

const COLORS = {
  primary: ['#2563eb', '#3b82f6', '#60a5fa', '#93c5fd', '#bfdbfe'],
  success: ['#059669', '#10b981', '#34d399', '#6ee7b7', '#a7f3d0'],
  warning: ['#d97706', '#f59e0b', '#fbbf24', '#fcd34d', '#fde68a'],
};

const ClientOverview = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [statistics, setStatistics] = useState({
    totalFarmers: 0,
    totalCooperatives: 0,
    avgPrice: 0,
    needsLogistics: 0,
    totalProducts: 0,
    upcomingHarvests: 0,
    activeLocations: 0,
    totalContacts: 0
  });

  const [charts, setCharts] = useState({
    productTypes: [],
    locationData: [],
    harvestTiming: []
  });

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const currentUser = JSON.parse(localStorage.getItem("currentUser"));
      if (!currentUser) {
        throw new Error("User not authenticated");
      }
      const userId = currentUser._id;
      const response = await axios.get(
        `http://localhost:5000/api/clientproducts/user/${userId}`,
        { headers: getHeaders() }
      );
      
      setProducts(response.data);
      calculateStatistics(response.data);
      prepareChartData(response.data);
      setError(null);
    } catch (error) {
      console.error("Error fetching products:", error);
      setError("Failed to load dashboard data. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  const calculateStatistics = (data) => {
    const uniqueFarmers = new Set(data.map(p => p.id)).size;
    const uniqueCoops = new Set(data.map(p => p.cooperativeName)).size;
    const uniqueLocations = new Set(data.map(p => p.location)).size;
    const totalPrice = data.reduce((sum, p) => sum + Number(p.priceSoldAt), 0);
    const logisticsCount = data.filter(p => p.needLogistic).length;
    const uniqueContacts = new Set([...data.map(p => p.phoneNumber), ...data.map(p => p.email)]).size;

    // Calculate upcoming harvests (within next 30 days)
    const today = new Date();
    const upcomingHarvests = data.filter(p => {
      const harvestDate = new Date(p.harvestTime);
      const diffDays = Math.ceil((harvestDate - today) / (1000 * 60 * 60 * 24));
      return diffDays >= 0 && diffDays <= 30;
    }).length;

    setStatistics({
      totalFarmers: uniqueFarmers,
      totalCooperatives: uniqueCoops,
      avgPrice: (totalPrice / data.length).toFixed(2),
      needsLogistics: logisticsCount,
      totalProducts: data.length,
      upcomingHarvests,
      activeLocations: uniqueLocations,
      totalContacts: uniqueContacts
    });
  };

  const prepareChartData = (data) => {
    // Product Types Distribution
    const productTypes = data.reduce((acc, p) => {
      acc[p.productType] = (acc[p.productType] || 0) + 1;
      return acc;
    }, {});

    // Location Distribution
    const locations = data.reduce((acc, p) => {
      acc[p.location] = (acc[p.location] || 0) + 1;
      return acc;
    }, {});

    // Harvest Timing Distribution
    const harvestMonths = data.reduce((acc, p) => {
      const month = new Date(p.harvestTime).toLocaleString('default', { month: 'long' });
      acc[month] = (acc[month] || 0) + 1;
      return acc;
    }, {});

    setCharts({
      productTypes: Object.entries(productTypes).map(([name, value]) => ({ name, value })),
      locationData: Object.entries(locations).map(([name, value]) => ({ name, value })),
      harvestTiming: Object.entries(harvestMonths).map(([name, value]) => ({ name, value }))
    });
  };

  const StatCard = ({ title, value, icon: Icon, colorClass }) => (
    <div className={`bg-white rounded-lg shadow-md ${colorClass} border-l-4 p-4`}>
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-sm font-medium text-gray-600">{title}</h3>
        <Icon className="h-4 w-4 text-gray-600" />
      </div>
      <div className="text-2xl font-bold">{value}</div>
    </div>
  );

  const ChartCard = ({ title, children }) => (
    <div className="bg-white rounded-lg shadow-md p-4">
      <h3 className="text-lg font-semibold mb-4">{title}</h3>
      {children}
    </div>
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-xl text-gray-600">Loading dashboard data...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-xl text-red-600">{error}</div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 bg-gray-50">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold text-gray-800">Agricultural Dashboard</h2>
        <button 
          onClick={fetchProducts}
          className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
        >
          Refresh Data
        </button>
      </div>
      
      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard 
          title="Total Farmers" 
          value={statistics.totalFarmers} 
          icon={Users}
          colorClass="border-blue-500"
        />
        <StatCard 
          title="Cooperatives" 
          value={statistics.totalCooperatives} 
          icon={Building}
          colorClass="border-green-500"
        />
        <StatCard 
          title="Average Price" 
          value={`$${statistics.avgPrice}`} 
          icon={DollarSign}
          colorClass="border-yellow-500"
        />
        <StatCard 
          title="Need Logistics" 
          value={`${statistics.needsLogistics} (${Math.round(statistics.needsLogistics/statistics.totalProducts*100)}%)`} 
          icon={Truck}
          colorClass="border-purple-500"
        />
        <StatCard 
          title="Total Products" 
          value={statistics.totalProducts} 
          icon={Sprout}
          colorClass="border-emerald-500"
        />
        <StatCard 
          title="Upcoming Harvests" 
          value={statistics.upcomingHarvests} 
          icon={Calendar}
          colorClass="border-orange-500"
        />
        <StatCard 
          title="Active Locations" 
          value={statistics.activeLocations} 
          icon={MapPin}
          colorClass="border-indigo-500"
        />
        <StatCard 
          title="Total Contacts" 
          value={statistics.totalContacts} 
          icon={Phone}
          colorClass="border-teal-500"
        />
      </div>

      {/* Latest Products Preview */}
      <div className="bg-white rounded-lg shadow-md p-4">
        <h3 className="text-lg font-semibold mb-4">Latest Products</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full table-auto">
            <thead>
              <tr className="bg-gray-50">
                <th className="px-4 py-2 text-left">Farmer</th>
                <th className="px-4 py-2 text-left">Product</th>
                <th className="px-4 py-2 text-left">Location</th>
                <th className="px-4 py-2 text-left">Harvest Time</th>
                <th className="px-4 py-2 text-right">Price</th>
              </tr>
            </thead>
            <tbody>
              {products.slice(0, 5).map((product) => (
                <tr key={product._id} className="border-t">
                  <td className="px-4 py-2">{product.names}</td>
                  <td className="px-4 py-2">{product.productType}</td>
                  <td className="px-4 py-2">{product.location}</td>
                  <td className="px-4 py-2">{new Date(product.harvestTime).toLocaleDateString()}</td>
                  <td className="px-4 py-2 text-right">${product.priceSoldAt}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <ChartCard title="Product Distribution">
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={charts.productTypes}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                >
                  {charts.productTypes.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS.success[index % COLORS.success.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </ChartCard>

        <ChartCard title="Geographical Distribution">
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={charts.locationData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                >
                  {charts.locationData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS.primary[index % COLORS.primary.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </ChartCard>

        <ChartCard title="Harvest Distribution">
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={charts.harvestTiming}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                >
                  {charts.harvestTiming.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS.warning[index % COLORS.warning.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </ChartCard>
      </div>
    </div>
  );
};

export default ClientOverview;
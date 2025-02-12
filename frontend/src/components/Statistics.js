import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';
import { ArrowUpCircle, ArrowDownCircle } from 'lucide-react';

const Statistics = () => {
  // Sample data for the line chart
  const chartData = [
    { name: 'Jan', sales: 1200, inventory: 800, expenses: 400 },
    { name: 'Feb', sales: 1000, inventory: 1000, expenses: 600 },
    { name: 'Mar', sales: 1400, inventory: 900, expenses: 800 },
    { name: 'Apr', sales: 1300, inventory: 1100, expenses: 900 },
    { name: 'May', sales: 1100, inventory: 1200, expenses: 1000 },
    { name: 'Jun', sales: 900, inventory: 1300, expenses: 1100 },
    { name: 'Jul', sales: 800, inventory: 600, expenses: 1200 },
    { name: 'Aug', sales: 1000, inventory: 800, expenses: 1300 },
    { name: 'Sept', sales: 1500, inventory: 1400, expenses: 1400 },
    { name: 'Oct', sales: 1300, inventory: 1200, expenses: 1500 },
    { name: 'Nov', sales: 1100, inventory: 1000, expenses: 1400 },
    { name: 'Dec', sales: 900, inventory: 800, expenses: 1600 },
  ];

  const CircularProgress = ({ percentage }) => {
    const radius = 40;
    const circumference = 2 * Math.PI * radius;
    const strokeDashoffset = circumference - (percentage / 100) * circumference;

    return (
      <div className="relative w-32 h-32">
        <svg className="w-full h-full transform -rotate-90">
          <circle
            className="text-gray-200"
            strokeWidth="8"
            stroke="currentColor"
            fill="transparent"
            r={radius}
            cx="64"
            cy="64"
          />
          <circle
            className="text-green-500"
            strokeWidth="8"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            stroke="currentColor"
            fill="transparent"
            r={radius}
            cx="64"
            cy="64"
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-2xl font-bold">{percentage}%</span>
        </div>
      </div>
    );
  };

  return (
    <div className="p-6 bg-gray-50">
      {/* Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        {/* Sales Card */}
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="text-gray-500 text-sm mb-1">Sales</h3>
              <p className="text-xl font-bold">Rwf 1,567,579</p>
            </div>
            <div className="flex items-center text-green-500">
              <ArrowUpCircle className="w-4 h-4 mr-1" />
              <span className="text-sm">+29.8%</span>
            </div>
          </div>
        </div>

        {/* Inventory Card */}
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="text-gray-500 text-sm mb-1">Inventory</h3>
              <p className="text-xl font-bold">Rwf 1,457,550</p>
            </div>
            <div className="flex items-center text-red-500">
              <ArrowDownCircle className="w-4 h-4 mr-1" />
              <span className="text-sm">+29.8%</span>
            </div>
          </div>
        </div>

        {/* Expenses Card */}
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="text-gray-500 text-sm mb-1">Expenses</h3>
              <p className="text-xl font-bold">Rwf 5,657,290</p>
            </div>
            <div className="flex items-center text-green-500">
              <ArrowUpCircle className="w-4 h-4 mr-1" />
              <span className="text-sm">+29.8%</span>
            </div>
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Line Chart */}
        <div className="lg:col-span-2 bg-white p-4 rounded-lg shadow">
          <h3 className="text-gray-500 text-sm mb-4">Sale breakdown</h3>
          <LineChart width={600} height={300} data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Line 
              type="monotone" 
              dataKey="sales" 
              stroke="#22C55E" 
              strokeWidth={2} 
            />
            <Line 
              type="monotone" 
              dataKey="inventory" 
              stroke="#EF4444" 
              strokeWidth={2} 
            />
            <Line 
              type="monotone" 
              dataKey="expenses" 
              stroke="#3B82F6" 
              strokeWidth={2} 
            />
          </LineChart>
        </div>

        {/* Circular Progress */}
        <div className="bg-white p-4 rounded-lg shadow flex items-center justify-center">
          <CircularProgress percentage={90} />
        </div>
      </div>
    </div>
  );
};

export default Statistics;
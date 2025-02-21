import React, { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';
import { ArrowUpCircle, ArrowDownCircle } from 'lucide-react';
import axios from 'axios';

const Statistics = () => {
  const [expenses, setExpenses] = useState([]);
  const [products, setProducts] = useState([]);
  const [metrics, setMetrics] = useState({
    totalExpenses: 0,
    totalInventoryValue: 0,
    expensesTrend: 0,
    inventoryTrend: 0
  });
  const [chartData, setChartData] = useState([]);
  const [error, setError] = useState(null);

  const token = localStorage.getItem('token');

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch expenses and products
        const [expensesRes, productsRes] = await Promise.all([
          axios.get('http://localhost:5000/api/expenses', {
            headers: { Authorization: `Bearer ${token}` }
          }),
          axios.get('http://localhost:5000/api/products', {
            headers: { Authorization: `Bearer ${token}` }
          })
        ]);

        // Ensure we have arrays to work with
        const expensesArray = Array.isArray(expensesRes.data) ? expensesRes.data : 
                            (expensesRes.data.expenses || []);
        const productsArray = Array.isArray(productsRes.data) ? productsRes.data : 
                            (productsRes.data.products || []);

        console.log('Expenses data:', expensesArray);
        console.log('Products data:', productsArray);

        setExpenses(expensesArray);
        setProducts(productsArray);

        // Calculate metrics
        const totalExp = expensesArray.reduce((sum, exp) => {
          const amount = Number(exp.amount) || 0;
          return sum + amount;
        }, 0);

        const totalInv = productsArray.reduce((sum, prod) => {
          const price = Number(prod.price) || 0;
          const quantity = Number(prod.quantity) || 1;
          return sum + (price * quantity);
        }, 0);

        // Calculate trends (comparing to previous month)
        const currentDate = new Date();
        const currentMonth = currentDate.getMonth();
        const currentYear = currentDate.getFullYear();

        const currentMonthExpenses = expensesArray
          .filter(exp => {
            const expDate = new Date(exp.date);
            return expDate.getMonth() === currentMonth && 
                   expDate.getFullYear() === currentYear;
          })
          .reduce((sum, exp) => sum + (Number(exp.amount) || 0), 0);
        
        const prevMonthExpenses = expensesArray
          .filter(exp => {
            const expDate = new Date(exp.date);
            return expDate.getMonth() === (currentMonth - 1) && 
                   expDate.getFullYear() === currentYear;
          })
          .reduce((sum, exp) => sum + (Number(exp.amount) || 0), 0);

        const expTrend = prevMonthExpenses ? 
          ((currentMonthExpenses - prevMonthExpenses) / prevMonthExpenses) * 100 : 0;

        setMetrics({
          totalExpenses: totalExp,
          totalInventoryValue: totalInv,
          expensesTrend: expTrend,
          inventoryTrend: totalExp ? ((totalInv - totalExp) / totalExp) * 100 : 0
        });

        // Process data for chart
        const monthlyData = processMonthlyData(expensesArray, productsArray);
        setChartData(monthlyData);

      } catch (error) {
        console.error('Error details:', error.response || error);
        setError(error.message || 'Error fetching data');
      }
    };

    fetchData();
  }, [token]);

  const processMonthlyData = (expenses, products) => {
    const months = {};
    const currentYear = new Date().getFullYear();

    // Initialize all months
    ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
      .forEach(month => {
        months[month] = { name: month, expenses: 0, inventory: 0 };
      });

    // Process expenses
    expenses.forEach(expense => {
      try {
        const date = new Date(expense.date);
        if (date.getFullYear() === currentYear) {
          const month = date.toLocaleString('default', { month: 'short' });
          if (months[month]) {
            months[month].expenses += Number(expense.amount) || 0;
          }
        }
      } catch (err) {
        console.error('Error processing expense:', expense, err);
      }
    });

    // Process inventory (products)
    const totalInventoryValue = products.reduce((sum, product) => {
      const value = (Number(product.price) || 0) * (Number(product.quantity) || 1);
      return sum + value;
    }, 0);

    // Distribute inventory value across months
    Object.keys(months).forEach(month => {
      months[month].inventory = totalInventoryValue;
    });

    return Object.values(months);
  };

  const CircularProgress = ({ percentage }) => {
    const radius = 40;
    const circumference = 2 * Math.PI * radius;
    const strokeDashoffset = circumference - (Math.min(100, Math.max(0, percentage)) / 100) * circumference;

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
          <span className="text-2xl font-bold">{Math.min(100, Math.max(0, percentage)).toFixed(1)}%</span>
        </div>
      </div>
    );
  };

  if (error) {
    return (
      <div className="p-6 bg-gray-50">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          <p>Error: {error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-gray-50">
      {/* Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        {/* Inventory Value Card */}
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="text-gray-500 text-sm mb-1">Inventory Value</h3>
              <p className="text-xl font-bold">Rwf {metrics.totalInventoryValue.toLocaleString()}</p>
            </div>
            <div className="flex items-center text-green-500">
              <ArrowUpCircle className="w-4 h-4 mr-1" />
              <span className="text-sm">
                {metrics.inventoryTrend > 0 ? '+' : ''}{metrics.inventoryTrend.toFixed(1)}%
              </span>
            </div>
          </div>
        </div>

        {/* Total Expenses Card */}
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="text-gray-500 text-sm mb-1">Total Expenses</h3>
              <p className="text-xl font-bold">Rwf {metrics.totalExpenses.toLocaleString()}</p>
            </div>
            <div className={`flex items-center ${metrics.expensesTrend > 0 ? 'text-red-500' : 'text-green-500'}`}>
              {metrics.expensesTrend > 0 ? <ArrowUpCircle className="w-4 h-4 mr-1" /> : <ArrowDownCircle className="w-4 h-4 mr-1" />}
              <span className="text-sm">
                {metrics.expensesTrend > 0 ? '+' : ''}{metrics.expensesTrend.toFixed(1)}%
              </span>
            </div>
          </div>
        </div>

        {/* Products Count Card */}
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="text-gray-500 text-sm mb-1">Total Products</h3>
              <p className="text-xl font-bold">{products.length}</p>
            </div>
            <div className="flex items-center text-green-500">
              <ArrowUpCircle className="w-4 h-4 mr-1" />
              <span className="text-sm">Active</span>
            </div>
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Line Chart */}
        <div className="lg:col-span-2 bg-white p-4 rounded-lg shadow">
          <h3 className="text-gray-500 text-sm mb-4">Financial Overview</h3>
          <div className="overflow-x-auto">
            <LineChart width={600} height={300} data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Line 
                type="monotone" 
                dataKey="inventory" 
                name="Inventory Value"
                stroke="#22C55E" 
                strokeWidth={2} 
              />
              <Line 
                type="monotone" 
                dataKey="expenses" 
                name="Expenses"
                stroke="#EF4444" 
                strokeWidth={2} 
              />
            </LineChart>
          </div>
        </div>

        {/* Circular Progress - Inventory Health */}
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-gray-500 text-sm mb-4 text-center">Inventory Health</h3>
          <div className="flex flex-col items-center justify-center">
            <CircularProgress 
              percentage={Math.min(100, (metrics.totalInventoryValue / (metrics.totalExpenses || 1)) * 100)} 
            />
            <p className="text-sm text-gray-500 mt-4">Inventory to Expenses Ratio</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Statistics;
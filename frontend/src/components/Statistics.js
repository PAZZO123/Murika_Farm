import React, { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { ArrowUpCircle, ArrowDownCircle, Loader, DollarSign, Package, FileText } from 'lucide-react';
import axios from 'axios';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

const Statistics = () => {
  const [metrics, setMetrics] = useState({
    totalExpenses: 0,
    totalInventoryValue: 0,
    expensesTrend: 0,
    totalProducts: 0,
    inventoryExpenseBalance: 0,
  });
  const [chartData, setChartData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const token = localStorage.getItem('token');

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);

      try {
        if (!token) {
          throw new Error("Authentication token not found. Please log in.");
        }

        const [expensesRes, productsRes] = await Promise.all([
          axios.get('http://localhost:5000/api/expenses', {
            headers: { Authorization: `Bearer ${token}` }
          }),
          axios.get('http://localhost:5000/api/products', {
            headers: { Authorization: `Bearer ${token}` }
          })
        ]);

        const expensesArray = Array.isArray(expensesRes.data) ? expensesRes.data :
          (expensesRes.data.expenses || []);
        const productsArray = Array.isArray(productsRes.data) ? productsRes.data :
          (productsRes.data.data || productsRes.data.products || []);

        const totalExp = expensesArray.reduce((sum, exp) => {
          const amount = Number(exp.amount) || 0;
          return sum + amount;
        }, 0);

        const totalInv = productsArray.reduce((sum, prod) => {
          const price = Number(prod.price) || 0;
          const quantity = Number(prod.quantity) || 0;
          return sum + (price * quantity);
        }, 0);

        const currentDate = new Date();
        const currentMonth = currentDate.getMonth();
        const currentYear = currentDate.getFullYear();

        const getMonthExpenses = (month, year) => {
          return expensesArray
            .filter(exp => {
              const expDate = new Date(exp.date);
              return expDate.getMonth() === month && expDate.getFullYear() === year;
            })
            .reduce((sum, exp) => sum + (Number(exp.amount) || 0), 0);
        };

        const currentMonthExp = getMonthExpenses(currentMonth, currentYear);

        let prevMonth = currentMonth - 1;
        let prevYear = currentYear;
        if (prevMonth < 0) {
          prevMonth = 11;
          prevYear--;
        }
        const prevMonthExp = getMonthExpenses(prevMonth, prevYear);

        const expTrend = prevMonthExp !== 0 ? ((currentMonthExp - prevMonthExp) / prevMonthExp) * 100 :
          currentMonthExp > 0 ? 100 : 0;

        const inventoryExpenseBalanceValue = totalInv - currentMonthExp;


        setMetrics({
          totalExpenses: currentMonthExp,
          totalInventoryValue: totalInv,
          expensesTrend: expTrend,
          totalProducts: productsArray.length,
          inventoryExpenseBalance: inventoryExpenseBalanceValue,
        });

        const monthlyData = processMonthlyData(expensesArray, productsArray, totalInv);
        setChartData(monthlyData);

      } catch (error) {
        console.error('Error fetching data:', error.response?.data || error.message);
        setError(error.response?.data?.error || error.message || 'An unexpected error occurred.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [token]);

  const processMonthlyData = (expenses, products, overallInventoryValue) => {
    const monthsData = {};
    const currentYear = new Date().getFullYear();
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

    const startDate = new Date();
    startDate.setMonth(startDate.getMonth() - 5);
    startDate.setDate(1);

    for (let i = 0; i < 6; i++) {
      const date = new Date(startDate.getFullYear(), startDate.getMonth() + i, 1);
      const monthKey = monthNames[date.getMonth()];
      monthsData[monthKey] = { name: monthKey, expenses: 0, inventory: 0 };
    }

    expenses.forEach(expense => {
      try {
        const date = new Date(expense.date);
        if (date.getFullYear() === currentYear) {
          const month = date.toLocaleString('default', { month: 'short' });
          if (monthsData[month]) {
            monthsData[month].expenses += Number(expense.amount) || 0;
          }
        }
      } catch (err) {
        console.warn('Skipping invalid expense date:', expense.date, err);
      }
    });

    Object.keys(monthsData).forEach(month => {
      monthsData[month].inventory = overallInventoryValue;
    });

    return Object.values(monthsData);
  };

  // Removed the CircularProgress component as it's no longer needed for "Inventory Health Ratio"
  // const CircularProgress = ...;

  const handleDownloadPdf = async () => {
    const input = document.getElementById('statistics-content');
    if (!input) {
      console.error("Element with ID 'statistics-content' not found.");
      return;
    }

    setLoading(true);

    try {
      const canvas = await html2canvas(input, {
        scale: 2,
        useCORS: true,
        windowWidth: input.scrollWidth,
        windowHeight: input.scrollHeight,
      });

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const imgWidth = 210;
      const pageHeight = 297;
      const imgHeight = canvas.height * imgWidth / canvas.width;
      let heightLeft = imgHeight;
      let position = 0;

      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;

      while (heightLeft >= 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }

      pdf.save('dashboard-statistics.pdf');
    } catch (err) {
      console.error('Error generating PDF:', err);
      setError('Failed to generate PDF. Please try again.');
    } finally {
      setLoading(false);
    }
  };


  if (loading) {
    return (
      <div className="flex items-center justify-center h-64 bg-gray-50">
        <Loader className="animate-spin text-blue-500 h-10 w-10" />
        <p className="ml-3 text-gray-700">Loading statistics...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 bg-gray-50">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          <p className="font-bold">Error fetching data:</p>
          <p>{error}</p>
          <p className="text-sm mt-2">Please ensure your backend server is running and you are authenticated.</p>
        </div>
      </div>
    );
  }

  // The inventoryToExpensesRatio calculation is still here, but it's not being rendered.
  // You can remove this calculation if you're sure you'll never use it for anything else.
  const inventoryToExpensesRatio = metrics.totalExpenses !== 0
                                   ? (metrics.totalInventoryValue / metrics.totalExpenses) * 100
                                   : metrics.totalInventoryValue > 0 ? 100 : 0;

  const isPositiveBalance = metrics.inventoryExpenseBalance >= 0;
  const balanceColorClass = isPositiveBalance ? 'text-green-600' : 'text-red-600';
  const balanceArrowIcon = isPositiveBalance ? <ArrowUpCircle className="w-6 h-6" /> : <ArrowDownCircle className="w-6 h-6" />;


  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-semibold text-gray-800">Dashboard Statistics</h2>
        <button
          onClick={handleDownloadPdf}
          className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg flex items-center shadow-md transition-colors duration-300"
          disabled={loading}
        >
          <FileText className="w-5 h-5 mr-2" /> Download PDF
        </button>
      </div>
      <hr className="mb-6 border-gray-300" />

      <div id="statistics-content">
        {/* Metrics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
          {/* Inventory Value Card */}
          <div className="bg-white p-5 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-gray-500 text-sm mb-1 uppercase tracking-wider">Total Inventory Value</h3>
                <p className="text-2xl font-bold text-gray-900">Rwf {metrics.totalInventoryValue.toLocaleString()}</p>
              </div>
              <div className="text-blue-500 text-3xl">
                  <Package />
              </div>
            </div>
            <p className="text-xs text-gray-500 mt-2">Current estimated market value</p>
          </div>

          {/* Total Expenses Card */}
          <div className="bg-white p-5 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-gray-500 text-sm mb-1 uppercase tracking-wider">Total Expenses (Current Month)</h3>
                <p className="text-2xl font-bold text-gray-900">Rwf {metrics.totalExpenses.toLocaleString()}</p>
              </div>
              <div className={`flex items-center text-3xl ${metrics.expensesTrend >= 0 ? 'text-red-500' : 'text-green-500'}`}>
                {metrics.expensesTrend >= 0 ? <ArrowUpCircle className="w-7 h-7 mr-1" /> : <ArrowDownCircle className="w-7 h-7 mr-1" />}
              </div>
            </div>
            <p className="text-xs text-gray-500 mt-2">
              <span className="font-medium"> {metrics.expensesTrend.toFixed(1)}% </span> vs. Previous Month
            </p>
          </div>

          {/* Total Products Count Card */}
          <div className="bg-white p-5 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-gray-500 text-sm mb-1 uppercase tracking-wider">Total Products</h3>
                <p className="text-2xl font-bold text-gray-900">{metrics.totalProducts}</p>
              </div>
              <div className="flex items-center text-orange-500 text-3xl">
                <Package />
              </div>
            </div>
            <p className="text-xs text-gray-500 mt-2">Number of unique items in inventory</p>
          </div>

          {/* Inventory vs. Expenses Net Balance Card */}
          <div className="bg-white p-5 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300">
              <div className="flex justify-between items-center">
                  <div>
                      <h3 className="text-gray-500 text-sm mb-1 uppercase tracking-wider">Inventory vs. Expenses Net</h3>
                      <p className={`text-2xl font-bold ${balanceColorClass}`}>
                          Rwf {metrics.inventoryExpenseBalance.toLocaleString()}
                      </p>
                  </div>
                  <div className={`text-3xl ${balanceColorClass}`}>
                      {balanceArrowIcon}
                  </div>
              </div>
              <p className="text-xs text-gray-500 mt-2">
                  Inventory value minus current month's expenses.
                  <span className={isPositiveBalance ? 'text-green-500' : 'text-red-500'}>
                      {isPositiveBalance ? ' (Positive Balance)' : ' (Negative Balance)'}
                  </span>
              </p>
          </div>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6"> {/* Changed lg:grid-cols-3 to lg:grid-cols-2 as one chart is removed */}
          {/* Line Chart */}
          <div className="lg:col-span-2 bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-gray-700 text-lg font-semibold mb-4">Financial Overview (Last 6 Months)</h3>
            <div className="w-full h-80">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                  <XAxis dataKey="name" stroke="#666" />
                  <YAxis stroke="#666" />
                  <Tooltip formatter={(value) => `Rwf ${value.toLocaleString()}`} />
                  <Line
                    type="monotone"
                    dataKey="inventory"
                    name="Inventory Value"
                    stroke="#4CAF50"
                    strokeWidth={2}
                    dot={{ r: 4 }}
                    activeDot={{ r: 8 }}
                  />
                  <Line
                    type="monotone"
                    dataKey="expenses"
                    name="Expenses"
                    stroke="#FFC107"
                    strokeWidth={2}
                    dot={{ r: 4 }}
                    activeDot={{ r: 8 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Removed Circular Progress - Inventory Health */}
        </div>
      </div>
    </div>
  );
};

export default Statistics;
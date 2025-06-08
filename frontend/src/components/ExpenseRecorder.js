import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { FaPlus, FaEdit, FaTrash, FaMoneyBillWave, FaCalendarAlt } from 'react-icons/fa';
import Modal from 'react-modal';
import axios from 'axios';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

Modal.setAppElement('#root'); // Ensure this matches your root element ID

// Expense Form Component
const ExpenseForm = React.memo(({ onSubmit, title, submitText, formData, handleInputChange, closeModal }) => (
  <form onSubmit={onSubmit} className="space-y-4 p-4">
    <h2 className="text-center text-2xl font-semibold text-gray-800 mb-6">{title}</h2>
    <div className="grid grid-cols-1 gap-4">
      <div>
        <label htmlFor="description" className="block text-sm font-medium text-gray-700">Description <span className="text-red-500">*</span></label>
        <textarea
          id="description"
          name="description"
          value={formData.description}
          onChange={handleInputChange}
          rows="3"
          className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
          required
          maxLength={500}
        />
      </div>
      <div>
        <label htmlFor="amount" className="block text-sm font-medium text-gray-700">Amount (Rwf) <span className="text-red-500">*</span></label>
        <input
          id="amount"
          type="number"
          name="amount"
          value={formData.amount}
          onChange={handleInputChange}
          className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
          required
          min="0"
          step="0.01"
        />
      </div>
      <div>
        <label htmlFor="category" className="block text-sm font-medium text-gray-700">Category <span className="text-red-500">*</span></label>
        <input
          id="category"
          type="text"
          name="category"
          value={formData.category}
          onChange={handleInputChange}
          className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
          required
          maxLength={100}
        />
      </div>
      <div>
        <label htmlFor="date" className="block text-sm font-medium text-gray-700">Date <span className="text-red-500">*</span></label>
        <input
          id="date"
          type="date"
          name="date"
          value={formData.date}
          onChange={handleInputChange}
          className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
          required
        />
      </div>
    </div>
    <div className="flex justify-end gap-4 mt-6">
      <button
        type="button"
        onClick={closeModal}
        className="px-5 py-2 bg-gray-300 text-gray-800 rounded-lg hover:bg-gray-400 transition-colors duration-200"
      >
        Cancel
      </button>
      <button
        type="submit"
        className="px-5 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors duration-200"
      >
        {submitText}
      </button>
    </div>
  </form>
));

// Main Expense Recorder Component
const ExpenseRecorder = () => {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [formData, setFormData] = useState({
    description: '', amount: '', category: '', date: ''
  });
  const [editExpense, setEditExpense] = useState(null);

  const token = localStorage.getItem('token'); // Assuming you have a token

  const fetchExpenses = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get('http://localhost:5000/api/expenses', {
        headers: { Authorization: `Bearer ${token}` }
      });
      // Assuming your expense API returns an array directly or inside a 'data' key
      const fetchedExpenses = Array.isArray(response.data) ? response.data : response.data.expenses || [];
      setExpenses(fetchedExpenses);
    } catch (err) {
      console.error('Error fetching expenses:', err.response?.data || err.message);
      setError(err.response?.data?.error || err.message || 'An error occurred while fetching expenses.');
      toast.error(err.response?.data?.error || 'Error fetching expenses.');
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchExpenses();
  }, [fetchExpenses]);

  const handleInputChange = useCallback((e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  }, []);

  const resetForm = useCallback(() => {
    setFormData({ description: '', amount: '', category: '', date: '' });
    setEditExpense(null);
  }, []);

  const commonFormValidation = () => {
    if (!formData.description || !formData.amount || !formData.category || !formData.date) {
      toast.error("Please fill in all required fields for the expense.");
      return false;
    }
    if (Number(formData.amount) <= 0) {
      toast.error("Expense amount must be greater than zero.");
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!commonFormValidation()) return;

    try {
      const response = await axios.post('http://localhost:5000/api/expenses', formData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (response.data.success) {
        setExpenses(prev => [...prev, response.data.data]);
        resetForm();
        setIsAddModalOpen(false);
        toast.success('Expense recorded successfully!');
      } else {
        toast.error(response.data.error || 'Failed to record expense.');
      }
    } catch (err) {
      console.error('Error recording expense:', err.response?.data || err.message);
      toast.error(err.response?.data?.error || 'Error recording expense. Please try again.');
    }
  };

  const handleEdit = useCallback((expense) => {
    setEditExpense(expense);
    setFormData({
      description: expense.description,
      amount: expense.amount,
      category: expense.category,
      date: new Date(expense.date).toISOString().split('T')[0] // Format date for input type="date"
    });
    setIsEditModalOpen(true);
  }, []);

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    if (!commonFormValidation()) return;

    try {
      const response = await axios.put(
        `http://localhost:5000/api/expenses/${editExpense._id}`,
        formData,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      if (response.data.success) {
        const updatedExpenses = expenses.map((exp) =>
          exp._id === editExpense._id ? response.data.data : exp
        );
        setExpenses(updatedExpenses);
        resetForm();
        setIsEditModalOpen(false);
        toast.success('Expense updated successfully!');
      } else {
        toast.error(response.data.error || 'Failed to update expense.');
      }
    } catch (err) {
      console.error('Error updating expense:', err.response?.data || err.message);
      toast.error(err.response?.data?.error || 'Error updating expense. Please try again.');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this expense? This action cannot be undone.')) {
      return;
    }
    try {
      const response = await axios.delete(`http://localhost:5000/api/expenses/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (response.data.success) {
        setExpenses(prev => prev.filter(expense => expense._id !== id));
        toast.success('Expense deleted successfully!');
      } else {
        toast.error(response.data.error || 'Failed to delete expense.');
      }
    } catch (err) {
      console.error('Error deleting expense:', err.response?.data || err.message);
      toast.error(err.response?.data?.error || 'Error deleting expense. Please try again.');
    }
  };

  // Sort expenses by date, newest first
  const sortedExpenses = useMemo(() => {
    return [...expenses].sort((a, b) => new Date(b.date) - new Date(a.date));
  }, [expenses]);

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <ToastContainer position="bottom-right" autoClose={3000} hideProgressBar={false} newestOnTop={false} closeOnClick rtl={false} pauseOnFocusLoss draggable pauseOnHover />

      <h1 className="text-3xl font-bold text-gray-800 mb-6">Expense Management</h1>
      <hr className="mb-6 border-gray-300" />

      <div className="flex justify-end items-center mb-8">
        <button
          onClick={() => { setIsAddModalOpen(true); resetForm(); }}
          className="flex items-center gap-2 px-6 py-2 bg-green-500 text-white rounded-lg shadow-md hover:bg-green-600 transition-colors duration-200"
        >
          <FaPlus className="w-4 h-4" />
          Record New Expense
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <FaMoneyBillWave className="animate-pulse text-green-500 text-5xl" />
          <p className="ml-4 text-lg text-gray-700">Loading expenses...</p>
        </div>
      ) : error ? (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
          <strong className="font-bold">Error!</strong>
          <span className="block sm:inline ml-2">{error}</span>
          <p className="text-sm mt-1">Please check your network connection or backend server status for expenses.</p>
        </div>
      ) : sortedExpenses.length === 0 ? (
        <div className="text-center py-10 bg-white rounded-lg shadow-md">
          <FaMoneyBillWave className="text-gray-400 text-6xl mx-auto mb-4" />
          <p className="text-xl text-gray-700">No expenses recorded yet.</p>
          <p className="text-gray-500 mt-2">Start by recording your first expense!</p>
        </div>
      ) : (
        <div className="space-y-4">
          {sortedExpenses.map((expense) => (
            <div key={expense._id} className="bg-white p-5 rounded-lg shadow-md flex flex-col sm:flex-row items-start sm:items-center justify-between transition-transform transform hover:scale-[1.01] duration-200">
              <div className="flex-grow">
                <h3 className="font-semibold text-lg text-gray-900">{expense.description}</h3>
                <div className="text-sm text-gray-600 mt-1">
                  <p><strong>Category:</strong> {expense.category}</p>
                  <p><strong>Amount:</strong> Rwf {Number(expense.amount).toLocaleString()}</p>
                  <p className="flex items-center gap-1">
                    <FaCalendarAlt className="w-3 h-3" />
                    <span>{new Date(expense.date).toLocaleDateString()}</span>
                  </p>
                </div>
              </div>

              <div className="flex gap-2 mt-4 sm:mt-0">
                <button
                  onClick={() => handleEdit(expense)}
                  className="p-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors duration-200"
                  title="Edit Expense"
                >
                  <FaEdit className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDelete(expense._id)}
                  className="p-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors duration-200"
                  title="Delete Expense"
                >
                  <FaTrash className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Expense Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onRequestClose={() => { setIsAddModalOpen(false); resetForm(); }}
        className="modal-content p-6 bg-white rounded-xl shadow-2xl max-w-lg mx-auto my-8 relative"
        overlayClassName="modal-overlay fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
      >
        <ExpenseForm
          onSubmit={handleSubmit}
          title="Record New Expense"
          submitText="Add Expense"
          formData={formData}
          handleInputChange={handleInputChange}
          closeModal={() => { setIsAddModalOpen(false); resetForm(); }}
        />
      </Modal>

      {/* Edit Expense Modal */}
      <Modal
        isOpen={isEditModalOpen}
        onRequestClose={() => { setIsEditModalOpen(false); resetForm(); }}
        className="modal-content p-6 bg-white rounded-xl shadow-2xl max-w-lg mx-auto my-8 relative"
        overlayClassName="modal-overlay fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
      >
        <ExpenseForm
          onSubmit={handleEditSubmit}
          title="Edit Expense"
          submitText="Update Expense"
          formData={formData}
          handleInputChange={handleInputChange}
          closeModal={() => { setIsEditModalOpen(false); resetForm(); }}
        />
      </Modal>
    </div>
  );
};

export default ExpenseRecorder;
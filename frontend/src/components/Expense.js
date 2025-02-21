import React, { useState, useEffect } from 'react';
import { FaEdit, FaTrash, FaDownload, FaEye, FaPlus, FaSortAmountDown, FaSortAmountUp } from 'react-icons/fa';
import axios from 'axios';
import { Link } from 'react-router-dom';

function Expense() {
  const [expenses, setExpenses] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newExpense, setNewExpense] = useState({ 
    supplier: '', 
    date: '', 
    amount: '', 
    attachment: null,
    attachmentName: '' 
  });
  const [editingExpenseId, setEditingExpenseId] = useState(null);
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });

  const token = localStorage.getItem('token');

  useEffect(() => {
    const fetchExpenses = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/expenses', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setExpenses(response.data);
      } catch (error) {
        console.error('Error fetching expenses:', error);
      }
    };

    fetchExpenses();
  }, [token]);

  const handleSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });

    const sortedExpenses = [...expenses].sort((a, b) => {
      if (key === 'date') {
        const dateA = new Date(a[key]);
        const dateB = new Date(b[key]);
        return direction === 'asc' ? dateA - dateB : dateB - dateA;
      }
      if (key === 'amount') {
        const amountA = parseFloat(a[key]);
        const amountB = parseFloat(b[key]);
        return direction === 'asc' ? amountA - amountB : amountB - amountA;
      }
      return 0;
    });

    setExpenses(sortedExpenses);
  };

  const getSortIcon = (columnName) => {
    if (sortConfig.key === columnName) {
      return sortConfig.direction === 'asc' ? <FaSortAmountUp /> : <FaSortAmountDown />;
    }
    return <FaSortAmountDown className="text-gray-300" />;
  };

  const handleAddExpense = () => {
    setEditingExpenseId(null);
    setIsModalOpen(true);
    setNewExpense({ 
      supplier: '', 
      date: '', 
      amount: '', 
      attachment: null,
      attachmentName: '' 
    });
  };

  const handleEditExpense = (expense) => {
    setEditingExpenseId(expense._id);
    setNewExpense({
      supplier: expense.supplier,
      date: expense.date,
      amount: expense.amount,
      attachment: null,
      attachmentName: expense.attachment
    });
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingExpenseId(null);
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setNewExpense({ 
        ...newExpense, 
        attachment: file,
        attachmentName: file.name 
      });
    }
  };

  const handleSaveExpense = async () => {
    const expenseData = new FormData();
    expenseData.append('supplier', newExpense.supplier);
    expenseData.append('date', newExpense.date);
    expenseData.append('amount', newExpense.amount);
    if (newExpense.attachment) {
      expenseData.append('attachment', newExpense.attachment);
    }

    try {
      if (editingExpenseId) {
        await axios.put(`http://localhost:5000/api/expenses/${editingExpenseId}`, expenseData, {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'multipart/form-data',
          },
        });
        setExpenses((prevExpenses) =>
          prevExpenses.map((expense) =>
            expense._id === editingExpenseId 
              ? { 
                  ...expense, 
                  supplier: newExpense.supplier,
                  date: newExpense.date,
                  amount: newExpense.amount,
                  attachment: newExpense.attachmentName || expense.attachment
                } 
              : expense
          )
        );
      } else {
        const response = await axios.post('http://localhost:5000/api/expenses', expenseData, {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'multipart/form-data',
          },
        });
        setExpenses([...expenses, response.data]);
      }
      handleCloseModal();
    } catch (error) {
      console.error('Error saving expense:', error);
    }
  };

  const handleDeleteExpense = async (expenseId) => {
    try {
      await axios.delete(`http://localhost:5000/api/expenses/${expenseId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setExpenses(expenses.filter((expense) => expense._id !== expenseId));
    } catch (error) {
      console.error('Error deleting expense:', error);
    }
  };

  const handleDownloadAttachment = async (expense) => {
    try {
      const response = await axios.get(
        `http://localhost:5000/api/expenses/${expense._id}/attachment`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          responseType: 'blob'
        }
      );
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', expense.attachment);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error downloading attachment:', error);
    }
  };

  return (
    <div className="container mx-auto p-4">
              <div className='flex gap-2'>
                <button className="flex items-center gap-2 px-4 py-2  border rounded-lg bg-white">
                 <Link to='/dashboard/invoice'>
                 Invoice
               </Link>
                </button>
                <button className="flex items-center gap-2 px-4 py-2 border rounded-lg bg-white">
                  <Link to='/dashboard/expense'>
                  Expenses
                  </Link>
                </button>
                </div>
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Expenses</h1>
        <button onClick={handleAddExpense} className="bg-green-500 text-white px-4 py-2 rounded flex items-center">
          <FaPlus className="mr-2" /> Record Expense
        </button>
      </div>

      <table className="w-full border-collapse border border-gray-300">
        <thead>
          <tr className="bg-gray-100">
            <th className="border p-2">#</th>
            <th className="border p-2">Supplier</th>
            <th className="border p-2 cursor-pointer" onClick={() => handleSort('date')}>
              <div className="flex items-center justify-between">
                Date {getSortIcon('date')}
              </div>
            </th>
            <th className="border p-2 cursor-pointer" onClick={() => handleSort('amount')}>
              <div className="flex items-center justify-between">
                Amount {getSortIcon('amount')}
              </div>
            </th>
            <th className="border p-2">Attachments</th>
            <th className="border p-2">Action</th>
          </tr>
        </thead>
        <tbody>
          {expenses.map((expense, index) => (
            <tr key={expense._id} className="border">
              <td className="border p-2">{index + 1}</td>
              <td className="border p-2">{expense.supplier}</td>
              <td className="border p-2">{expense.date}</td>
              <td className="border p-2">{expense.amount} Rwf</td>
              <td className="border p-2 flex items-center">
                {expense.attachment && (
                  <>
                    <FaDownload 
                      onClick={() => handleDownloadAttachment(expense)}
                      className="text-gray-500 cursor-pointer" 
                    />
                    <span className="ml-2">{expense.attachment}</span>
                  </>
                )}
              </td>
              <td className="border p-2 flex justify-around">
                <FaEdit
                  onClick={() => handleEditExpense(expense)}
                  className="text-green-500 cursor-pointer"
                />
                <FaTrash
                  onClick={() => handleDeleteExpense(expense._id)}
                  className="text-red-500 cursor-pointer"
                />
                <FaEye className="text-gray-500 cursor-pointer" />
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {isModalOpen && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded-lg w-96">
            <h2 className="text-xl font-bold mb-4">{editingExpenseId ? 'Edit Expense' : 'Add New Expense'}</h2>
            <input
              type="text"
              placeholder="Supplier"
              className="w-full border p-2 mb-2"
              value={newExpense.supplier}
              onChange={(e) => setNewExpense({ ...newExpense, supplier: e.target.value })}
            />
            <input
              type="date"
              className="w-full border p-2 mb-2"
              value={newExpense.date}
              onChange={(e) => setNewExpense({ ...newExpense, date: e.target.value })}
            />
            <input
              type="number"
              placeholder="Amount"
              className="w-full border p-2 mb-2"
              value={newExpense.amount}
              onChange={(e) => setNewExpense({ ...newExpense, amount: e.target.value })}
            />
            <div className="w-full border p-2 mb-2">
              <input
                type="file"
                onChange={handleFileChange}
                className="w-full"
              />
              {newExpense.attachmentName && (
                <p className="text-sm text-gray-600 mt-1">
                  Selected file: {newExpense.attachmentName}
                </p>
              )}
            </div>
            <div className="flex justify-end">
              <button onClick={handleCloseModal} className="bg-gray-500 text-white px-4 py-2 rounded mr-2">
                Cancel
              </button>
              <button onClick={handleSaveExpense} className="bg-blue-500 text-white px-4 py-2 rounded">
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Expense;
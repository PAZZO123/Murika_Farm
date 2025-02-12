import React, { useState, useEffect } from 'react';
import { FaEdit, FaTrash, FaDownload, FaEye, FaPlus } from 'react-icons/fa';
import axios from 'axios';

function Expense() {
  const [expenses, setExpenses] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newExpense, setNewExpense] = useState({ supplier: '', date: '', amount: '', attachment: '' });
  
  useEffect(() => {
    const fetchExpenses = async () => {
      try {
        const response = await axios.get('https://api.example.com/expenses'); // Replace with your API endpoint
        setExpenses(response.data);
      } catch (error) {
        console.error('Error fetching expenses:', error);
      }
    };

    fetchExpenses();
  }, []);

  const handleAddExpense = () => {
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setNewExpense({ supplier: '', date: '', amount: '', attachment: '' });
  };

  const handleSaveExpense = async () => {
    try {
      const response = await axios.post('https://api.example.com/expenses', newExpense);
      setExpenses([...expenses, response.data]);
      handleCloseModal();
    } catch (error) {
      console.error('Error saving expense:', error);
    }
  };

  return (
    <div className="container mx-auto p-4">
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
            <th className="border p-2">Date</th>
            <th className="border p-2">Amount</th>
            <th className="border p-2">Attachments</th>
            <th className="border p-2">Action</th>
          </tr>
        </thead>
        <tbody>
          {expenses.map((expense, index) => (
            <tr key={expense.id} className="border">
              <td className="border p-2">{index + 1}</td>
              <td className="border p-2">{expense.supplier}</td>
              <td className="border p-2">{expense.date}</td>
              <td className="border p-2">{expense.amount} Rwf</td>
              <td className="border p-2 flex items-center">
                <FaDownload className="text-gray-500 cursor-pointer" />
                <span className="ml-2">{expense.attachment}</span>
              </td>
              <td className="border p-2 flex justify-around">
                <FaEdit className="text-green-500 cursor-pointer" />
                <FaTrash className="text-red-500 cursor-pointer" />
                <FaEye className="text-gray-500 cursor-pointer" />
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded-lg w-96">
            <h2 className="text-xl font-bold mb-4">Add New Expense</h2>
            <input type="text" placeholder="Supplier" className="w-full border p-2 mb-2" value={newExpense.supplier} onChange={(e) => setNewExpense({ ...newExpense, supplier: e.target.value })} />
            <input type="date" className="w-full border p-2 mb-2" value={newExpense.date} onChange={(e) => setNewExpense({ ...newExpense, date: e.target.value })} />
            <input type="number" placeholder="Amount" className="w-full border p-2 mb-2" value={newExpense.amount} onChange={(e) => setNewExpense({ ...newExpense, amount: e.target.value })} />
            <input type="text" placeholder="Attachment" className="w-full border p-2 mb-2" value={newExpense.attachment} onChange={(e) => setNewExpense({ ...newExpense, attachment: e.target.value })} />
            <div className="flex justify-end">
              <button onClick={handleCloseModal} className="bg-gray-500 text-white px-4 py-2 rounded mr-2">Cancel</button>
              <button onClick={handleSaveExpense} className="bg-blue-500 text-white px-4 py-2 rounded">Save</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Expense;

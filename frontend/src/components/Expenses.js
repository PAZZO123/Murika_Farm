import React, { useState, useEffect } from 'react';
import axios from 'axios';

const Expenses = () => {
  const [expenses, setExpenses] = useState([]);
  const [totalAmount, setTotalAmount] = useState(0);

  useEffect(() => {
    // Fetch expenses from the backend or API
    axios.get('/api/expenses') // Update the API endpoint
      .then(response => {
        setExpenses(response.data);
        // Calculate the total amount
        const total = response.data.reduce((sum, expense) => sum + expense.amount, 0);
        setTotalAmount(total);
      })
      .catch(error => console.error('Error fetching expenses:', error));
  }, []);

  return (
    <div className="bg-gray-100 p-4">
      <div className="container mx-auto bg-white p-4 rounded shadow">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-2xl font-bold">106 Expenses</h1>
          <div className="flex items-center space-x-2">
            <select className="border border-gray-300 rounded p-2">
              <option>Sort - - - - - - - - -</option>
            </select>
            <input type="text" className="border border-gray-300 rounded p-2" value={`${totalAmount} Rwf`} readOnly />
            <button className="bg-green-500 text-white px-4 py-2 rounded">+</button>
            <button className="bg-green-500 text-white px-4 py-2 rounded">+ Record Expense</button>
          </div>
        </div>
        <table className="min-w-full bg-white">
          <thead>
            <tr>
              <th className="py-2 px-4 border-b">#</th>
              <th className="py-2 px-4 border-b">Supplier</th>
              <th className="py-2 px-4 border-b">Date</th>
              <th className="py-2 px-4 border-b">Amount</th>
              <th className="py-2 px-4 border-b">Attachments</th>
              <th className="py-2 px-4 border-b">Action</th>
            </tr>
          </thead>
          <tbody>
            {expenses.map((expense, index) => (
              <tr key={expense.id}>
                <td className="py-2 px-4 border-b">{index + 1}</td>
                <td className="py-2 px-4 border-b">{expense.supplier}</td>
                <td className="py-2 px-4 border-b">{expense.date}</td>
                <td className="py-2 px-4 border-b">{expense.amount} Rwf</td>
                <td className="py-2 px-4 border-b">
                  <div className="flex items-center space-x-2">
                    <i className="fas fa-file-alt"></i>
                    <span>{expense.attachment}</span>
                    <i className="fas fa-download"></i>
                  </div>
                </td>
                <td className="py-2 px-4 border-b">
                  <div className="flex items-center space-x-2">
                    <i className="fas fa-edit text-green-500"></i>
                    <i className="fas fa-trash text-red-500"></i>
                    <i className="fas fa-eye"></i>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Expenses;

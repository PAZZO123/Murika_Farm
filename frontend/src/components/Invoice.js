import React, { useState, useEffect } from 'react';
import { Calendar } from 'lucide-react';
import { Link } from 'react-router-dom';

const Invoice = () => {
  const [payments, setPayments] = useState([
    {
      id: 1,
      amount: 1986000,
      recipient: 'MUNYESHYAKA Donatien',
      due_date: '2024-10-13',
      paid_amount: 1986000,
      status: 'paid'
    },
    {
      id: 2,
      amount: 21556000,
      recipient: 'MUHIRE Claude',
      due_date: '2024-10-22',
      paid_amount: 21556000,
      status: 'paid'
    },
    {
      id: 3,
      amount: 16870000,
      recipient: 'GASASIRA Emmy',
      due_date: '2024-10-26',
      paid_amount: 16870000,
      status: 'paid'
    },
    {
      id: 4,
      amount: 4650500,
      recipient: 'CYIMANA Faisal',
      due_date: '2024-10-16',
      paid_amount: 4650500,
      status: 'paid'
    },
    {
      id: 5,
      amount: 14650500,
      recipient: 'SHEMA Vedaste',
      due_date: '2024-10-24',
      paid_amount: 14650500,
      status: 'paid'
    },
    {
      id: 6,
      amount: 6220000,
      recipient: 'HIRWA Janvier',
      due_date: '2024-10-29',
      paid_amount: 6220000,
      status: 'paid'
    }
  ]);

  const [filterType, setFilterType] = useState('all');
  const [timeFilter, setTimeFilter] = useState('This month');

  // Calculate totals
  const totalPaid = payments.reduce((sum, payment) => 
    payment.status === 'paid' ? sum + payment.paid_amount : sum, 0
  );
  
  const totalPending = payments.reduce((sum, payment) => 
    payment.status === 'pending' ? sum + (payment.amount - payment.paid_amount) : sum, 0
  );

  // Filter payments based on status
  const filteredPayments = payments.filter(payment => {
    if (filterType === 'all') return true;
    return payment.status === filterType;
  });

  const handleStatusChange = (paymentId, newStatus) => {
    setPayments(payments.map(payment => 
      payment.id === paymentId ? { ...payment, status: newStatus } : payment
    ));
  };

  const handleSend = (paymentId) => {
    // Simulate sending payment
    handleStatusChange(paymentId, 'paid');
  };

  return (
    <div className="p-4 max-w-6xl mx-auto">
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
      <div className="mb-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="relative">
          <button className="flex items-center gap-2 px-4 py-2 border rounded-lg bg-white">
            <Calendar size={20} />
            {timeFilter}
          </button>
        </div>
        
        <div className="flex gap-4 flex-wrap">
          <div className="bg-green-500 text-white px-4 py-2 rounded-lg">
            Paid: {totalPaid.toLocaleString()} Rwf
          </div>
          <div className="bg-red-500 text-white px-4 py-2 rounded-lg">
            Pending: {totalPending.toLocaleString()} Rwf
          </div>
        </div>
      </div>

      {/* Payment cards grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredPayments.map((payment) => (
          <div key={payment.id} className="bg-white rounded-lg shadow-md p-4">
            <div className="mb-4">
              <h2 className="text-xl font-bold">{payment.amount.toLocaleString()} Rwf</h2>
              <p className="text-gray-600">To: {payment.recipient}</p>
              <p className="text-gray-600">Due date: {payment.due_date}</p>
              <p className="text-gray-600">Paid: {payment.paid_amount.toLocaleString()} Rwf</p>
            </div>
            
            <div className="flex justify-center gap-2">
              <button 
                className={`px-4 py-2 rounded font-medium ${
                  payment.status === 'pending' 
                    ? 'bg-yellow-400 text-yellow-900' 
                    : 'bg-gray-200 text-gray-600'
                }`}
                onClick={() => handleStatusChange(payment.id, 'pending')}
              >
                Pending
              </button>
              
              <button 
                className="px-4 py-2 rounded font-medium bg-green-500 text-white hover:bg-green-600"
                onClick={() => handleSend(payment.id)}
              >
                Send
              </button>
              
              <button 
                className="px-4 py-2 rounded font-medium bg-gray-200 text-gray-600 hover:bg-gray-300"
              >
                View
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Invoice;
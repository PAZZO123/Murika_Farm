import React from "react";

const Signup = () => {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-green-200 to-green-500">
      <div className="bg-white p-8 rounded-lg shadow-lg w-96">
        <h2 className="text-center text-2xl font-semibold text-green-600 mb-4">Sign Up</h2>
        <input 
          type="text" 
          placeholder="Full Name" 
          className="w-full px-4 py-2 border rounded mb-3 focus:outline-none focus:ring-2 focus:ring-green-500"
        />
        <input 
          type="email" 
          placeholder="Email" 
          className="w-full px-4 py-2 border rounded mb-3 focus:outline-none focus:ring-2 focus:ring-green-500"
        />
        <input 
          type="password" 
          placeholder="Password" 
          className="w-full px-4 py-2 border rounded mb-3 focus:outline-none focus:ring-2 focus:ring-green-500"
        />
        <input 
          type="password" 
          placeholder="Confirm Password" 
          className="w-full px-4 py-2 border rounded mb-3 focus:outline-none focus:ring-2 focus:ring-green-500"
        />
        <button 
          className="w-full bg-green-500 text-white py-2 rounded hover:bg-green-600 transition">
          Sign Up
        </button>
      </div>
    </div>
  );
};

export default Signup;
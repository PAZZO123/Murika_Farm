import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from "react-hook-form";
import axios from 'axios';
import { 
  ChevronLeft
} from "lucide-react";
import logo from "../Assets/Logo.png";

const Login = () => {
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const { register, handleSubmit, formState: { errors } } = useForm();

  const onSubmit = async (data) => {
    try {
      const response = await axios.post("http://localhost:5000/api/auth/signin", data);
      const { token, currentUser } = response.data;

      localStorage.setItem('token', token);
      localStorage.setItem('currentUser', JSON.stringify(currentUser));

      // Role-based navigation
      switch (currentUser.role) {
        case 'supplier':
          navigate("/dashboard/clientoverview");
          break;
        case 'admin':
          navigate("/dashboard/listuser");
          break;
        case 'inventory manager':
          navigate("/dashboard/stats");
          break;
          case 'manager':
            navigate("/dashboard/tasks");
            break;
            case 'finance':
              navigate("/dashboard/adminproduct");
              break;
              case 'marketing':
                navigate("/dashboard/marketing");
                break;
        default:
          navigate("/dashboard");
      }
    } catch (err) {
      setError(err.response?.data?.error || "Login failed");
    }
  };
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-200 to-green-500 py-12 px-4 sm:px-6 lg:px-8">
            <Link 
        to="/" 
        className="absolute top-4 left-4 flex items-center text-gray-600 hover:text-gray-700 transition-colors"
      >
        <ChevronLeft className="w-5 h-5" />
        <span className="ml-1">Back to Home</span>
      </Link>
      <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-lg shadow-lg">
        <div className="text-center">
          <img
            className="mx-auto h-20 w-auto"
            src={logo}
            alt="Logo"
          />
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
            Sign in to your account
          </h2>
        </div>
        {error && <p className="text-red-500 text-sm text-center mb-3">{error}</p>}

        <form onSubmit={handleSubmit(onSubmit)}>
          <input 
            type="text"
            placeholder="Username or email"
            {...register("usernameOrEmail", { required: "Username or email is required" })}
            className="w-full px-4 py-2 border rounded mb-3 focus:outline-none focus:ring-2 focus:ring-green-500"
          />
          {errors.usernameOrEmail && <p className="text-red-500 text-sm">{errors.usernameOrEmail.message}</p>}

          <input 
            type="password"
            placeholder="Password"
            {...register("password", { required: "Password is required" })}
            className="w-full px-4 py-2 border rounded mb-3 focus:outline-none focus:ring-2 focus:ring-green-500"
          />
          {errors.password && <p className="text-red-500 text-sm">{errors.password.message}</p>}

          <div className="text-left mb-3">
            <a href="#" className="text-green-500 text-sm">Forgot password?</a>
          </div>

          <button 
            type="submit"
            className="w-full bg-green-500 text-white py-2 rounded hover:bg-green-600 transition">
            Login
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;

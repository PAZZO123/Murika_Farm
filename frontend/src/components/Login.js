import React, { useState } from "react";
import { useForm } from "react-hook-form";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const Login = () => {
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const { register, handleSubmit, formState: { errors } } = useForm();

  const onSubmit = async (data) => {
    try {
      const response = await axios.post("http://localhost:5000/api/auth/signin", data);
      localStorage.setItem("token", response.data.token); // Store token
      navigate("/dashboard"); // Redirect after login
    } catch (err) {
      setError(err.response?.data?.error || "Login failed");
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-green-200 to-green-500">
      <div className="bg-white p-8 rounded-lg shadow-lg w-96">
        <h2 className="text-center text-2xl font-semibold text-green-600 mb-4">Login</h2>

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

import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  FaUser,
  FaIdCard,
  FaPhone,
  FaEnvelope,
  FaBuilding,
  FaMapMarker,
  FaSeedling,
  FaCalendarAlt,
  FaMoneyBill,
  FaTruck,
  FaEdit,
  FaTrash,
} from "react-icons/fa";

// Helper functions for authentication token and headers
const getAuthToken = () => localStorage.getItem("token");

const getHeaders = () => {
  const token = getAuthToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
};

const ClientInformationForm = () => {
  const [formData, setFormData] = useState({
    userId: "",
    names: "",
    id: "",
    phoneNumber: "",
    email: "",
    cooperativeName: "",
    location: "",
    productType: "",
    plantTime: "",
    harvestTime: "",
    priceSoldAt: "",
    needLogistic: false,
    image: null,
  });

  const [products, setProducts] = useState([]);
  const [editMode, setEditMode] = useState(false);
  const [editProductId, setEditProductId] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);

  // Effect to load current user and fetch products
  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("currentUser"));
    setCurrentUser(user);
    if (user) {
      setFormData((prevData) => ({
        ...prevData,
        userId: user._id,
      }));
      fetchProducts(user._id);
    }
  }, []);

  // Function to fetch products for the current user
  const fetchProducts = async (userId) => {
    try {
      const response = await axios.get(
        `http://localhost:5000/api/clientproducts/user/${userId}`,
        { headers: getHeaders() }
      );
      setProducts(response.data);
    } catch (error) {
      console.error("Error fetching products:", error);
      alert("Error fetching products. Please try again.");
    }
  };

  // Handler for input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  // Handler for file input change
  const handleFileChange = (e) => {
    setFormData((prevData) => ({
      ...prevData,
      image: e.target.files[0],
    }));
  };

  // Handler for checkbox change
  const handleCheckboxChange = (e) => {
    const { name, checked } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: checked,
    }));
  };

  // Handler for form submission (add/edit product)
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!currentUser) {
      alert("User not authenticated!");
      return;
    }
  
    const data = new FormData();
    
    // Only append userId once
    Object.keys(formData).forEach((key) => {
      if (key === "image" && formData[key] instanceof File) {
        data.append("image", formData[key]);
      } else if (key !== "image" && key !== "userId") { // Skip userId here
        const value = formData[key] === true ? "true" : formData[key] === false ? "false" : formData[key];
        data.append(key, value);
      }
    });
  
    // Add userId separately
    data.append("userId", currentUser._id.toString());
  
    try {
      const config = {
        headers: {
          ...getHeaders(),
          "Content-Type": "multipart/form-data",
        },
      };
  
      if (editMode) {
        await axios.put(
          `http://localhost:5000/api/clientproducts/${editProductId}`,
          data,
          config
        );
      } else {
        await axios.post("http://localhost:5000/api/clientproducts", data, config);
      }
  
      // Reset form data
      setFormData({
        userId: currentUser._id,
        names: "",
        id: "",
        phoneNumber: "",
        email: "",
        cooperativeName: "",
        location: "",
        productType: "",
        plantTime: "",
        harvestTime: "",
        priceSoldAt: "",
        needLogistic: false,
        image: null,
      });
      setEditMode(false);
      setEditProductId(null);
      fetchProducts(currentUser._id);
    } catch (error) {
      console.error("Error submitting form:", error);
      alert(`Error: ${error.response?.data?.message || error.message}`);
    }
  };

  // Handler for editing a product
  const handleEdit = (product) => {
    setFormData({
      userId: currentUser._id,
      names: product.names,
      id: product.id,
      phoneNumber: product.phoneNumber,
      email: product.email,
      cooperativeName: product.cooperativeName,
      location: product.location,
      productType: product.productType,
      plantTime: product.plantTime,
      harvestTime: product.harvestTime,
      priceSoldAt: product.priceSoldAt,
      needLogistic: product.needLogistic,
      image: null, 
    });
    setEditMode(true);
    setEditProductId(product._id);
  };

  // Handler for deleting a product
  const handleDelete = async (id) => {
    try {
      await axios.delete(`http://localhost:5000/api/clientproducts/${id}`, {
        headers: getHeaders(),
      });
      fetchProducts(currentUser._id);
      alert("Product deleted successfully!");
    } catch (error) {
      console.error("Error deleting product:", error);
      alert("Error deleting product. Please try again.");
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="max-w-xxl w-full mx-auto p-6 bg-white shadow-lg rounded-xl border border-gray-200">
        <h2 className="text-3xl font-extrabold text-center text-gray-800 mb-8">
          {editMode ? "Edit Product Information" : "Add Your Product Details"}
        </h2>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Form fields grouped for better layout */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Names */}
            <div className="relative">
              <label htmlFor="names" className="block text-sm font-medium text-gray-700 mb-1">
                Names
              </label>
              <div className="flex items-center border border-gray-300 rounded-lg shadow-sm focus-within:border-blue-500 focus-within:ring-1 focus-within:ring-blue-500 transition-all duration-200">
                <FaUser className="absolute left-3 text-gray-400" />
                <input
                  type="text"
                  id="names"
                  name="names"
                  value={formData.names}
                  onChange={handleChange}
                  placeholder="Enter your full name"
                  className="w-full pl-10 pr-3 py-2 bg-transparent rounded-lg focus:outline-none text-gray-800"
                  required
                />
              </div>
            </div>

            {/* ID */}
            <div className="relative">
              <label htmlFor="id" className="block text-sm font-medium text-gray-700 mb-1">
                ID
              </label>
              <div className="flex items-center border border-gray-300 rounded-lg shadow-sm focus-within:border-blue-500 focus-within:ring-1 focus-within:ring-blue-500 transition-all duration-200">
                <FaIdCard className="absolute left-3 text-gray-400" />
                <input
                  type="text"
                  id="id"
                  name="id"
                  value={formData.id}
                  onChange={handleChange}
                  placeholder="Enter your ID"
                  className="w-full pl-10 pr-3 py-2 bg-transparent rounded-lg focus:outline-none text-gray-800"
                  required
                />
              </div>
            </div>

            {/* Phone Number */}
            <div className="relative">
              <label htmlFor="phoneNumber" className="block text-sm font-medium text-gray-700 mb-1">
                Phone Number
              </label>
              <div className="flex items-center border border-gray-300 rounded-lg shadow-sm focus-within:border-blue-500 focus-within:ring-1 focus-within:ring-blue-500 transition-all duration-200">
                <FaPhone className="absolute left-3 text-gray-400" />
                <input
                  type="tel"
                  id="phoneNumber"
                  name="phoneNumber"
                  value={formData.phoneNumber}
                  onChange={handleChange}
                  placeholder="e.g., +2507XXXXXXXX"
                  className="w-full pl-10 pr-3 py-2 bg-transparent rounded-lg focus:outline-none text-gray-800"
                  required
                />
              </div>
            </div>

            {/* Email */}
            <div className="relative">
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <div className="flex items-center border border-gray-300 rounded-lg shadow-sm focus-within:border-blue-500 focus-within:ring-1 focus-within:ring-blue-500 transition-all duration-200">
                <FaEnvelope className="absolute left-3 text-gray-400" />
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="Enter your email"
                  className="w-full pl-10 pr-3 py-2 bg-transparent rounded-lg focus:outline-none text-gray-800"
                  required
                />
              </div>
            </div>

            {/* Cooperative Name */}
            <div className="relative">
              <label htmlFor="cooperativeName" className="block text-sm font-medium text-gray-700 mb-1">
                Cooperative Name
              </label>
              <div className="flex items-center border border-gray-300 rounded-lg shadow-sm focus-within:border-blue-500 focus-within:ring-1 focus-within:ring-blue-500 transition-all duration-200">
                <FaBuilding className="absolute left-3 text-gray-400" />
                <input
                  type="text"
                  id="cooperativeName"
                  name="cooperativeName"
                  value={formData.cooperativeName}
                  onChange={handleChange}
                  placeholder="Enter cooperative name"
                  className="w-full pl-10 pr-3 py-2 bg-transparent rounded-lg focus:outline-none text-gray-800"
                  required
                />
              </div>
            </div>

            {/* Location */}
            <div className="relative">
              <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-1">
                Location
              </label>
              <div className="flex items-center border border-gray-300 rounded-lg shadow-sm focus-within:border-blue-500 focus-within:ring-1 focus-within:ring-blue-500 transition-all duration-200">
                <FaMapMarker className="absolute left-3 text-gray-400" />
                <input
                  type="text"
                  id="location"
                  name="location"
                  value={formData.location}
                  onChange={handleChange}
                  placeholder="Enter your location"
                  className="w-full pl-10 pr-3 py-2 bg-transparent rounded-lg focus:outline-none text-gray-800"
                  required
                />
              </div>
            </div>

            {/* Type of Product */}
            <div className="relative">
              <label htmlFor="productType" className="block text-sm font-medium text-gray-700 mb-1">
                Type of Product
              </label>
              <div className="flex items-center border border-gray-300 rounded-lg shadow-sm focus-within:border-blue-500 focus-within:ring-1 focus-within:ring-blue-500 transition-all duration-200">
                <FaSeedling className="absolute left-3 text-gray-400" />
                <input
                  type="text"
                  id="productType"
                  name="productType"
                  value={formData.productType}
                  onChange={handleChange}
                  placeholder="e.g., Maize, Beans"
                  className="w-full pl-10 pr-3 py-2 bg-transparent rounded-lg focus:outline-none text-gray-800"
                  required
                />
              </div>
            </div>

            {/* Time You Plant */}
            <div className="relative">
              <label htmlFor="plantTime" className="block text-sm font-medium text-gray-700 mb-1">
                Time You Plant
              </label>
              <div className="flex items-center border border-gray-300 rounded-lg shadow-sm focus-within:border-blue-500 focus-within:ring-1 focus-within:ring-blue-500 transition-all duration-200">
                <FaCalendarAlt className="absolute left-3 text-gray-400" />
                <input
                  type="date"
                  id="plantTime"
                  name="plantTime"
                  value={formData.plantTime}
                  onChange={handleChange}
                  className="w-full pl-10 pr-3 py-2 bg-transparent rounded-lg focus:outline-none text-gray-800"
                  required
                />
              </div>
            </div>

            {/* Time You Harvest */}
            <div className="relative">
              <label htmlFor="harvestTime" className="block text-sm font-medium text-gray-700 mb-1">
                Time You Harvest
              </label>
              <div className="flex items-center border border-gray-300 rounded-lg shadow-sm focus-within:border-blue-500 focus-within:ring-1 focus-within:ring-blue-500 transition-all duration-200">
                <FaCalendarAlt className="absolute left-3 text-gray-400" />
                <input
                  type="date"
                  id="harvestTime"
                  name="harvestTime"
                  value={formData.harvestTime}
                  onChange={handleChange}
                  className="w-full pl-10 pr-3 py-2 bg-transparent rounded-lg focus:outline-none text-gray-800"
                  required
                />
              </div>
            </div>

            {/* Price Sold At */}
            <div className="relative">
              <label htmlFor="priceSoldAt" className="block text-sm font-medium text-gray-700 mb-1">
                Price Sold At
              </label>
              <div className="flex items-center border border-gray-300 rounded-lg shadow-sm focus-within:border-blue-500 focus-within:ring-1 focus-within:ring-blue-500 transition-all duration-200">
                <FaMoneyBill className="absolute left-3 text-gray-400" />
                <input
                  type="number"
                  id="priceSoldAt"
                  name="priceSoldAt"
                  value={formData.priceSoldAt}
                  onChange={handleChange}
                  placeholder="Enter price (e.g., 5000)"
                  className="w-full pl-10 pr-3 py-2 bg-transparent rounded-lg focus:outline-none text-gray-800"
                  required
                />
              </div>
            </div>
          </div>

          {/* Do You Need Logistic */}
          <div className="flex items-center space-x-3 pt-2">
            <input
              type="checkbox"
              id="needLogistic"
              name="needLogistic"
              checked={formData.needLogistic}
              onChange={handleCheckboxChange}
              className="h-5 w-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500 cursor-pointer"
            />
            <label htmlFor="needLogistic" className="text-sm font-medium text-gray-700 flex items-center">
              <FaTruck className="text-gray-500 mr-2" /> Do You Need Logistic?
            </label>
          </div>

          {/* Image Upload */}
          <div className="relative">
            <label htmlFor="image" className="block text-sm font-medium text-gray-700 mb-1">
              Product Image
            </label>
            <input
              type="file"
              id="image"
              name="image"
              onChange={handleFileChange}
              className="w-full text-gray-700 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 cursor-pointer border border-gray-300 rounded-lg shadow-sm p-2"
            />
          </div>

          {/* Submit Button */}
          <div>
            <button
              type="submit"
              className="w-full bg-green-600 text-white font-semibold p-3 rounded-lg hover:bg-green-700 transition duration-300 ease-in-out shadow-md hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-opacity-50"
            >
              {editMode ? "Update Product" : "Submit Product"}
            </button>
          </div>
        </form>

        {/* Display Products Section */}
        <div className="mt-12 pt-8 border-t border-gray-200">
          <h3 className="text-2xl font-extrabold text-gray-800 mb-6 text-center">Your Listed Products</h3>
          {products.length === 0 ? (
            <p className="text-center text-gray-500">No products added yet.</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {products.map((product) => (
                <div
                  key={product._id}
                  className="bg-white p-5 border border-gray-200 rounded-lg shadow-md flex flex-col justify-between hover:shadow-lg transition-shadow duration-200"
                >
                  <div>
                    <h4 className="text-lg font-bold text-gray-900 mb-1 flex items-center">
                      <FaSeedling className="mr-2 text-green-600" />
                      {product.productType}
                    </h4>
                    <p className="text-sm text-gray-600 mb-2">
                      <FaUser className="inline mr-1" /> {product.names}
                    </p>
                    <p className="text-sm text-gray-600 mb-2">
                      <FaMapMarker className="inline mr-1" /> {product.location}
                    </p>
                    <p className="text-sm text-gray-600 mb-2">
                      <FaMoneyBill className="inline mr-1" /> Price: rwf{product.priceSoldAt}
                    </p>
                    {product.image && (
                      <div className="mt-3">
                        <img
                          src={`http://localhost:5000/${product.image}`}
                          alt={product.productType}
                          className="w-full h-32 object-cover rounded-md border border-gray-200"
                        />
                      </div>
                    )}
                  </div>
                  {/* <div className="flex space-x-3 mt-4 justify-end">
                    <button
                      onClick={() => handleEdit(product)}
                      className="p-2 text-blue-600 hover:text-blue-800 bg-blue-50 hover:bg-blue-100 rounded-full transition-colors duration-200"
                      title="Edit Product"
                    >
                      <FaEdit className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => handleDelete(product._id)}
                      className="p-2 text-red-600 hover:text-red-800 bg-red-50 hover:bg-red-100 rounded-full transition-colors duration-200"
                      title="Delete Product"
                    >
                      <FaTrash className="w-5 h-5" />
                    </button>
                  </div> */}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ClientInformationForm;
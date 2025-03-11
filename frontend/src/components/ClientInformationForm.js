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

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("currentUser"));
    setCurrentUser(user);
    if (user) {
      setFormData(prevData => ({
        ...prevData,
        userId: user._id
      }));
      fetchProducts(user._id);
    }
  }, []);

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

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevData => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleFileChange = (e) => {
    setFormData(prevData => ({
      ...prevData,
      image: e.target.files[0],
    }));
  };

  const handleCheckboxChange = (e) => {
    const { name, checked } = e.target;
    setFormData(prevData => ({
      ...prevData,
      [name]: checked,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!currentUser) {
      alert("User not authenticated!");
      return;
    }

    const data = new FormData();
    data.append('userId', currentUser._id.toString());

    Object.keys(formData).forEach(key => {
      if (key === 'image' && formData[key] instanceof File) {
        data.append('image', formData[key]);
      } else if (key !== 'image') {
        const value = key === 'userId' ? currentUser._id.toString() :
                      formData[key] === true ? 'true' : 
                      formData[key] === false ? 'false' : 
                      formData[key];
        data.append(key, value);
      }
    });

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
        await axios.post(
          "http://localhost:5000/api/clientproducts",
          data,
          config
        );
      }

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
      image: product.image
    });
    setEditMode(true);
    setEditProductId(product._id);
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`http://localhost:5000/api/clientproducts/${id}`, {
        headers: getHeaders()
      });
      fetchProducts(currentUser._id);
      alert("Product deleted successfully!");
    } catch (error) {
      console.error("Error deleting product:", error);
      alert("Error deleting product. Please try again.");
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white shadow-lg rounded-lg">
      <h2 className="text-3xl font-bold text-center text-gray-800 mb-6">
        {editMode ? "Edit Product" : "Add Your Product"}
      </h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Names */}
        <div className="relative">
          <label htmlFor="names" className="block text-gray-700 mb-1">
            Names
          </label>
          <div className="flex items-center">
            <FaUser className="absolute left-3 text-gray-400" />
            <input
              type="text"
              id="names"
              name="names"
              value={formData.names}
              onChange={handleChange}
              placeholder="Enter your full name"
              className="w-full pl-10 p-2 border border-gray-300 rounded-md hover:border-blue-500 focus:outline-none focus:border-blue-500"
              required
            />
          </div>
        </div>

        {/* ID */}
        <div className="relative">
          <label htmlFor="id" className="block text-gray-700 mb-1">
            ID
          </label>
          <div className="flex items-center">
            <FaIdCard className="absolute left-3 text-gray-400" />
            <input
              type="text"
              id="id"
              name="id"
              value={formData.id}
              onChange={handleChange}
              placeholder="Enter your ID"
              className="w-full pl-10 p-2 border border-gray-300 rounded-md hover:border-blue-500 focus:outline-none focus:border-blue-500"
              required
            />
          </div>
        </div>

        {/* Phone Number */}
        <div className="relative">
          <label htmlFor="phoneNumber" className="block text-gray-700 mb-1">
            Phone Number
          </label>
          <div className="flex items-center">
            <FaPhone className="absolute left-3 text-gray-400" />
            <input
              type="tel"
              id="phoneNumber"
              name="phoneNumber"
              value={formData.phoneNumber}
              onChange={handleChange}
              placeholder="Enter your phone number"
              className="w-full pl-10 p-2 border border-gray-300 rounded-md hover:border-blue-500 focus:outline-none focus:border-blue-500"
              required
            />
          </div>
        </div>

        {/* Email */}
        <div className="relative">
          <label htmlFor="email" className="block text-gray-700 mb-1">
            Email
          </label>
          <div className="flex items-center">
            <FaEnvelope className="absolute left-3 text-gray-400" />
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Enter your email"
              className="w-full pl-10 p-2 border border-gray-300 rounded-md hover:border-blue-500 focus:outline-none focus:border-blue-500"
              required
            />
          </div>
        </div>

        {/* Cooperative Name */}
        <div className="relative">
          <label htmlFor="cooperativeName" className="block text-gray-700 mb-1">
            Cooperative Name
          </label>
          <div className="flex items-center">
            <FaBuilding className="absolute left-3 text-gray-400" />
            <input
              type="text"
              id="cooperativeName"
              name="cooperativeName"
              value={formData.cooperativeName}
              onChange={handleChange}
              placeholder="Enter cooperative name"
              className="w-full pl-10 p-2 border border-gray-300 rounded-md hover:border-blue-500 focus:outline-none focus:border-blue-500"
              required
            />
          </div>
        </div>

        {/* Location */}
        <div className="relative">
          <label htmlFor="location" className="block text-gray-700 mb-1">
            Location
          </label>
          <div className="flex items-center">
            <FaMapMarker className="absolute left-3 text-gray-400" />
            <input
              type="text"
              id="location"
              name="location"
              value={formData.location}
              onChange={handleChange}
              placeholder="Enter your location"
              className="w-full pl-10 p-2 border border-gray-300 rounded-md hover:border-blue-500 focus:outline-none focus:border-blue-500"
              required
            />
          </div>
        </div>

        {/* Type of Product */}
        <div className="relative">
          <label htmlFor="productType" className="block text-gray-700 mb-1">
            Type of Product
          </label>
          <div className="flex items-center">
            <FaSeedling className="absolute left-3 text-gray-400" />
            <input
              type="text"
              id="productType"
              name="productType"
              value={formData.productType}
              onChange={handleChange}
              placeholder="Enter product type"
              className="w-full pl-10 p-2 border border-gray-300 rounded-md hover:border-blue-500 focus:outline-none focus:border-blue-500"
              required
            />
          </div>
        </div>

        {/* Time You Plant */}
        <div className="relative">
          <label htmlFor="plantTime" className="block text-gray-700 mb-1">
            Time You Plant
          </label>
          <div className="flex items-center">
            <FaCalendarAlt className="absolute left-3 text-gray-400" />
            <input
              type="date"
              id="plantTime"
              name="plantTime"
              value={formData.plantTime}
              onChange={handleChange}
              className="w-full pl-10 p-2 border border-gray-300 rounded-md hover:border-blue-500 focus:outline-none focus:border-blue-500"
              required
            />
          </div>
        </div>

        {/* Time You Harvest */}
        <div className="relative">
          <label htmlFor="harvestTime" className="block text-gray-700 mb-1">
            Time You Harvest
          </label>
          <div className="flex items-center">
            <FaCalendarAlt className="absolute left-3 text-gray-400" />
            <input
              type="date"
              id="harvestTime"
              name="harvestTime"
              value={formData.harvestTime}
              onChange={handleChange}
              className="w-full pl-10 p-2 border border-gray-300 rounded-md hover:border-blue-500 focus:outline-none focus:border-blue-500"
              required
            />
          </div>
        </div>

        {/* Price Sold At */}
        <div className="relative">
          <label htmlFor="priceSoldAt" className="block text-gray-700 mb-1">
            Price Sold At
          </label>
          <div className="flex items-center">
            <FaMoneyBill className="absolute left-3 text-gray-400" />
            <input
              type="number"
              id="priceSoldAt"
              name="priceSoldAt"
              value={formData.priceSoldAt}
              onChange={handleChange}
              placeholder="Enter price"
              className="w-full pl-10 p-2 border border-gray-300 rounded-md hover:border-blue-500 focus:outline-none focus:border-blue-500"
              required
            />
          </div>
        </div>

        {/* Do You Need Logistic */}
        <div className="flex items-center">
          <FaTruck className="text-gray-400 mr-2" />
          <label htmlFor="needLogistic" className="block text-gray-700">
            Do You Need Logistic?
          </label>
          <input
            type="checkbox"
            id="needLogistic"
            name="needLogistic"
            checked={formData.needLogistic}
            onChange={handleCheckboxChange}
            className="ml-2 w-4 h-4"
          />
        </div>

        {/* Image Upload */}
        <div className="relative">
          <label htmlFor="image" className="block text-gray-700 mb-1">
            Product Image
          </label>
          <input
            type="file"
            id="image"
            name="image"
            onChange={handleFileChange}
            className="w-full p-2 border border-gray-300 rounded-md hover:border-blue-500 focus:outline-none focus:border-blue-500"
          />
        </div>

        {/* Submit Button */}
        <div>
          <button
            type="submit"
            className="w-full bg-green-500 text-white p-3 rounded-md hover:bg-blue-600 transition duration-300"
          >
            {editMode ? "Update Product" : "Submit"}
          </button>
        </div>
      </form>

      {/* Display Products */}
      <div className="mt-8">
        <h3 className="text-2xl font-bold text-gray-800 mb-4">Product List</h3>
        <div className="space-y-4">
          {products.map((product) => (
            <div key={product._id} className="p-4 border border-gray-300 rounded-md">
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-lg font-semibold">{product.names}</p>
                  <p className="text-gray-600">{product.productType}</p>
                  {product.image && (
                    <img
                      src={`http://localhost:5000/${product.image}`}
                      alt={product.names}
                      className="mt-2 w-24 h-24 object-cover"
                    />
                  )}
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => handleEdit(product)}
                    className="text-green-500 hover:text-green-700"
                  >
                    <FaEdit />
                  </button>
                  <button
                    onClick={() => handleDelete(product._id)}
                    className="text-red-500 hover:text-red-700"
                  >
                    <FaTrash />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ClientInformationForm;
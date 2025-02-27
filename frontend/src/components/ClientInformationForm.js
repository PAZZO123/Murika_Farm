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

const ClientInformationForm = () => {
  // State for form data
  const [formData, setFormData] = useState({
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
    image: null, // For file upload
  });

  const [products, setProducts] = useState([]); // State to store all products
  const [editMode, setEditMode] = useState(false); // State to toggle edit mode
  const [editProductId, setEditProductId] = useState(null); // State to store the ID of the product being edited

  // Fetch all products on component mount
  useEffect(() => {
    fetchProducts();
  }, []);

  // Fetch all products from the backend
  const fetchProducts = async () => {
    try {
      const response = await axios.get("http://localhost:5000/api/clientproducts");
      setProducts(response.data);
    } catch (error) {
      console.error("Error fetching products:", error);
      alert("Error fetching products. Please try again.");
    }
  };

  // Handle input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  // Handle file input changes
  const handleFileChange = (e) => {
    setFormData((prevData) => ({
      ...prevData,
      image: e.target.files[0], // Store the selected file
    }));
  };

  // Handle checkbox changes
  const handleCheckboxChange = (e) => {
    const { name, checked } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: checked,
    }));
  };
  // Handle form submission (Create or Update)
  // Fix handleSubmit function
  // Update the handleSubmit function
  const handleSubmit = async (e) => {
    e.preventDefault();
    const data = new FormData();
    // Append all non-file fields
    Object.keys(formData).forEach(key => {
      if (key !== 'image') {
        data.append(key, formData[key]);
      }
    });
  
    // Only append image if a new one is selected
    if (formData.image instanceof File) {
      data.append('image', formData.image);
    }
  try {
    if (editMode) {
      // Update existing product
      const response = await axios.put(
        `http://localhost:5000/api/clientproducts/${editProductId}`,
        data,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );
      
      // Update the products list with the updated item
      setProducts(products.map(product => 
        product._id === editProductId ? response.data : product
      ));
      alert("Product updated successfully!");
    } else {
      // Create new product
      const response = await axios.post(
        "http://localhost:5000/api/clientproducts",
        data,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );
      // Add new product to the list
      setProducts([...products, response.data]);
      alert("Product published successfully!");
    }
  // Reset form and fetch updated products
      setFormData({
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
      fetchProducts();
    } catch (error) {
      console.error("Error submitting form:", error);
      alert("Error submitting form. Please try again.");
    }
  };
  // Handle edit button click
  // Fix handleEdit function
  const handleEdit = (product) => {
    setFormData({
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
      image: product.image // Keep the existing image path instead of null
    });
    setEditMode(true);
    setEditProductId(product._id);
  };
  // Handle delete button click
  const handleDelete = async (id) => {
    try {
      await axios.delete(`http://localhost:5000/api/clientproducts/${id}`);
      alert("Product deleted successfully!");
      fetchProducts();
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
              type="text"
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
              type="text"
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
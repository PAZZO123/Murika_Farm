import React, { useState, useEffect } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";
import {
  FaUser,
  FaIdCard,
  FaPhone,
  FaEnvelope,
  FaBuilding,
  FaMapMarkerAlt, // Changed to FaMapMarkerAlt for a slightly different icon
  FaSeedling,
  FaCalendarAlt,
  FaMoneyBillWave, // Changed to FaMoneyBillWave for a more dynamic icon
  FaTruck,
  FaSave,
  FaTimes,
  FaSpinner, // Added for loading indicator
  FaExclamationCircle, // Added for error indicator
} from "react-icons/fa";

// Helper function to get authentication token from localStorage
const getAuthToken = () => localStorage.getItem("token");

// Helper function to prepare headers with authorization token
const getHeaders = () => {
  const token = getAuthToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
};

const EditProduct = () => {
  const { id } = useParams(); // Get product ID from URL parameters
  const navigate = useNavigate(); // Hook for navigation
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
    status: "pending", // Default status
    image: null, // For new image file
    existingImage: "", // To display the current image
  });
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false); // New state for submission loading
  const [error, setError] = useState(null);

  // Effect hook to fetch product details when component mounts or ID changes
  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const response = await axios.get(
          `http://localhost:5000/api/clientproducts/${id}`,
          { headers: getHeaders() }
        );
        const product = response.data;

        // Populate formData with fetched product data
        setFormData({
          names: product.names || "",
          id: product.id || "",
          phoneNumber: product.phoneNumber || "",
          email: product.email || "",
          cooperativeName: product.cooperativeName || "",
          location: product.location || "",
          productType: product.productType || "",
          // Format dates to 'YYYY-MM-DD' for date input type
          plantTime: product.plantTime ? product.plantTime.split("T")[0] : "",
          harvestTime: product.harvestTime
            ? product.harvestTime.split("T")[0]
            : "",
          priceSoldAt: product.priceSoldAt || "",
          needLogistic: product.needLogistic || false,
          status: product.status || "pending",
          image: null, // Ensure image is null for new upload
          existingImage: product.image || "", // Store existing image path
        });
        setLoading(false); // End loading
      } catch (err) {
        console.error("Error fetching product:", err);
        setError("Failed to load product details for editing. Please try again.");
        setLoading(false);
      }
    };

    fetchProduct(); // Call the fetch function
  }, [id]); // Dependency array includes 'id'

  // Handler for text and select input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  // Handler for file input changes
  const handleFileChange = (e) => {
    setFormData((prevData) => ({
      ...prevData,
      image: e.target.files[0], // Store the selected file object
    }));
  };

  // Handler for checkbox changes
  const handleCheckboxChange = (e) => {
    const { name, checked } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: checked,
    }));
  };

  // Handler for form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true); // Start submission loading
    setError(null); // Clear previous errors

    const data = new FormData(); // Create FormData object for multipart/form-data

    // Append all form data fields
    Object.keys(formData).forEach((key) => {
      if (key === "image" && formData[key] instanceof File) {
        data.append("image", formData[key]); // Append new image file
      } else if (key !== "existingImage" && key !== "image") {
        // Exclude existingImage and the image File object itself
        // Convert boolean to string for FormData if needed, though Axios handles booleans
        const value =
          typeof formData[key] === "boolean"
            ? formData[key].toString()
            : formData[key];
        data.append(key, value);
      }
    });

    try {
      const config = {
        headers: {
          ...getHeaders(), // Include authorization token
          "Content-Type": "multipart/form-data", // Set content type for file upload
        },
      };

      await axios.put(
        `http://localhost:5000/api/clientproducts/${id}`,
        data,
        config
      );
      alert("Product updated successfully!");
      navigate(`/dashboard/products/${id}`); // Navigate to product detail page after successful update
    } catch (err) {
      console.error("Error updating product:", err);
      // Display specific error message from backend if available
      setError(`Error updating product: ${err.response?.data?.message || err.message}`);
    } finally {
      setSubmitting(false); // End submission loading
    }
  };

  // Loading state rendering for initial data fetch
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100 p-6">
        <div className="flex flex-col items-center text-gray-600">
          <FaSpinner className="animate-spin text-4xl mb-3" />
          <p className="text-lg">Loading product details...</p>
        </div>
      </div>
    );
  }

  // Error state rendering
  if (error && !loading) { // Show error if not loading and an error exists
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100 p-6">
        <div className="flex flex-col items-center text-red-600">
          <FaExclamationCircle className="text-4xl mb-3" />
          <p className="text-lg">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center py-10 px-4">
      <div className="max-w-4xl w-full bg-white rounded-xl shadow-lg p-8 md:p-10 border border-gray-200">
        <h1 className="text-3xl font-extrabold text-gray-900 text-center mb-8">
          Edit Product Listing
        </h1>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Grid for two-column layout on medium screens and up */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
            {/* Names */}
            <div className="relative">
              <label
                htmlFor="names"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Full Name
              </label>
              <div className="relative">
                <FaUser className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  id="names"
                  name="names"
                  value={formData.names}
                  onChange={handleChange}
                  className="w-full pl-12 pr-4 py-2.5 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
                  required
                />
              </div>
            </div>

            {/* ID */}
            <div className="relative">
              <label
                htmlFor="id"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Client ID
              </label>
              <div className="relative">
                <FaIdCard className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  id="id"
                  name="id"
                  value={formData.id}
                  onChange={handleChange}
                  className="w-full pl-12 pr-4 py-2.5 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
                  required
                />
              </div>
            </div>

            {/* Phone Number */}
            <div className="relative">
              <label
                htmlFor="phoneNumber"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Phone Number
              </label>
              <div className="relative">
                <FaPhone className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="tel"
                  id="phoneNumber"
                  name="phoneNumber"
                  value={formData.phoneNumber}
                  onChange={handleChange}
                  className="w-full pl-12 pr-4 py-2.5 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
                  required
                />
              </div>
            </div>

            {/* Email */}
            <div className="relative">
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Email
              </label>
              <div className="relative">
                <FaEnvelope className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full pl-12 pr-4 py-2.5 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
                  required
                />
              </div>
            </div>

            {/* Cooperative Name */}
            <div className="relative">
              <label
                htmlFor="cooperativeName"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Cooperative Name
              </label>
              <div className="relative">
                <FaBuilding className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  id="cooperativeName"
                  name="cooperativeName"
                  value={formData.cooperativeName}
                  onChange={handleChange}
                  className="w-full pl-12 pr-4 py-2.5 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
                  required
                />
              </div>
            </div>

            {/* Location */}
            <div className="relative">
              <label
                htmlFor="location"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Location
              </label>
              <div className="relative">
                <FaMapMarkerAlt className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  id="location"
                  name="location"
                  value={formData.location}
                  onChange={handleChange}
                  className="w-full pl-12 pr-4 py-2.5 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
                  required
                />
              </div>
            </div>

            {/* Type of Product */}
            <div className="relative">
              <label
                htmlFor="productType"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Type of Product
              </label>
              <div className="relative">
                <FaSeedling className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  id="productType"
                  name="productType"
                  value={formData.productType}
                  onChange={handleChange}
                  className="w-full pl-12 pr-4 py-2.5 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
                  required
                />
              </div>
            </div>

            {/* Time You Plant */}
            <div className="relative">
              <label
                htmlFor="plantTime"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Planting Date
              </label>
              <div className="relative">
                <FaCalendarAlt className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="date"
                  id="plantTime"
                  name="plantTime"
                  value={formData.plantTime}
                  onChange={handleChange}
                  className="w-full pl-12 pr-4 py-2.5 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
                  required
                />
              </div>
            </div>

            {/* Time You Harvest */}
            <div className="relative">
              <label
                htmlFor="harvestTime"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Harvest Date
              </label>
              <div className="relative">
                <FaCalendarAlt className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="date"
                  id="harvestTime"
                  name="harvestTime"
                  value={formData.harvestTime}
                  onChange={handleChange}
                  className="w-full pl-12 pr-4 py-2.5 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
                  required
                />
              </div>
            </div>

            {/* Price Sold At */}
            <div className="relative">
              <label
                htmlFor="priceSoldAt"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Price (USD)
              </label>
              <div className="relative">
                <FaMoneyBillWave className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="number"
                  id="priceSoldAt"
                  name="priceSoldAt"
                  value={formData.priceSoldAt}
                  onChange={handleChange}
                  className="w-full pl-12 pr-4 py-2.5 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
                  required
                />
              </div>
            </div>

            {/* Do You Need Logistic */}
            <div className="flex items-center mt-3 col-span-1 md:col-span-2">
              <input
                type="checkbox"
                id="needLogistic"
                name="needLogistic"
                checked={formData.needLogistic}
                onChange={handleCheckboxChange}
                className="h-5 w-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <label htmlFor="needLogistic" className="ml-3 text-sm font-medium text-gray-700 flex items-center">
                <FaTruck className="mr-2 text-xl text-gray-500" /> Do You Need Logistic?
              </label>
            </div>

            {/* Status (Admin/specific roles might adjust this) */}
            <div className="relative col-span-1 md:col-span-2">
              <label
                htmlFor="status"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Status
              </label>
              <select
                id="status"
                name="status"
                value={formData.status}
                onChange={handleChange}
                className="w-full p-2.5 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors appearance-none bg-white bg-no-repeat bg-right-center"
                style={{ backgroundImage: `url("data:image/svg+xml;charset=UTF-8,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 20 20'%3E%3Cpath fill='%236B7280' d='M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 6.757 7.586 5.343 9l4.95 4.95z'/%3E%3C/svg%3E")`, backgroundPosition: 'right 0.75rem center', backgroundSize: '0.8em 0.8em' }}
              >
                <option value="pending">Pending</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
                <option value="sold">Sold</option>
              </select>
            </div>

            {/* Image Upload */}
            <div className="relative col-span-1 md:col-span-2">
              <label
                htmlFor="image"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Product Image
              </label>
              {formData.existingImage && (
                <div className="mb-3">
                  <p className="text-xs text-gray-500 mb-1">Current Image:</p>
                  <img
                    src={`http://localhost:5000/${formData.existingImage}`}
                    alt="Current product"
                    className="w-28 h-28 object-cover rounded-md border border-gray-200 shadow-sm"
                  />
                </div>
              )}
              <input
                type="file"
                id="image"
                name="image"
                onChange={handleFileChange}
                className="w-full p-2.5 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 transition-colors"
              />
              <p className="mt-2 text-xs text-gray-500">
                Upload a new image to replace the current one.
              </p>
            </div>
          </div>

          {/* Buttons */}
          <div className="flex justify-end space-x-4 pt-6 border-t border-gray-100">
            <button
              type="button"
              onClick={() => navigate(`/dashboard/products/${id}`)}
              className="inline-flex items-center px-6 py-3 border border-gray-300 text-gray-700 font-semibold rounded-lg shadow-sm hover:bg-gray-50 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-400"
            >
              <FaTimes className="mr-2 text-lg" /> Cancel
            </button>
            <button
              type="submit"
              className={`inline-flex items-center px-6 py-3 border border-transparent text-white font-semibold rounded-lg shadow-md transition-all duration-300 ease-in-out
                ${
                  submitting
                    ? "bg-blue-400 cursor-not-allowed"
                    : "bg-blue-600 hover:bg-blue-700 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                }`}
              disabled={submitting}
            >
              {submitting ? (
                <>
                  <FaSpinner className="animate-spin mr-3 text-xl" /> Saving...
                </>
              ) : (
                <>
                  <FaSave className="mr-3 text-xl" /> Save Changes
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditProduct;
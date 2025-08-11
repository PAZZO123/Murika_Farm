import React, { useState, useEffect } from "react";
import axios from "axios";
import { useParams, Link } from "react-router-dom";
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
  FaArrowLeft,
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

const ProductDetail = () => {
  const { id } = useParams(); // Get product ID from URL parameters
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Effect hook to fetch product details when component mounts or ID changes
  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const response = await axios.get(
          `http://localhost:5000/api/clientproducts/${id}`,
          { headers: getHeaders() } // Include authentication headers
        );
        setProduct(response.data); // Set fetched product data
        setLoading(false); // Set loading to false
      } catch (err) {
        console.error("Error fetching product:", err);
        setError("Failed to load product details. Please try again later."); // Set user-friendly error message
        setLoading(false); // Set loading to false
      }
    };

    fetchProduct(); // Call the fetch function
  }, [id]); // Dependency array includes 'id' to refetch if ID changes

  // Loading state rendering
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
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100 p-6">
        <div className="flex flex-col items-center text-red-600">
          <FaExclamationCircle className="text-4xl mb-3" />
          <p className="text-lg">{error}</p>
        </div>
      </div>
    );
  }

  // No product found state rendering
  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100 p-6">
        <div className="text-center text-gray-600">
          <p className="text-lg">Product not found.</p>
          <Link
            to="/products"
            className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <FaArrowLeft className="mr-2" /> Back to Products
          </Link>
        </div>
      </div>
    );
  }

  // Main component rendering
  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center py-10 px-4">
      <div className="max-w-5xl w-full bg-white rounded-xl shadow-lg p-8 md:p-10 border border-gray-200">
        {/* Back Button */}
        <Link
          to="/dashboard/products"
          className="inline-flex items-center text-blue-600 hover:text-blue-800 font-medium mb-8 transition-colors duration-200"
        >
          <FaArrowLeft className="mr-2 text-lg" /> Back to All Products
        </Link>

        {/* Product Details Section */}
        <div className="flex flex-col md:flex-row gap-8 md:gap-12 items-start">
          {/* Product Image */}
          {product.image && (
            <div className="md:w-1/2 lg:w-2/5 flex-shrink-0">
              <img
                src={`http://localhost:5000/${product.image}`}
                alt={product.productType || "Product Image"}
                className="w-full h-auto max-h-96 object-contain rounded-lg shadow-md border border-gray-200"
              />
            </div>
          )}

          {/* Product Information */}
          <div className="md:w-1/2 lg:w-3/5 flex-grow">
            <h1 className="text-3xl font-extrabold text-gray-900 mb-3">
              {product.productType || "Unknown Product"}
            </h1>
            <h2 className="text-xl font-semibold text-gray-700 mb-4">
              Listed by: {product.names}
            </h2>

            {/* Status Badge */}
            <span
              className={`px-4 py-1.5 text-sm font-semibold rounded-full capitalize shadow-sm
                ${
                  product.status === "approved"
                    ? "bg-green-100 text-green-700"
                    : product.status === "pending"
                    ? "bg-yellow-100 text-yellow-700"
                    : product.status === "rejected"
                    ? "bg-red-100 text-red-700"
                    : "bg-gray-100 text-gray-700" // Default for unknown status
                }`}
            >
              Status: {product.status}
            </span>

            {/* Details Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-5 mt-8">
              {/* Individual Detail Items */}
              {[
                { label: "Client ID", value: product.id, icon: FaIdCard },
                { label: "Phone Number", value: product.phoneNumber, icon: FaPhone },
                { label: "Email", value: product.email, icon: FaEnvelope },
                { label: "Cooperative", value: product.cooperativeName, icon: FaBuilding },
                { label: "Location", value: product.location, icon: FaMapMarkerAlt },
                { label: "Planting Date", value: new Date(product.plantTime).toLocaleDateString(), icon: FaCalendarAlt },
                { label: "Harvest Date", value: new Date(product.harvestTime).toLocaleDateString(), icon: FaCalendarAlt },
                { label: "Price", value: `rwf${product.priceSoldAt}`, icon: FaMoneyBillWave },
                { label: "Logistic Needed", value: product.needLogistic ? "Yes" : "No", icon: FaTruck },
              ].map((item, index) => (
                <div key={index} className="flex items-start">
                  <item.icon className="text-gray-500 text-xl mr-3 flex-shrink-0 mt-1" />
                  <div>
                    <h3 className="text-xs uppercase font-medium text-gray-500 tracking-wider">
                      {item.label}
                    </h3>
                    <p className="text-gray-800 text-base font-semibold">
                      {item.value}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* Action Buttons */}
            <div className="mt-10 flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
              <Link
                to={`/dashboard/products/edit/${product._id}`}
                className="flex-1 text-center px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Edit Product
              </Link>
              {/* Assuming there's a dashboard or client-specific product list */}
              <Link
                to="/dashboard/products"
                className="flex-1 text-center px-6 py-3 border border-gray-300 text-gray-700 font-semibold rounded-lg shadow-sm hover:bg-gray-50 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-400"
              >
                View My Products
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;
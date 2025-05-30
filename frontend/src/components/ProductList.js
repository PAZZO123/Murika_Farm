import React, { useState, useEffect } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import {
  FaSearch,
  FaFilter,
  FaSeedling,
  FaCalendarAlt,
  FaMoneyBillWave, // Changed to MoneyBillWave for modern look
  FaTruck,
  FaEdit,
  FaMapMarkerAlt, // Changed to MapMarkerAlt for modern look
  FaTrash,
  FaEye,
  FaUser,
  FaIdCard,
  FaPhone,
  FaEnvelope,
  FaBuilding,
  FaSpinner, // Added for loading indicator
  FaExclamationCircle, // Added for error indicator
  FaPlusCircle, // Added for 'Add New Product' button
} from "react-icons/fa";

// Helper function to get authentication token from localStorage
const getAuthToken = () => localStorage.getItem("token");

// Helper function to prepare headers with authorization token
const getHeaders = () => {
  const token = getAuthToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
};

const ProductList = () => {
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);

  // Effect to load current user and fetch products
  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("currentUser"));
    setCurrentUser(user);
    if (user) {
      fetchProducts(user._id);
    } else {
      setLoading(false);
      setError("User not authenticated. Please log in.");
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
      setFilteredProducts(response.data); // Initialize filtered products
      setLoading(false);
    } catch (err) {
      console.error("Error fetching products:", err);
      setError("Error fetching products. Please try again.");
      setLoading(false);
    }
  };

  // Effect to apply filters whenever search term, status filter, or products change
  useEffect(() => {
    let results = products;

    // Apply search filter
    if (searchTerm) {
      results = results.filter(
        (product) =>
          product.names.toLowerCase().includes(searchTerm.toLowerCase()) ||
          product.productType.toLowerCase().includes(searchTerm.toLowerCase()) ||
          product.location.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply status filter
    if (statusFilter !== "all") {
      results = results.filter((product) => product.status === statusFilter);
    }

    setFilteredProducts(results);
  }, [searchTerm, statusFilter, products]); // Dependencies for filtering

  // Handler for deleting a product
  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this product?")) {
      return;
    }
    try {
      await axios.delete(`http://localhost:5000/api/clientproducts/${id}`, {
        headers: getHeaders(),
      });
      // Remove deleted product from both products and filteredProducts state
      setProducts((prevProducts) =>
        prevProducts.filter((product) => product._id !== id)
      );
      setFilteredProducts((prevFilteredProducts) =>
        prevFilteredProducts.filter((product) => product._id !== id)
      );
      alert("Product deleted successfully!");
    } catch (err) {
      console.error("Error deleting product:", err);
      alert("Error deleting product. Please try again.");
    }
  };

  // Loading state rendering
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100 p-6">
        <div className="flex flex-col items-center text-gray-600">
          <FaSpinner className="animate-spin text-4xl mb-3" />
          <p className="text-lg">Loading your products...</p>
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

  return (
    <div className="min-h-screen bg-gray-100 p-6 sm:p-8">
      <div className="max-w-7xl mx-auto bg-white rounded-xl shadow-lg p-6 md:p-8">
        <h1 className="text-4xl font-extrabold text-center text-gray-800 mb-8">
          My Listed Products
        </h1>

        {/* Search and Filter Controls */}
        <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
          <div className="relative w-full md:w-2/3">
            <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search by name, product type, or location..."
              className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="relative w-full md:w-1/3 flex items-center justify-end">
            <FaFilter className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 md:static md:mr-2 md:translate-y-0" />
            <select
              className="w-full md:w-auto pl-10 md:pl-4 pr-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none bg-white bg-no-repeat bg-right-center custom-select transition-all duration-200"
              style={{ backgroundImage: `url("data:image/svg+xml;charset=UTF-8,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 20 20'%3E%3Cpath fill='%236B7280' d='M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 6.757 7.586 5.343 9l4.95 4.95z'/%3E%3C/svg%3E")`, backgroundPosition: 'right 0.75rem center', backgroundSize: '0.8em 0.8em' }}
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="all">All Statuses</option>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
              <option value="sold">Sold</option>
            </select>
          </div>
        </div>

        {/* Add New Product Button */}
        <div className="mb-8 text-center">
          <Link
            to="/dashboard/clienttasks" 
            className="inline-flex items-center px-6 py-3 border border-transparent text-base font-semibold rounded-full shadow-lg text-white bg-green-600 hover:bg-green-700 transition-all duration-300 ease-in-out transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
          >
            <FaPlusCircle className="mr-3 text-xl" /> Add New Product
          </Link>
        </div>


        {/* Products Grid */}
        {filteredProducts.length === 0 ? (
          <div className="text-center py-12 text-gray-600 bg-gray-50 rounded-lg border border-gray-200">
            <p className="text-lg font-medium">
              No products found matching your criteria.
            </p>
            <p className="mt-2 text-sm text-gray-500">
              Try adjusting your search or filters.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredProducts.map((product) => (
              <div
                key={product._id}
                className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-md hover:shadow-lg transform hover:-translate-y-1 transition-all duration-300 flex flex-col"
              >
                {product.image && (
                  <div className="relative h-56 overflow-hidden bg-gray-100 flex items-center justify-center">
                    <img
                      src={`http://localhost:5000/${product.image}`}
                      alt={product.productType || "Product"}
                      className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
                    />
                    <span
                      className={`absolute top-3 right-3 px-3 py-1 text-xs font-bold rounded-full capitalize shadow-sm
                        ${
                          product.status === "approved"
                            ? "bg-green-500 text-white"
                            : product.status === "pending"
                            ? "bg-yellow-500 text-white"
                            : product.status === "rejected"
                            ? "bg-red-500 text-white"
                            : "bg-gray-500 text-white"
                        }`}
                    >
                      {product.status}
                    </span>
                  </div>
                )}
                <div className="p-6 flex-grow flex flex-col justify-between">
                  <div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-2 leading-tight">
                      {product.productType}
                    </h3>
                    <p className="text-lg font-semibold text-green-600 mb-4 flex items-center">
                      <FaMoneyBillWave className="mr-2 text-xl" /> $
                      {product.priceSoldAt}
                    </p>

                    <div className="space-y-3 text-gray-700 text-sm">
                      <p className="flex items-center">
                        <FaUser className="mr-2 text-gray-500" />
                        <span className="font-medium">Client:</span> {product.names}
                      </p>
                      <p className="flex items-center">
                        <FaBuilding className="mr-2 text-gray-500" />
                        <span className="font-medium">Cooperative:</span>{" "}
                        {product.cooperativeName}
                      </p>
                      <p className="flex items-center">
                        <FaMapMarkerAlt className="mr-2 text-gray-500" />
                        <span className="font-medium">Location:</span>{" "}
                        {product.location}
                      </p>
                      <p className="flex items-center">
                        <FaCalendarAlt className="mr-2 text-gray-500" />
                        <span className="font-medium">Planted:</span>{" "}
                        {new Date(product.plantTime).toLocaleDateString()}
                      </p>
                      <p className="flex items-center">
                        <FaCalendarAlt className="mr-2 text-gray-500" />
                        <span className="font-medium">Harvest:</span>{" "}
                        {new Date(product.harvestTime).toLocaleDateString()}
                      </p>
                      <p className="flex items-center">
                        <FaTruck className="mr-2 text-gray-500" />
                        <span className="font-medium">Logistics:</span>{" "}
                        {product.needLogistic ? "Needed" : "Not Needed"}
                      </p>
                    </div>
                  </div>

                  <div className="mt-6 pt-4 border-t border-gray-100 flex justify-between items-center">
                    <Link
                      to={`/dashboard/products/${product._id}`}
                      className="inline-flex items-center text-blue-600 hover:text-blue-800 font-medium transition-colors duration-200"
                      title="View Product Details"
                    >
                      <FaEye className="mr-2 text-lg" /> View Details
                    </Link>
                    <div className="flex space-x-4">
                      <Link
                        to={`/dashboard/products/edit/${product._id}`}
                        className="text-gray-500 hover:text-blue-600 transition-colors duration-200 p-2 rounded-full hover:bg-blue-50"
                        title="Edit Product"
                      >
                        <FaEdit className="text-xl" />
                      </Link>
                      <button
                        onClick={() => handleDelete(product._id)}
                        className="text-gray-500 hover:text-red-600 transition-colors duration-200 p-2 rounded-full hover:bg-red-50"
                        title="Delete Product"
                      >
                        <FaTrash className="text-xl" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductList;
import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useNavigate } from "react-router-dom";
import {
  FaCheck,
  FaTimes,
  FaEye,
  FaSpinner,
  FaFilter,
  FaSearch,
  FaUpload,
  FaDownload,
  FaComments,
  FaEdit,
  FaTrash,
  FaHistory,
  FaCreditCard,
} from "react-icons/fa";

const AdminProductManagement = () => {
  const navigate = useNavigate(); // Initialize useNavigate for navigation
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [feedbackModal, setFeedbackModal] = useState(false);
  const [feedback, setFeedback] = useState("");
  const [activeTab, setActiveTab] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [sortConfig, setSortConfig] = useState({ key: "createdAt", direction: "desc" });
  const [productHistory, setProductHistory] = useState([]);
  const [historyModal, setHistoryModal] = useState(false);
  const [bulkActionProducts, setBulkActionProducts] = useState([]);
  const [filterOptions, setFilterOptions] = useState({
    productType: "",
    minPrice: "",
    maxPrice: "",
    location: "",
    dateRange: { start: "", end: "" },
  });
  const [filterModalOpen, setFilterModalOpen] = useState(false);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    itemsPerPage: 9,
  });
  const [paymentModalOpen, setPaymentModalOpen] = useState(false); // Payment modal state
  const [paymentAmount, setPaymentAmount] = useState(0); // Payment amount state

  const fileInputRef = useRef(null);

  useEffect(() => {
    fetchProducts();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [products, activeTab, searchTerm, sortConfig, filterOptions]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const response = await axios.get("http://localhost:5000/api/clientproducts");
      setProducts(response.data);
      setLoading(false);
    } catch (error) {
      toast.error("Error fetching products: " + (error.response?.data?.message || error.message));
      setLoading(false);
    }
  };

  const fetchProductHistory = async (productId) => {
    try {
      const response = await axios.get(`http://localhost:5000/api/clientproducts/${productId}/history`);
      setProductHistory(response.data);
      setHistoryModal(true);
    } catch (error) {
      toast.error("Error fetching product history");
    }
  };

  const handleStatusChange = async (productId, newStatus, feedbackText = "") => {
    if (window.confirm(`Are you sure you want to mark this product as ${newStatus}?`)) {
      try {
        setLoading(true);
        const response = await axios.put(`http://localhost:5000/api/clientproducts/${productId}/status`, {
          status: newStatus,
          feedback: feedbackText,
        });

        toast.success(`Product ${newStatus} successfully!`);
        fetchProducts();
      } catch (error) {
        toast.error(`Error updating product status: ${error.response?.data?.message || error.message}`);
        setLoading(false);
      }
    }
  };

  const handleAccept = (productId) => {
    handleStatusChange(productId, "accepted");
  };

  const handleReject = (productId) => {
    setSelectedProduct(products.find((p) => p._id === productId));
    setFeedbackModal(true);
  };

  const handleSubmitFeedback = () => {
    handleStatusChange(selectedProduct._id, "rejected", feedback);
    setFeedbackModal(false);
    setFeedback("");
  };

  const handlePendingReview = (productId) => {
    handleStatusChange(productId, "pending");
  };

  const handleViewDetails = (product) => {
    setSelectedProduct(product);
    setIsModalOpen(true);
  };

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
    setPagination({ ...pagination, currentPage: 1 });
  };

  const handleSort = (key) => {
    const direction = sortConfig.key === key && sortConfig.direction === "asc" ? "desc" : "asc";
    setSortConfig({ key, direction });
  };

  const handleFilter = () => {
    setFilterModalOpen(true);
  };

  const applyFilters = () => {
    let result = [...products];

    // Filter by status tab
    if (activeTab !== "all") {
      result = result.filter((product) => product.status === activeTab);
    }

    // Search filter
    if (searchTerm) {
      const search = searchTerm.toLowerCase();
      result = result.filter(
        (product) =>
          product.names?.toLowerCase().includes(search) ||
          product.location?.toLowerCase().includes(search) ||
          product.productType?.toLowerCase().includes(search) ||
          product.cooperativeName?.toLowerCase().includes(search)
      );
    }

    // Apply advanced filters
    if (filterOptions.productType) {
      result = result.filter((p) => p.productType === filterOptions.productType);
    }

    if (filterOptions.minPrice) {
      result = result.filter((p) => Number(p.priceSoldAt) >= Number(filterOptions.minPrice));
    }

    if (filterOptions.maxPrice) {
      result = result.filter((p) => Number(p.priceSoldAt) <= Number(filterOptions.maxPrice));
    }

    if (filterOptions.location) {
      result = result.filter((p) => p.location?.includes(filterOptions.location));
    }

    if (filterOptions.dateRange.start && filterOptions.dateRange.end) {
      const startDate = new Date(filterOptions.dateRange.start);
      const endDate = new Date(filterOptions.dateRange.end);
      result = result.filter((p) => {
        const createdAt = new Date(p.createdAt);
        return createdAt >= startDate && createdAt <= endDate;
      });
    }

    // Apply sorting
    result.sort((a, b) => {
      let aValue = a[sortConfig.key];
      let bValue = b[sortConfig.key];

      // Handle missing values
      if (aValue === undefined) return sortConfig.direction === "asc" ? -1 : 1;
      if (bValue === undefined) return sortConfig.direction === "asc" ? 1 : -1;

      // Handle different data types
      if (typeof aValue === "string") {
        aValue = aValue.toLowerCase();
        bValue = bValue.toLowerCase();
      } else if (aValue instanceof Date) {
        aValue = aValue.getTime();
        bValue = bValue.getTime();
      } else if (typeof aValue === "number") {
        // numbers are handled normally
      } else {
        aValue = String(aValue);
        bValue = String(bValue);
      }

      if (aValue < bValue) return sortConfig.direction === "asc" ? -1 : 1;
      if (aValue > bValue) return sortConfig.direction === "asc" ? 1 : -1;
      return 0;
    });

    // Update pagination
    const totalPages = Math.ceil(result.length / pagination.itemsPerPage);
    setPagination((prev) => ({ ...prev, totalPages }));

    setFilteredProducts(result);
  };

  const applyAdvancedFilters = () => {
    setFilterModalOpen(false);
    applyFilters();
  };

  const resetFilters = () => {
    setFilterOptions({
      productType: "",
      minPrice: "",
      maxPrice: "",
      location: "",
      dateRange: { start: "", end: "" },
    });
    setFilterModalOpen(false);
  };

  const handleBulkSelect = (productId) => {
    if (bulkActionProducts.includes(productId)) {
      setBulkActionProducts(bulkActionProducts.filter((id) => id !== productId));
    } else {
      setBulkActionProducts([...bulkActionProducts, productId]);
    }
  };

  const handleBulkAction = (action) => {
    if (bulkActionProducts.length === 0) {
      toast.warning("Please select products first");
      return;
    }

    if (window.confirm(`Are you sure you want to ${action} ${bulkActionProducts.length} products?`)) {
      const promises = bulkActionProducts.map((id) =>
        axios.put(`http://localhost:5000/api/clientproducts/${id}/status`, {
          status: action,
        })
      );

      Promise.all(promises)
        .then(() => {
          toast.success(`${bulkActionProducts.length} products ${action} successfully!`);
          setBulkActionProducts([]);
          fetchProducts();
        })
        .catch((error) => {
          toast.error(`Error during bulk ${action}: ${error.message}`);
        });
    }
  };

  const exportProducts = () => {
    const exportData = filteredProducts.map((p) => ({
      "Product Name": p.names,
      Type: p.productType,
      Price: p.priceSoldAt,
      Location: p.location,
      Cooperative: p.cooperativeName,
      Status: p.status,
      Planted: p.plantTime,
      Harvested: p.harvestTime,
      Phone: p.phoneNumber,
      Email: p.email,
    }));

    const jsonString = JSON.stringify(exportData, null, 2);
    const blob = new Blob([jsonString], { type: "application/json" });
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = "products-export.json";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const importProducts = () => {
    fileInputRef.current.click();
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const importedData = JSON.parse(event.target.result);

        if (!Array.isArray(importedData)) {
          toast.error("Invalid import format");
          return;
        }

        const response = await axios.post("http://localhost:5000/api/clientproducts/import", {
          products: importedData,
        });

        toast.success(`Successfully imported ${response.data.imported} products`);
        fetchProducts();
      } catch (error) {
        toast.error(`Import failed: ${error.message}`);
      }
    };

    reader.readAsText(file);
    e.target.value = null; // Reset the input
  };

  const getPageData = () => {
    const startIndex = (pagination.currentPage - 1) * pagination.itemsPerPage;
    const endIndex = startIndex + pagination.itemsPerPage;
    return filteredProducts.slice(startIndex, endIndex);
  };

  const handlePageChange = (page) => {
    setPagination({ ...pagination, currentPage: page });
  };

  const deleteProduct = async (productId) => {
    if (window.confirm("Are you sure you want to delete this product? This action cannot be undone.")) {
      try {
        await axios.delete(`http://localhost:5000/api/clientproducts/${productId}`);
        toast.success("Product deleted successfully!");
        fetchProducts();
      } catch (error) {
        toast.error("Error deleting product: " + error.message);
      }
    }
  };

  // Handle payment submission
  const handlePaymentSubmit = async () => {
    if (!selectedProduct || !paymentAmount) {
      toast.error("Please enter a valid payment amount.");
      return;
    }

    try {
      setLoading(true);
      const response = await axios.put(
        `http://localhost:5000/api/clientproducts/${selectedProduct._id}/status`,
        { status: "paid", paymentAmount }
      );

      toast.success("Payment completed successfully!");
      setPaymentModalOpen(false);
      navigate("/dashboard/pay"); // Navigate to payment success page
    } catch (error) {
      toast.error("Error processing payment: " + (error.response?.data?.message || error.message));
      setLoading(false);
    }
  };

  // Open payment modal
  const handlePayment = (product) => {
    setSelectedProduct(product);
    setPaymentModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <ToastContainer position="top-right" autoClose={3000} />
      {paymentModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-md w-full">
            <div className="p-6">
              <h2 className="text-xl font-bold text-gray-800 mb-4">Process Payment</h2>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Payment Amount</label>
                <input
                  type="number"
                  value={paymentAmount}
                  onChange={(e) => setPaymentAmount(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-md"
                  placeholder="Enter payment amount"
                />
              </div>
              <div className="flex justify-end space-x-2">
                <button
                  onClick={() => setPaymentModalOpen(false)}
                  className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300"
                >
                  Cancel
                </button>
                <button
                  onClick={handlePaymentSubmit}
                  className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
                >
                  Submit Payment
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
<div className="max-w-7xl mx-auto">
  <div className="mb-6 flex justify-between items-center flex-wrap">
    <h1 className="text-3xl font-bold text-gray-800">Product Management</h1>

    <div className="flex space-x-2 mt-4 sm:mt-0">
      <button
        onClick={exportProducts}
        className="px-4 py-2 bg-blue-600 text-white rounded flex items-center hover:bg-blue-700"
      >
        <FaDownload className="mr-2" /> Export
      </button>
      <button
        onClick={importProducts}
        className="px-4 py-2 bg-green-600 text-white rounded flex items-center hover:bg-green-700"
      >
        <FaUpload className="mr-2" /> Import
      </button>
      <input
        type="file"
        ref={fileInputRef}
        className="hidden"
        accept=".json"
        onChange={handleFileUpload}
      />
    </div>
  </div>

  {/* Tabs and Filters */}
  <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
    <div className="flex flex-col sm:flex-row justify-between items-center mb-4">
      <div className="flex flex-wrap justify-center sm:justify-start mb-4 sm:mb-0">
        <button
          className={`px-4 py-2 rounded-md mr-2 mb-2 sm:mb-0 ${
            activeTab === "all" ? "bg-blue-500 text-white" : "bg-gray-200 text-gray-800"
          }`}
          onClick={() => setActiveTab("all")}
        >
          All Products
        </button>
        <button
          className={`px-4 py-2 rounded-md mr-2 mb-2 sm:mb-0 ${
            activeTab === "pending" ? "bg-yellow-500 text-white" : "bg-gray-200 text-gray-800"
          }`}
          onClick={() => setActiveTab("pending")}
        >
          Pending
        </button>
        <button
          className={`px-4 py-2 rounded-md mr-2 mb-2 sm:mb-0 ${
            activeTab === "accepted" ? "bg-green-500 text-white" : "bg-gray-200 text-gray-800"
          }`}
          onClick={() => setActiveTab("accepted")}
        >
          Accepted
        </button>
        <button
          className={`px-4 py-2 rounded-md ${
            activeTab === "rejected" ? "bg-red-500 text-white" : "bg-gray-200 text-gray-800"
          }`}
          onClick={() => setActiveTab("rejected")}
        >
          Rejected
        </button>
      </div>

      <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2 w-full sm:w-auto">
        <div className="relative">
          <input
            type="text"
            placeholder="Search products..."
            className="pl-10 pr-4 py-2 border rounded-md w-full"
            value={searchTerm}
            onChange={handleSearch}
          />
          <FaSearch className="absolute left-3 top-3 text-gray-400" />
        </div>

        <button
          onClick={handleFilter}
          className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md flex items-center hover:bg-gray-300"
        >
          <FaFilter className="mr-2" /> Filter
        </button>
      </div>
    </div>

    {/* Bulk Actions */}
    {bulkActionProducts.length > 0 && (
      <div className="mt-4 bg-gray-100 p-3 rounded-md flex flex-wrap items-center">
        <span className="mr-4">{bulkActionProducts.length} products selected</span>
        <div className="flex space-x-2">
          <button
            onClick={() => handleBulkAction("accepted")}
            className="px-3 py-1 bg-green-500 text-white rounded-md hover:bg-green-600"
          >
            Accept All
          </button>
          <button
            onClick={() => handleBulkAction("rejected")}
            className="px-3 py-1 bg-red-500 text-white rounded-md hover:bg-red-600"
          >
            Reject All
          </button>
          <button
            onClick={() => setBulkActionProducts([])}
            className="px-3 py-1 bg-gray-500 text-white rounded-md hover:bg-gray-600"
          >
            Clear Selection
          </button>
        </div>
      </div>
    )}

    {/* Analytics Summary */}
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-4">
      <div className="bg-blue-50 p-4 rounded-md">
        <h3 className="text-sm font-medium text-blue-800">Total Products</h3>
        <p className="text-2xl font-bold">{products.length}</p>
      </div>
      <div className="bg-green-50 p-4 rounded-md">
        <h3 className="text-sm font-medium text-green-800">Accepted</h3>
        <p className="text-2xl font-bold">
          {products.filter((p) => p.status === "accepted").length}
        </p>
      </div>
      <div className="bg-yellow-50 p-4 rounded-md">
        <h3 className="text-sm font-medium text-yellow-800">Pending</h3>
        <p className="text-2xl font-bold">
          {products.filter((p) => p.status === "pending").length}
        </p>
      </div>
      <div className="bg-red-50 p-4 rounded-md">
        <h3 className="text-sm font-medium text-red-800">Rejected</h3>
        <p className="text-2xl font-bold">
          {products.filter((p) => p.status === "rejected").length}
        </p>
      </div>
    </div>
  </div>

  {loading ? (
    <div className="flex justify-center items-center h-64">
      <FaSpinner className="animate-spin text-4xl text-blue-500" />
    </div>
  ) : filteredProducts.length === 0 ? (
    <div className="bg-white rounded-lg shadow-sm p-8 text-center">
      <p className="text-gray-600 text-xl">No products found matching your criteria</p>
    </div>
  ) : (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {getPageData().map((product) => (
          <div
            key={product._id}
            className="bg-white rounded-lg shadow-sm overflow-hidden border border-gray-200 hover:shadow-md transition-shadow"
          >
            <div className="border-b border-gray-100 p-3 flex justify-between items-center bg-gray-50">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  checked={bulkActionProducts.includes(product._id)}
                  onChange={() => handleBulkSelect(product._id)}
                  className="mr-3 h-5 w-5 text-blue-600"
                />
                <span
                  className={`px-2 py-1 rounded text-xs font-medium ${
                    product.status === "accepted"
                      ? "bg-green-100 text-green-800"
                      : product.status === "rejected"
                      ? "bg-red-100 text-red-800"
                      : "bg-yellow-100 text-yellow-800"
                  }`}
                >
                  {product.status
                    ? product.status.charAt(0).toUpperCase() + product.status.slice(1)
                    : "Pending"}
                </span>
              </div>
              <div className="text-xs text-gray-500">
                {new Date(product.createdAt).toLocaleDateString()}
              </div>
            </div>

            {product.image && (
              <div className="h-48 overflow-hidden">
                <img
                  src={`http://localhost:5000/${product.image}`}
                  alt={product.names}
                  className="w-full h-full object-cover transition-transform hover:scale-105"
                />
              </div>
            )}

            <div className="p-4">
              <div className="mb-2">
                <h3 className="text-lg font-semibold text-gray-800">{product.names}</h3>
                <div className="flex items-center text-sm text-gray-600 mt-1">
                  <span className="font-medium mr-2">Price:</span>
                  <span className="text-green-600 font-bold">
                    ${Number(product.priceSoldAt).toFixed(2)}
                  </span>
                </div>
              </div>

              <div className="flex flex-col space-y-1 mb-4">
                <p className="text-sm text-gray-600">
                  <span className="font-medium">Type:</span> {product.productType}
                </p>
                <p className="text-sm text-gray-600">
                  <span className="font-medium">Location:</span> {product.location}
                </p>
                <p className="text-sm text-gray-600">
                  <span className="font-medium">Cooperative:</span> {product.cooperativeName}
                </p>
              </div>

              <div className="flex flex-wrap justify-between items-center">
                <div className="flex space-x-2 mb-2 sm:mb-0">
                  <button
                    onClick={() => handleViewDetails(product)}
                    className="flex items-center text-blue-600 hover:text-blue-800"
                    title="View Details"
                  >
                    <FaEye className="mr-1" /> Details
                  </button>

                  <button
                    onClick={() => fetchProductHistory(product._id)}
                    className="flex items-center text-purple-600 hover:text-purple-800"
                    title="View History"
                  >
                    <FaHistory className="mr-1" /> History
                  </button>
                </div>

                <div className="flex space-x-1">
                  <button
                    onClick={() => handleAccept(product._id)}
                    className={`p-2 rounded-full hover:bg-green-100 text-green-600 hover:text-green-800 ${
                      product.status === "accepted" ? "bg-green-100" : ""
                    }`}
                    title="Accept"
                  >
                    <FaCheck />
                  </button>
                  <button
                    onClick={() => handleReject(product._id)}
                    className={`p-2 rounded-full hover:bg-red-100 text-red-600 hover:text-red-800 ${
                      product.status === "rejected" ? "bg-red-100" : ""
                    }`}
                    title="Reject"
                  >
                    <FaTimes />
                  </button>
                  <button
                    onClick={() => handlePendingReview(product._id)}
                    className={`p-2 rounded-full hover:bg-yellow-100 text-yellow-600 hover:text-yellow-800 ${
                      product.status === "pending" ? "bg-yellow-100" : ""
                    }`}
                    title="Mark as Pending"
                  >
                    <FaSpinner />
                  </button>
                  <button
                    onClick={() => deleteProduct(product._id)}
                    className="p-2 rounded-full hover:bg-gray-100 text-gray-600 hover:text-gray-800"
                    title="Delete Product"
                  >
                    <FaTrash />
                  </button>
                  <button
                    onClick={() => handlePayment(product)}
                    className="p-2 rounded-full hover:bg-blue-100 text-blue-600 hover:text-blue-800"
                    title="Process Payment"
                  >
                    <FaCreditCard />
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className="flex justify-center mt-8">
          <nav className="flex items-center space-x-1">
            <button
              onClick={() => handlePageChange(Math.max(1, pagination.currentPage - 1))}
              disabled={pagination.currentPage === 1}
              className={`px-3 py-1 rounded ${
                pagination.currentPage === 1
                  ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                  : "bg-gray-200 text-gray-700 hover:bg-gray-300"
              }`}
            >
              Previous
            </button>

            {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map((page) => (
              <button
                key={page}
                onClick={() => handlePageChange(page)}
                className={`px-3 py-1 rounded ${
                  pagination.currentPage === page
                    ? "bg-blue-500 text-white"
                    : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                }`}
              >
                {page}
              </button>
            ))}

            <button
              onClick={() => handlePageChange(Math.min(pagination.totalPages, pagination.currentPage + 1))}
              disabled={pagination.currentPage === pagination.totalPages}
              className={`px-3 py-1 rounded ${
                pagination.currentPage === pagination.totalPages
                  ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                  : "bg-gray-200 text-gray-700 hover:bg-gray-300"
              }`}
            >
              Next
            </button>
          </nav>
        </div>
      )}
    </>
  )}
</div>

      {/* Product Details Modal */}
      {isModalOpen && selectedProduct && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <h2 className="text-2xl font-bold text-gray-800">{selectedProduct.names}</h2>
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                  selectedProduct.status === 'accepted' ? 'bg-green-100 text-green-800' :
                  selectedProduct.status === 'rejected' ? 'bg-red-100 text-red-800' :
                  'bg-yellow-100 text-yellow-800'
                }`}>
                  {selectedProduct.status ? selectedProduct.status.charAt(0).toUpperCase() + selectedProduct.status.slice(1) : 'Pending'}
                </span>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  {selectedProduct.image && (
                    <div className="mb-6 rounded-lg overflow-hidden border border-gray-200">
                      <img
                        src={`http://localhost:5000/${selectedProduct.image}`}
                        alt={selectedProduct.names}
                        className="w-full object-cover"
                      />
                    </div>
                  )}
                  
                  <div className="bg-gray-50 rounded-lg p-4 mb-4">
                    <h3 className="font-semibold text-gray-700 mb-2">Supplier Information</h3>
                    <div className="grid grid-cols-2 gap-2">
                      <p className="text-sm text-gray-600"><span className="font-medium">ID:</span> {selectedProduct._id}</p>
                      <p className="text-sm text-gray-600"><span className="font-medium">Phone:</span> {selectedProduct.phoneNumber}</p>
                      <p className="text-sm text-gray-600"><span className="font-medium">Email:</span> {selectedProduct.email}</p>
                      <p className="text-sm text-gray-600"><span className="font-medium">Cooperative:</span> {selectedProduct.cooperativeName}</p>
                      <p className="text-sm text-gray-600"><span className="font-medium">Location:</span> {selectedProduct.location}</p>
                      <p className="text-sm text-gray-600"><span className="font-medium">Created:</span> {new Date(selectedProduct.createdAt).toLocaleDateString()}</p>
                    </div>
                  </div>
                </div>
                
                <div>
                  <div className="bg-gray-50 rounded-lg p-4 mb-4">
                    <h3 className="font-semibold text-gray-700 mb-2">Product Details</h3>
                    <div className="grid grid-cols-2 gap-2">
                      <p className="text-sm text-gray-600"><span className="font-medium">Product Type:</span> {selectedProduct.productType}</p>
                      <p className="text-sm text-gray-600"><span className="font-medium">Plant Time:</span> {selectedProduct.plantTime}</p>
                      <p className="text-sm text-gray-600"><span className="font-medium">Harvest Time:</span> {selectedProduct.harvestTime}</p>
                      <p className="text-sm text-gray-600"><span className="font-medium">Price:</span> <span className="text-green-600 font-bold">${Number(selectedProduct.priceSoldAt).toFixed(2)}</span></p>
                      <p className="text-sm text-gray-600"><span className="font-medium">Logistics Needed:</span> {selectedProduct.needLogistic ? 'Yes' : 'No'}</p>
                      <p className="text-sm text-gray-600"><span className="font-medium">Quantity:</span> {selectedProduct.quantity || 'N/A'} {selectedProduct.unit || 'units'}</p>
                      <p className="text-sm text-gray-600"><span className="font-medium">Certification:</span> {selectedProduct.certification || 'None'}</p>
                    </div>
                  </div>
                  
                  {selectedProduct.description && (
                                        <div className="bg-gray-50 rounded-lg p-4 mb-4">
                                        <h3 className="font-semibold text-gray-700 mb-2">Description</h3>
                                        <p className="text-sm text-gray-600">{selectedProduct.description}</p>
                                      </div>
                                    )}
                                  </div>
                                </div>
                  
                                <div className="flex justify-end space-x-2 mt-6">
                                  <button
                                    onClick={() => setIsModalOpen(false)}
                                    className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300"
                                  >
                                    Close
                                  </button>
                                </div>
                              </div>
                            </div>
                          </div>
                        )}
                  
                        {/* Feedback Modal */}
                        {feedbackModal && (
                          <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
                            <div className="bg-white rounded-lg max-w-md w-full">
                              <div className="p-6">
                                <h2 className="text-xl font-bold text-gray-800 mb-4">Provide Feedback</h2>
                                <textarea
                                  value={feedback}
                                  onChange={(e) => setFeedback(e.target.value)}
                                  className="w-full p-2 border border-gray-300 rounded-md mb-4"
                                  placeholder="Enter your feedback here..."
                                  rows="4"
                                />
                                <div className="flex justify-end space-x-2">
                                  <button
                                    onClick={() => setFeedbackModal(false)}
                                    className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300"
                                  >
                                    Cancel
                                  </button>
                                  <button
                                    onClick={handleSubmitFeedback}
                                    className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600"
                                  >
                                    Submit Feedback
                                  </button>
                                </div>
                              </div>
                            </div>
                          </div>
                        )}
                  
                        {/* Product History Modal */}
                        {historyModal && (
                          <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
                            <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
                              <div className="p-6">
                                <div className="flex justify-between items-start mb-4">
                                  <h2 className="text-2xl font-bold text-gray-800">Product History</h2>
                                  <button
                                    onClick={() => setHistoryModal(false)}
                                    className="p-2 text-gray-600 hover:text-gray-800"
                                  >
                                    <FaTimes />
                                  </button>
                                </div>
                                
                                <div className="space-y-4">
                                  {productHistory.map((history, index) => (
                                    <div key={index} className="bg-gray-50 p-4 rounded-lg">
                                      <div className="grid grid-cols-2 gap-2">
                                        <p className="text-sm text-gray-600"><span className="font-medium">Date:</span> {new Date(history.date).toLocaleDateString()}</p>
                                        <p className="text-sm text-gray-600"><span className="font-medium">Status:</span> {history.status}</p>
                                        <p className="text-sm text-gray-600"><span className="font-medium">Changed By:</span> {history.changedBy}</p>
                                        {history.feedback && (
                                          <p className="text-sm text-gray-600"><span className="font-medium">Feedback:</span> {history.feedback}</p>
                                        )}
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            </div>
                          </div>
                        )}
                  
                        {/* Filter Modal */}
                        {filterModalOpen && (
                          <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
                            <div className="bg-white rounded-lg max-w-md w-full">
                              <div className="p-6">
                                <h2 className="text-xl font-bold text-gray-800 mb-4">Filter Products</h2>
                                
                                <div className="space-y-4">
                                  <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Product Type</label>
                                    <input
                                      type="text"
                                      value={filterOptions.productType}
                                      onChange={(e) => setFilterOptions({...filterOptions, productType: e.target.value})}
                                      className="w-full p-2 border border-gray-300 rounded-md"
                                      placeholder="Enter product type..."
                                    />
                                  </div>
                                  
                                  <div className="grid grid-cols-2 gap-4">
                                    <div>
                                      <label className="block text-sm font-medium text-gray-700 mb-1">Min Price</label>
                                      <input
                                        type="number"
                                        value={filterOptions.minPrice}
                                        onChange={(e) => setFilterOptions({...filterOptions, minPrice: e.target.value})}
                                        className="w-full p-2 border border-gray-300 rounded-md"
                                        placeholder="Enter min price..."
                                      />
                                    </div>
                                    <div>
                                      <label className="block text-sm font-medium text-gray-700 mb-1">Max Price</label>
                                      <input
                                        type="number"
                                        value={filterOptions.maxPrice}
                                        onChange={(e) => setFilterOptions({...filterOptions, maxPrice: e.target.value})}
                                        className="w-full p-2 border border-gray-300 rounded-md"
                                        placeholder="Enter max price..."
                                      />
                                    </div>
                                  </div>
                                  
                                  <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                                    <input
                                      type="text"
                                      value={filterOptions.location}
                                      onChange={(e) => setFilterOptions({...filterOptions, location: e.target.value})}
                                      className="w-full p-2 border border-gray-300 rounded-md"
                                      placeholder="Enter location..."
                                    />
                                  </div>
                                  
                                  <div className="grid grid-cols-2 gap-4">
                                    <div>
                                      <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
                                      <input
                                        type="date"
                                        value={filterOptions.dateRange.start}
                                        onChange={(e) => setFilterOptions({...filterOptions, dateRange: {...filterOptions.dateRange, start: e.target.value}})}
                                        className="w-full p-2 border border-gray-300 rounded-md"
                                      />
                                    </div>
                                    <div>
                                      <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
                                      <input
                                        type="date"
                                        value={filterOptions.dateRange.end}
                                        onChange={(e) => setFilterOptions({...filterOptions, dateRange: {...filterOptions.dateRange, end: e.target.value}})}
                                        className="w-full p-2 border border-gray-300 rounded-md"
                                      />
                                    </div>
                                  </div>
                                </div>
                                
                                <div className="flex justify-end space-x-2 mt-6">
                                  <button
                                    onClick={resetFilters}
                                    className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300"
                                  >
                                    Reset Filters
                                  </button>
                                  <button
                                    onClick={applyAdvancedFilters}
                                    className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
                                  >
                                    Apply Filters
                                  </button>
                                </div>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  };
                  
                  export default AdminProductManagement;
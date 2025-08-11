import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import jsPDF from "jspdf";
import "jspdf-autotable"; // Import autoTable for jspdf
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useNavigate } from "react-router-dom";
import { loadStripe } from "@stripe/stripe-js";
import { CardElement, useStripe, useElements, Elements } from "@stripe/react-stripe-js";
import {
  FaCheck,
  FaTimes,
  FaEye,
  FaSpinner,
  FaFilter,
  FaSearch,
  FaUpload,
  FaDownload,
  FaHistory,
  FaCreditCard,
  FaTimesCircle,
  FaMoneyBillWave, 
  FaTrash,
} from "react-icons/fa";

// Replace your current stripePromise declaration with this:
const stripePromise = (async () => {
  try {
    const stripe = await loadStripe(
      process.env.REACT_APP_STRIPE_PUBLIC_KEY || 
      "pk_test_51RRrQyBTV48ydIXJiHcsoN1A3Ra9TUc0LFxcbMGuFl4A1I4Ag6lzjVI5gvQ12rvnj9y2fsdsdT1qNEHW0LbBQzIG00kFnztbyF"
    );
    if (!stripe) {
      throw new Error("Stripe failed to initialize");
    }
    return stripe;
  } catch (error) {
    console.error("Stripe initialization error:", error);
    return null;
  }
})();

// --- Payment Form Component (Stripe Integration) ---
const PaymentForm = ({ product, onSuccess, onClose, loading, setLoading }) => {
  const stripe = useStripe();
  const elements = useElements();
  useEffect(() => {
    if (!stripePromise) {
      toast.error("Stripe failed to initialize. Please refresh the page.");
    }
  }, []);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);

    if (!stripe || !elements) {
      toast.error("Stripe.js has not loaded yet. Please try again.");
      setLoading(false);
      return;
    }

    try {
      // 1. Create Payment Intent on your backend
      const response = await axios.post(
        "http://localhost:5000/api/clientproducts/create-payment-intent",
        {
          productId: product._id,
          amount: Math.round(product.priceSoldAt * 100) // Amount in cents
        }
      );

      const { clientSecret } = response.data;

      if (!clientSecret) {
        throw new Error("Failed to get client secret from backend.");
      }

      // 2. Confirm Card Payment with Stripe
      const { error, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
        payment_method: {
          card: elements.getElement(CardElement),
          billing_details: {
            name: product.names, // Or a relevant customer name
            email: product.email // Or a relevant customer email
          },
        },
      });

      if (error) {
        throw new Error(error.message); // Throw Stripe error message
      }

      if (paymentIntent.status === "succeeded") {
        // 3. Confirm Payment Success on your backend
        await axios.post("http://localhost:5000/api/clientproducts/confirm-payment", {
          paymentIntentId: paymentIntent.id,
          productId: product._id,
          amountPaid: product.priceSoldAt // Send actual amount
        });

        toast.success(`Payment for ${product.names} successful!`);
        onSuccess(); // Callback to parent to close modal and refresh products
      } else {
        // Handle other paymentIntent statuses (e.g., 'requires_action')
        toast.info(`Payment status: ${paymentIntent.status}. Further action may be required.`);
        onClose(); // Close modal, but may require user to re-attempt or check payment status manually
      }
    } catch (error) {
      console.error("Stripe payment error:", error);
      toast.error(`Payment failed: ${error.message || "An unexpected error occurred."}`);
    } finally {
      setLoading(false);
    }
  };

  const cardElementOptions = {
    style: {
      base: {
        fontSize: '16px',
        color: '#424770',
        '::placeholder': {
          color: '#aab7c4',
        },
      },
      invalid: {
        color: '#9e2146',
      },
    },
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
      <p className="text-xl font-bold text-gray-800">Vendor names: {product.names}</p>
        <p className="text-gray-500">Product: {product.productType}</p>
        <p className="text-2xl font-extrabold text-green-600 mt-1">
          Amount: ${Number(product.priceSoldAt).toFixed(2)}
        </p>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Card Details</label>
        <div className="border border-gray-300 p-3 rounded-md shadow-sm">
          <CardElement options={cardElementOptions} />
        </div>
      </div>

      <div className="flex justify-end space-x-3">
        <button
          type="button"
          onClick={onClose}
          className="px-5 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 transition-colors"
          disabled={loading}
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={!stripe || loading}
          className="px-5 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors flex items-center justify-center shadow-md"
        >
          {loading ? (
            <>
              <FaSpinner className="animate-spin mr-2" /> Processing...
            </>
          ) : (
            <>
              <FaCreditCard className="mr-2" /> Confirm Payment
            </>
          )}
        </button>
      </div>
    </form>
  );
};

// --- Main AdminProductManagement Component ---
const AdminProductManagement = () => {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false); // Product details modal
  const [feedbackModal, setFeedbackModal] = useState(false); // Reject feedback modal
  const [feedback, setFeedback] = useState("");
  const [activeTab, setActiveTab] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [sortConfig, setSortConfig] = useState({ key: "createdAt", direction: "desc" });
  const [productHistory, setProductHistory] = useState([]);
  const [historyModal, setHistoryModal] = useState(false); // Product history modal
  const [bulkActionProducts, setBulkActionProducts] = useState([]);
  const [filterOptions, setFilterOptions] = useState({
    productType: "",
    minPrice: "",
    maxPrice: "",
    location: "",
    dateRange: { start: "", end: "" },
  });
  const [filterModalOpen, setFilterModalOpen] = useState(false); // Advanced filter modal
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    itemsPerPage: 9,
  });
  const [paymentModalOpen, setPaymentModalOpen] = useState(false); // Stripe payment modal

  const fileInputRef = useRef(null);

  // --- Effects ---
  useEffect(() => {
    fetchProducts();
  }, []);

  useEffect(() => {
    applyFilters();
    setPagination((prev) => ({ ...prev, currentPage: 1 }));
  }, [products, activeTab, searchTerm, sortConfig, filterOptions]);

  // --- Data Fetching ---
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

  // --- Status Management (Accept/Reject/Pending) ---
  const handleStatusChange = async (productId, newStatus, feedbackText = "") => {
    if (!window.confirm(`Are you sure you want to mark this product as ${newStatus}?`)) {
      return;
    }
    try {
      setLoading(true);
      await axios.put(`http://localhost:5000/api/clientproducts/${productId}/status`, {
        status: newStatus,
        feedback: feedbackText,
      });

      toast.success(`Product marked as ${newStatus} successfully!`);
      fetchProducts();
      setLoading(false);
    } catch (error) {
      toast.error(`Error updating product status: ${error.response?.data?.message || error.message}`);
      setLoading(false);
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
    if (!selectedProduct) return;
    handleStatusChange(selectedProduct._id, "rejected", feedback);
    setFeedbackModal(false);
    setFeedback("");
  };

  const handlePendingReview = (productId) => {
    handleStatusChange(productId, "pending");
  };

  // --- Product Details ---
  const handleViewDetails = (product) => {
    setSelectedProduct(product);
    setIsModalOpen(true);
  };

  // --- Search, Sort, Filter Logic ---
  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
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

    if (activeTab !== "all") {
      result = result.filter((product) => product.status === activeTab);
    }

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
      endDate.setHours(23, 59, 59, 999);

      result = result.filter((p) => {
        const createdAt = new Date(p.createdAt);
        return createdAt >= startDate && createdAt <= endDate;
      });
    }

    result.sort((a, b) => {
      let aValue = a[sortConfig.key];
      let bValue = b[sortConfig.key];

      if (aValue === undefined && bValue === undefined) return 0;
      if (aValue === undefined) return sortConfig.direction === "asc" ? 1 : -1;
      if (bValue === undefined) return sortConfig.direction === "asc" ? -1 : 1;

      if (typeof aValue === "string") {
        aValue = aValue.toLowerCase();
        bValue = bValue.toLowerCase();
      } else if (aValue instanceof Date || (typeof aValue === 'string' && !isNaN(new Date(aValue)))) {
        aValue = new Date(aValue).getTime();
        bValue = new Date(bValue).getTime();
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

    const totalPages = Math.ceil(result.length / pagination.itemsPerPage);
    setPagination((prev) => ({ ...prev, totalPages }));

    setFilteredProducts(result);
  };

  const applyAdvancedFilters = () => {
    setFilterModalOpen(false);
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

  // --- Bulk Actions ---
  const handleBulkSelect = (productId) => {
    if (bulkActionProducts.includes(productId)) {
      setBulkActionProducts(bulkActionProducts.filter((id) => id !== productId));
    } else {
      setBulkActionProducts([...bulkActionProducts, productId]);
    }
  };

  const handleBulkAction = async (action) => {
    if (bulkActionProducts.length === 0) {
      toast.warning("Please select products first.");
      return;
    }

    if (!window.confirm(`Are you sure you want to ${action} ${bulkActionProducts.length} products?`)) {
      return;
    }

    try {
      setLoading(true);
      const promises = bulkActionProducts.map((id) =>
        axios.put(`http://localhost:5000/api/clientproducts/${id}/status`, {
          status: action,
        })
      );

      await Promise.all(promises);
      toast.success(`${bulkActionProducts.length} products ${action} successfully!`);
      setBulkActionProducts([]);
      fetchProducts();
    } catch (error) {
      toast.error(`Error during bulk ${action}: ${error.response?.data?.message || error.message}`);
    } finally {
      setLoading(false);
    }
  };

  // --- Export/Import ---
  const exportProductsAsPDF = () => {
    const doc = new jsPDF();
    const tableColumn = ["Product Name", "Type", "Price", "Location", "Cooperative", "Status", "Planted", "Harvested"];
    const tableRows = [];

    filteredProducts.forEach(product => {
      const productData = [
        product.names,
        product.productType,
        `$${Number(product.priceSoldAt).toFixed(2)}`,
        product.location,
        product.cooperativeName,
        product.status ? product.status.charAt(0).toUpperCase() + product.status.slice(1) : 'N/A',
        product.plantTime || 'N/A',
        product.harvestTime || 'N/A',
      ];
      tableRows.push(productData);
    });

    doc.autoTable({
      head: [tableColumn],
      body: tableRows,
      startY: 20,
      headStyles: { fillColor: [41, 128, 185] },
      styles: { fontSize: 8, cellPadding: 2, overflow: 'linebreak' },
      columnStyles: {
        0: { cellWidth: 35 },
        1: { cellWidth: 20 },
        2: { cellWidth: 20 },
        3: { cellWidth: 30 },
        4: { cellWidth: 30 },
        5: { cellWidth: 15 },
        6: { cellWidth: 20 },
        7: { cellWidth: 20 },
      }
    });
    doc.text("Product Management Report", 14, 15);
    doc.save("products.pdf");
  };

  const exportProductsAsJSON = () => {
    const exportData = filteredProducts.map((p) => ({
      "Product ID": p._id,
      "Product Name": p.names,
      "Product Type": p.productType,
      "Price Sold At": p.priceSoldAt,
      Location: p.location,
      "Cooperative Name": p.cooperativeName,
      Status: p.status,
      "Plant Time": p.plantTime,
      "Harvest Time": p.harvestTime,
      "Phone Number": p.phoneNumber,
      Email: p.email,
      Description: p.description,
      Quantity: p.quantity,
      Unit: p.unit,
      Certification: p.certification,
      "Needs Logistic": p.needLogistic,
      "Created At": p.createdAt,
      "Updated At": p.updatedAt,
      Image: p.image,
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

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.type !== "application/json") {
      toast.error("Please upload a JSON file.");
      e.target.value = null;
      return;
    }

    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const importedData = JSON.parse(event.target.result);

        if (!Array.isArray(importedData)) {
          toast.error("Invalid import format. Expected an array of products.");
          return;
        }

        setLoading(true);
        const response = await axios.post("http://localhost:5000/api/clientproducts/import", {
          products: importedData,
        });

        toast.success(`Successfully imported ${response.data.importedCount} products. ${response.data.failedCount} failed.`);
        fetchProducts();
      } catch (error) {
        toast.error(`Import failed: ${error.message || "Invalid JSON file or server error."}`);
      } finally {
        setLoading(false);
      }
    };

    reader.readAsText(file);
    e.target.value = null;
  };

  // --- Pagination Logic ---
  const getPageData = () => {
    const startIndex = (pagination.currentPage - 1) * pagination.itemsPerPage;
    const endIndex = startIndex + pagination.itemsPerPage;
    return filteredProducts.slice(startIndex, endIndex);
  };

  const handlePageChange = (page) => {
    if (page >= 1 && page <= pagination.totalPages) {
      setPagination({ ...pagination, currentPage: page });
    }
  };

  // --- Delete Product ---
  const deleteProduct = async (productId) => {
    if (!window.confirm("Are you sure you want to delete this product? This action cannot be undone.")) {
      return;
    }
    try {
      setLoading(true);
      await axios.delete(`http://localhost:5000/api/clientproducts/${productId}`);
      toast.success("Product deleted successfully!");
      fetchProducts();
    } catch (error) {
      toast.error("Error deleting product: " + (error.response?.data?.message || error.message));
    } finally {
      setLoading(false);
    }
  };

  // --- Stripe Payment Flow ---
  const handlePayment = (product) => {
    setSelectedProduct(product);
    setPaymentModalOpen(true);
  };

  const handlePaymentSuccess = () => {
    setPaymentModalOpen(false);
    fetchProducts(); // Refresh products to show updated payment status
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6">
      <ToastContainer position="top-right" autoClose={3000} hideProgressBar={false} newestOnTop={false} closeOnClick rtl={false} pauseOnFocusLoss draggable pauseOnHover />

      {/* Stripe Payment Modal */}
      {paymentModalOpen && selectedProduct && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-md w-full shadow-xl">
            <div className="flex justify-between items-center p-4 border-b border-gray-200">
              <h2 className="text-xl font-bold text-gray-800">Process Payment</h2>
              <button
                onClick={() => setPaymentModalOpen(false)}
                className="text-gray-500 hover:text-gray-700 transition-colors"
                title="Close"
              >
                <FaTimesCircle className="text-2xl" />
              </button>
            </div>
            <div className="p-6">
              <Elements stripe={stripePromise}>
                <PaymentForm
                  product={selectedProduct}
                  onSuccess={handlePaymentSuccess}
                  onClose={() => setPaymentModalOpen(false)}
                  loading={loading}
                  setLoading={setLoading}
                />
              </Elements>
            </div>
          </div>
        </div>
      )}

      {/* Product Details Modal */}
      {isModalOpen && selectedProduct && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-xl">
            <div className="flex justify-between items-start p-4 border-b border-gray-200">
              <h2 className="text-2xl font-bold text-gray-800">{selectedProduct.names}</h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-gray-500 hover:text-gray-700 transition-colors"
                title="Close"
              >
                <FaTimesCircle className="text-2xl" />
              </button>
            </div>
            <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                {selectedProduct.image && (
                  <div className="mb-6 rounded-lg overflow-hidden border border-gray-200 shadow-sm">
                    <img
                      src={`http://localhost:5000/${selectedProduct.image}`}
                      alt={selectedProduct.names}
                      className="w-full h-auto object-cover max-h-80"
                    />
                  </div>
                )}

                <div className="bg-gray-50 rounded-lg p-4 mb-4 shadow-sm">
                  <h3 className="font-semibold text-gray-700 mb-2 border-b pb-1 border-gray-200">Supplier Information</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-2">
                    <p className="text-sm text-gray-600"><span className="font-medium">ID:</span> {selectedProduct._id}</p>
                    <p className="text-sm text-gray-600"><span className="font-medium">Phone:</span> {selectedProduct.phoneNumber || 'N/A'}</p>
                    <p className="text-sm text-gray-600"><span className="font-medium">Email:</span> {selectedProduct.email || 'N/A'}</p>
                    <p className="text-sm text-gray-600"><span className="font-medium">Cooperative:</span> {selectedProduct.cooperativeName || 'N/A'}</p>
                    <p className="text-sm text-gray-600"><span className="font-medium">Location:</span> {selectedProduct.location || 'N/A'}</p>
                    <p className="text-sm text-gray-600"><span className="font-medium">Registered:</span> {new Date(selectedProduct.createdAt).toLocaleDateString()}</p>
                  </div>
                </div>
              </div>

              <div>
                <div className="bg-gray-50 rounded-lg p-4 mb-4 shadow-sm">
                  <h3 className="font-semibold text-gray-700 mb-2 border-b pb-1 border-gray-200">Product Details</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-2">
                    <p className="text-sm text-gray-600"><span className="font-medium">Type:</span> {selectedProduct.productType || 'N/A'}</p>
                    <p className="text-sm text-gray-600"><span className="font-medium">Status:</span>
                      <span className={`ml-2 px-2 py-1 rounded text-xs font-medium ${
                        selectedProduct.status === 'accepted' ? 'bg-green-100 text-green-800' :
                        selectedProduct.status === 'rejected' ? 'bg-red-100 text-red-800' :
                        selectedProduct.status === 'paid' ? 'bg-indigo-100 text-indigo-800' : // New: Paid status color
                        'bg-yellow-100 text-yellow-800'
                      }`}>
                        {selectedProduct.status ? selectedProduct.status.charAt(0).toUpperCase() + selectedProduct.status.slice(1) : 'Pending'}
                      </span>
                    </p>
                    <p className="text-sm text-gray-600"><span className="font-medium">Plant Time:</span> {selectedProduct.plantTime || 'N/A'}</p>
                    <p className="text-sm text-gray-600"><span className="font-medium">Harvest Time:</span> {selectedProduct.harvestTime || 'N/A'}</p>
                    <p className="text-sm text-gray-600"><span className="font-medium">Price:</span> <span className="text-green-600 font-bold">rwf {Number(selectedProduct.priceSoldAt).toFixed(2)}</span></p>
                    <p className="text-sm text-gray-600"><span className="font-medium">Logistics Needed:</span> {selectedProduct.needLogistic ? 'Yes' : 'No'}</p>
                    <p className="text-sm text-gray-600"><span className="font-medium">Quantity:</span> {selectedProduct.quantity || 'N/A'} {selectedProduct.unit || 'units'}</p>
                    <p className="text-sm text-gray-600"><span className="font-medium">Certification:</span> {selectedProduct.certification || 'None'}</p>
                  </div>
                </div>

                {selectedProduct.description && (
                  <div className="bg-gray-50 rounded-lg p-4 shadow-sm">
                    <h3 className="font-semibold text-gray-700 mb-2 border-b pb-1 border-gray-200">Description</h3>
                    <p className="text-sm text-gray-600 leading-relaxed">{selectedProduct.description}</p>
                  </div>
                )}
              </div>
            </div>
            <div className="flex justify-end p-4 border-t border-gray-200">
              <button
                onClick={() => setIsModalOpen(false)}
                className="px-5 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reject Feedback Modal */}
      {feedbackModal && selectedProduct && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-md w-full shadow-xl">
            <div className="flex justify-between items-center p-4 border-b border-gray-200">
              <h2 className="text-xl font-bold text-gray-800">Provide Feedback for Rejecting</h2>
              <button
                onClick={() => setFeedbackModal(false)}
                className="text-gray-500 hover:text-gray-700 transition-colors"
                title="Close"
              >
                <FaTimesCircle className="text-2xl" />
              </button>
            </div>
            <div className="p-6">
              <div className="mb-4">
                <label htmlFor="feedback" className="block text-sm font-medium text-gray-700 mb-1">
                  Feedback for {selectedProduct.names}
                </label>
                <textarea
                  id="feedback"
                  value={feedback}
                  onChange={(e) => setFeedback(e.target.value)}
                  rows="4"
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-red-500 focus:border-red-500"
                  placeholder="e.g., Product quality not met, incorrect details, etc."
                ></textarea>
              </div>
              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => setFeedbackModal(false)}
                  className="px-5 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSubmitFeedback}
                  className="px-5 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
                  disabled={loading}
                >
                  {loading ? <FaSpinner className="animate-spin mr-2" /> : <FaTimes className="mr-2" />}
                  Submit Feedback
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Product History Modal */}
      {historyModal && productHistory.length > 0 && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[80vh] overflow-y-auto shadow-xl">
            <div className="flex justify-between items-center p-4 border-b border-gray-200">
              <h2 className="text-2xl font-bold text-gray-800">Product History</h2>
              <button
                onClick={() => setHistoryModal(false)}
                className="text-gray-500 hover:text-gray-700 transition-colors"
                title="Close"
              >
                <FaTimesCircle className="text-2xl" />
              </button>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                {productHistory.map((entry, index) => (
                  <div key={index} className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                    <p className="text-sm font-medium text-gray-700">
                      <span className="text-gray-500 mr-2">Status Changed To:</span>
                      <span className={`font-semibold ${
                        entry.status === 'accepted' ? 'text-green-700' :
                        entry.status === 'rejected' ? 'text-red-700' :
                        entry.status === 'paid' ? 'text-indigo-700' : // History for paid status
                        'text-yellow-700'
                      }`}>
                        {entry.status ? entry.status.charAt(0).toUpperCase() + entry.status.slice(1) : 'N/A'}
                      </span>
                    </p>
                    <p className="text-sm text-gray-600 mt-1">
                      <span className="font-medium">Date:</span> {new Date(entry.timestamp).toLocaleString()}
                    </p>
                    {entry.feedback && (
                      <p className="text-sm text-gray-600 mt-1">
                        <span className="font-medium">Feedback:</span> {entry.feedback}
                      </p>
                    )}
                  </div>
                ))}
                {productHistory.length === 0 && (
                  <p className="text-gray-600 text-center">No history available for this product.</p>
                )}
              </div>
            </div>
            <div className="flex justify-end p-4 border-t border-gray-200">
              <button
                onClick={() => setHistoryModal(false)}
                className="px-5 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Advanced Filter Modal */}
      {filterModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-lg w-full shadow-xl">
            <div className="flex justify-between items-center p-4 border-b border-gray-200">
              <h2 className="text-xl font-bold text-gray-800">Advanced Filters</h2>
              <button
                onClick={() => setFilterModalOpen(false)}
                className="text-gray-500 hover:text-gray-700 transition-colors"
                title="Close"
              >
                <FaTimesCircle className="text-2xl" />
              </button>
            </div>
            <div className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="productType" className="block text-sm font-medium text-gray-700 mb-1">
                  Product Type
                </label>
                <input
                  type="text"
                  id="productType"
                  value={filterOptions.productType}
                  onChange={(e) =>
                    setFilterOptions({ ...filterOptions, productType: e.target.value })
                  }
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  placeholder="e.g., Maize, Coffee"
                />
              </div>
              <div>
                <label htmlFor="minPrice" className="block text-sm font-medium text-gray-700 mb-1">
                  Min Price (rwf)
                </label>
                <input
                  type="number"
                  id="minPrice"
                  value={filterOptions.minPrice}
                  onChange={(e) =>
                    setFilterOptions({ ...filterOptions, minPrice: e.target.value })
                  }
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  placeholder="e.g., 100"
                />
              </div>
              <div>
                <label htmlFor="maxPrice" className="block text-sm font-medium text-gray-700 mb-1">
                  Max Price (rwf)
                </label>
                <input
                  type="number"
                  id="maxPrice"
                  value={filterOptions.maxPrice}
                  onChange={(e) =>
                    setFilterOptions({ ...filterOptions, maxPrice: e.target.value })
                  }
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  placeholder="e.g., 500"
                />
              </div>
              <div>
                <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-1">
                  Location
                </label>
                <input
                  type="text"
                  id="location"
                  value={filterOptions.location}
                  onChange={(e) =>
                    setFilterOptions({ ...filterOptions, location: e.target.value })
                  }
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  placeholder="e.g., Kigali"
                />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Date Range (Created At)</label>
                <div className="flex space-x-2">
                  <input
                    type="date"
                    value={filterOptions.dateRange.start}
                    onChange={(e) =>
                      setFilterOptions({
                        ...filterOptions,
                        dateRange: { ...filterOptions.dateRange, start: e.target.value },
                      })
                    }
                    className="w-1/2 p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  />
                  <input
                    type="date"
                    value={filterOptions.dateRange.end}
                    onChange={(e) =>
                      setFilterOptions({
                        ...filterOptions,
                        dateRange: { ...filterOptions.dateRange, end: e.target.value },
                      })
                    }
                    className="w-1/2 p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>
            </div>
            <div className="flex justify-end space-x-3 p-4 border-t border-gray-200">
              <button
                onClick={resetFilters}
                className="px-5 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 transition-colors"
              >
                Reset
              </button>
              <button
                onClick={applyAdvancedFilters}
                className="px-5 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              >
                Apply Filters
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto">
        {/* Header and Export/Import Buttons */}
        <div className="mb-6 flex flex-col sm:flex-row justify-between items-center flex-wrap gap-4">
          <h1 className="text-3xl font-extrabold text-gray-900">Product Management</h1>

          <div className="flex space-x-3">
            <button
              onClick={exportProductsAsPDF}
              className="px-4 py-2 bg-red-600 text-white rounded-md flex items-center hover:bg-red-700 transition-colors shadow-sm"
            >
              <FaDownload className="mr-2" /> Export PDF
            </button>
            <button
              onClick={exportProductsAsJSON}
              className="px-4 py-2 bg-blue-600 text-white rounded-md flex items-center hover:bg-blue-700 transition-colors shadow-sm"
            >
              <FaDownload className="mr-2" /> Export JSON
            </button>
            <button
              onClick={importProducts}
              className="px-4 py-2 bg-green-600 text-white rounded-md flex items-center hover:bg-green-700 transition-colors shadow-sm"
            >
              <FaUpload className="mr-2" /> Import JSON
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

        {/* Tabs, Search, Filter & Analytics */}
        <div className="bg-white rounded-xl shadow-lg p-5 mb-6">
          <div className="flex flex-col sm:flex-row justify-between items-center mb-5 gap-4">
            {/* Status Tabs */}
            <div className="flex flex-wrap justify-center sm:justify-start gap-3">
              <button
                className={`px-5 py-2 rounded-lg text-sm font-medium transition-colors ${
                  activeTab === "all" ? "bg-blue-600 text-white shadow" : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
                onClick={() => setActiveTab("all")}
              >
                All Products ({products.length})
              </button>
              <button
                className={`px-5 py-2 rounded-lg text-sm font-medium transition-colors ${
                  activeTab === "pending" ? "bg-yellow-500 text-white shadow" : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
                onClick={() => setActiveTab("pending")}
              >
                Pending ({products.filter((p) => p.status === "pending").length})
              </button>
              <button
                className={`px-5 py-2 rounded-lg text-sm font-medium transition-colors ${
                  activeTab === "accepted" ? "bg-green-600 text-white shadow" : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
                onClick={() => setActiveTab("accepted")}
              >
                Accepted ({products.filter((p) => p.status === "accepted").length})
              </button>
              <button
                className={`px-5 py-2 rounded-lg text-sm font-medium transition-colors ${
                  activeTab === "rejected" ? "bg-red-600 text-white shadow" : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
                onClick={() => setActiveTab("rejected")}
              >
                Rejected ({products.filter((p) => p.status === "rejected").length})
              </button>
              <button
                className={`px-5 py-2 rounded-lg text-sm font-medium transition-colors ${
                  activeTab === "paid" ? "bg-indigo-600 text-white shadow" : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
                onClick={() => setActiveTab("paid")}
              >
                Paid ({products.filter((p) => p.status === "paid").length})
              </button>
            </div>

            {/* Search and Filter Buttons */}
            <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-3 w-full sm:w-auto">
              <div className="relative w-full">
                <input
                  type="text"
                  placeholder="Search..."
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg w-full focus:ring-blue-500 focus:border-blue-500"
                  value={searchTerm}
                  onChange={handleSearch}
                />
                <FaSearch className="absolute left-3 top-3 text-gray-400" />
              </div>

              <button
                onClick={handleFilter}
                className="px-5 py-2 bg-gray-200 text-gray-800 rounded-lg flex items-center justify-center hover:bg-gray-300 transition-colors shadow-sm"
              >
                <FaFilter className="mr-2" /> Advanced Filter
              </button>
            </div>
          </div>

          {/* Bulk Actions Bar */}
          {bulkActionProducts.length > 0 && (
            <div className="mt-5 bg-blue-50 border border-blue-200 p-4 rounded-lg flex flex-wrap items-center justify-between gap-4 animate-fadeIn">
              <span className="text-blue-800 text-lg font-medium">
                {bulkActionProducts.length} product(s) selected
              </span>
              <div className="flex flex-wrap gap-3">
                <button
                  onClick={() => handleBulkAction("accepted")}
                  className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors flex items-center shadow-sm"
                  disabled={loading}
                >
                  {loading ? <FaSpinner className="animate-spin mr-2" /> : <FaCheck className="mr-2" />}
                  Accept Selected
                </button>
                <button
                  onClick={() => handleBulkAction("rejected")}
                  className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors flex items-center shadow-sm"
                  disabled={loading}
                >
                  {loading ? <FaSpinner className="animate-spin mr-2" /> : <FaTimes className="mr-2" />}
                  Reject Selected
                </button>
                <button
                  onClick={() => setBulkActionProducts([])}
                  className="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 transition-colors flex items-center shadow-sm"
                >
                  <FaTimesCircle className="mr-2" /> Clear Selection
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Main Content Area */}
        {loading ? (
          <div className="flex justify-center items-center h-64 bg-white rounded-xl shadow-lg">
            <FaSpinner className="animate-spin text-5xl text-blue-500" />
            <p className="ml-3 text-gray-600 text-lg">Loading products...</p>
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="bg-white rounded-xl shadow-lg p-10 text-center">
            <p className="text-gray-600 text-xl font-medium">
              No products found matching your current criteria.
            </p>
            <button
              onClick={() => { resetFilters(); setSearchTerm(""); setActiveTab("all"); }}
              className="mt-6 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-lg shadow-md"
            >
              Reset All Filters
            </button>
          </div>
        ) : (
          <>
            {/* Product Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {getPageData().map((product) => (
                <div
                  key={product._id}
                  className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-100 hover:shadow-lg transition-shadow duration-300 flex flex-col"
                >
                  <div className="border-b border-gray-100 p-4 flex justify-between items-center bg-gray-50">
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        checked={bulkActionProducts.includes(product._id)}
                        onChange={() => handleBulkSelect(product._id)}
                        className="mr-3 h-5 w-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500 cursor-pointer"
                      />
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          product.status === "accepted"
                            ? "bg-green-100 text-green-800"
                            : product.status === "rejected"
                            ? "bg-red-100 text-red-800"
                            : product.status === "paid"
                            ? "bg-indigo-100 text-indigo-800" // Paid status badge
                            : "bg-yellow-100 text-yellow-800"
                        }`}
                      >
                        {product.status
                          ? product.status.charAt(0).toUpperCase() + product.status.slice(1)
                          : "Pending"}
                      </span>
                    </div>
                    <div className="text-xs text-gray-500">
                      Harvest: {new Date(product.harvestTime).toLocaleDateString()}
                    </div>
                  </div>

                  {product.image && (
                    <div className="h-48 overflow-hidden bg-gray-100">
                      <img
                        src={`http://localhost:5000/${product.image}`}
                        alt={product.names}
                        className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
                      />
                    </div>
                  )}

                  <div className="p-4 flex flex-col flex-grow">
                    <div className="mb-3">
                      <h3 className="text-xl font-bold text-gray-800 mb-1">{product.names}</h3>
                      <div className="flex items-center text-sm text-gray-600">
                        <span className="font-semibold mr-2">Price:</span>
                        <span className="text-green-600 font-extrabold text-lg">
                          rwf{Number(product.priceSoldAt).toFixed(2)}
                        </span>
                      </div>
                    </div>

                    <div className="space-y-1 text-sm text-gray-600 flex-grow">
                      <p><span className="font-medium">Type:</span> {product.productType || 'N/A'}</p>
                      <p><span className="font-medium">Location:</span> {product.location || 'N/A'}</p>
                      <p><span className="font-medium">Cooperative:</span> {product.cooperativeName || 'N/A'}</p>
                    </div>

                    <div className="mt-4 border-t border-gray-100 pt-4 flex flex-wrap justify-between items-center gap-2">
                      <div className="flex space-x-3">
                        <button
                          onClick={() => handleViewDetails(product)}
                          className="flex items-center text-blue-600 hover:text-blue-800 transition-colors text-sm font-medium"
                          title="View Details"
                        >
                          <FaEye className="mr-1" /> Details
                        </button>

                        <button
                          onClick={() => fetchProductHistory(product._id)}
                          className="flex items-center text-purple-600 hover:text-purple-800 transition-colors text-sm font-medium"
                          title="View History"
                        >
                          <FaHistory className="mr-1" /> History
                        </button>
                      </div>

                      <div className="flex space-x-1">
                        <button
                          onClick={() => handleAccept(product._id)}
                          className={`p-2 rounded-full hover:bg-green-100 text-green-600 hover:text-green-800 transition-colors ${
                            product.status === "accepted" ? "bg-green-100" : ""
                          }`}
                          title="Accept Product"
                        >
                          <FaCheck className="text-lg" />
                        </button>
                        <button
                          onClick={() => handleReject(product._id)}
                          className={`p-2 rounded-full hover:bg-red-100 text-red-600 hover:text-red-800 transition-colors ${
                            product.status === "rejected" ? "bg-red-100" : ""
                          }`}
                          title="Reject Product"
                        >
                          <FaTimes className="text-lg" />
                        </button>
                        <button
                          onClick={() => handlePendingReview(product._id)}
                          className={`p-2 rounded-full hover:bg-yellow-100 text-yellow-600 hover:text-yellow-800 transition-colors ${
                            product.status === "pending" ? "bg-yellow-100" : ""
                          }`}
                          title="Mark as Pending"
                        >
                          <FaSpinner className="text-lg" />
                        </button>
                        {/* Conditionally render Pay button */}
                        {product.status !== 'paid' && (
                          <button
                            onClick={() => handlePayment(product)}
                            className="p-2 rounded-full hover:bg-blue-100 text-blue-600 hover:text-blue-800 transition-colors"
                            title="Process Payment"
                          >
                            <FaCreditCard className="text-lg" />
                          </button>
                        )}
                         {product.status === 'paid' && (
                          <span
                            className="p-2 rounded-full bg-indigo-100 text-indigo-600 cursor-default"
                            title="Product Paid"
                          >
                            <FaMoneyBillWave className="text-lg" />
                          </span>
                        )}
                        <button
                          onClick={() => deleteProduct(product._id)}
                          className="p-2 rounded-full hover:bg-gray-100 text-gray-600 hover:text-gray-800 transition-colors"
                          title="Delete Product"
                        >
                          <FaTrash className="text-lg" />
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
                <nav className="flex items-center space-x-2 bg-white p-3 rounded-lg shadow-md">
                  <button
                    onClick={() => handlePageChange(pagination.currentPage - 1)}
                    disabled={pagination.currentPage === 1}
                    className={`px-4 py-2 rounded-md font-medium transition-colors ${
                      pagination.currentPage === 1
                        ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                        : "bg-blue-500 text-white hover:bg-blue-600"
                    }`}
                  >
                    Previous
                  </button>

                  {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map((page) => (
                    <button
                      key={page}
                      onClick={() => handlePageChange(page)}
                      className={`px-4 py-2 rounded-md font-medium transition-colors ${
                        pagination.currentPage === page
                          ? "bg-blue-600 text-white shadow-inner"
                          : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                      }`}
                    >
                      {page}
                    </button>
                  ))}

                  <button
                    onClick={() => handlePageChange(pagination.currentPage + 1)}
                    disabled={pagination.currentPage === pagination.totalPages}
                    className={`px-4 py-2 rounded-md font-medium transition-colors ${
                      pagination.currentPage === pagination.totalPages
                        ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                        : "bg-blue-500 text-white hover:bg-blue-600"
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
    </div>
  );
};

export default AdminProductManagement;
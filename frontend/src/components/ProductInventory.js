import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { FaSearch, FaPlus, FaEdit, FaTrash, FaBoxOpen, FaExclamationTriangle } from 'react-icons/fa';
import Modal from 'react-modal';
import axios from 'axios';
import { toast, ToastContainer } from 'react-toastify'; // For better notifications
import 'react-toastify/dist/ReactToastify.css';

Modal.setAppElement('#root'); // Ensure this matches your root element ID

// --- Reusable Product Form Component ---
const ProductForm = React.memo(({ onSubmit, title, submitText, formData, handleInputChange, handleImageChange, closeModal, isEditMode }) => (
  <form onSubmit={onSubmit} className="space-y-4 p-4">
    <h2 className="text-center text-2xl font-semibold text-gray-800 mb-6">{title}</h2>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div>
        <label htmlFor="name" className="block text-sm font-medium text-gray-700">Name <span className="text-red-500">*</span></label>
        <input
          id="name"
          type="text"
          name="name"
          value={formData.name}
          onChange={handleInputChange}
          className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
          required
          maxLength={100}
        />
      </div>
      <div>
        <label htmlFor="category" className="block text-sm font-medium text-gray-700">Category <span className="text-red-500">*</span></label>
        <input
          id="category"
          type="text"
          name="category"
          value={formData.category}
          onChange={handleInputChange}
          className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
          required
          maxLength={50}
        />
      </div>
      <div className="md:col-span-2">
        <label htmlFor="description" className="block text-sm font-medium text-gray-700">Description <span className="text-red-500">*</span></label>
        <textarea
          id="description"
          name="description"
          value={formData.description}
          onChange={handleInputChange}
          rows="3"
          className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
          required
          maxLength={500}
        />
      </div>
      <div>
        <label htmlFor="vendor" className="block text-sm font-medium text-gray-700">Supplier <span className="text-red-500">*</span></label>
        <input
          id="vendor"
          type="text"
          name="vendor"
          value={formData.vendor}
          onChange={handleInputChange}
          className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
          required
          maxLength={100}
        />
      </div>
      <div>
        <label htmlFor="quantity" className="block text-sm font-medium text-gray-700">Quantity <span className="text-red-500">*</span></label>
        <input
          id="quantity"
          type="number"
          name="quantity"
          value={formData.quantity}
          onChange={handleInputChange}
          className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
          required
          min="0"
        />
      </div>
      <div>
        <label htmlFor="price" className="block text-sm font-medium text-gray-700">Price (Rwf) <span className="text-red-500">*</span></label>
        <input
          id="price"
          type="number"
          name="price"
          value={formData.price}
          onChange={handleInputChange}
          className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
          required
          min="0"
          step="0.01"
        />
      </div>
      <div>
        <label htmlFor="image" className="block text-sm font-medium text-gray-700">Product Image</label>
        <input
          id="image"
          type="file"
          name="image"
          onChange={handleImageChange}
          className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
        />
        {isEditMode && formData.currentImage && (
          <p className="text-xs text-gray-500 mt-1">Current Image: {formData.currentImage.split('/').pop()}</p>
        )}
      </div>
      <div className="flex items-center mt-2">
        <input
          id="isKG"
          type="checkbox"
          name="isKG"
          checked={formData.isKG}
          onChange={handleInputChange}
          className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
        />
        <label htmlFor="isKG" className="ml-2 text-sm font-medium text-gray-700">Is in KG?</label>
      </div>
      <div className="flex items-center mt-2">
        <input
          id="isDozen"
          type="checkbox"
          name="isDozen"
          checked={formData.isDozen}
          onChange={handleInputChange}
          className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
        />
        <label htmlFor="isDozen" className="ml-2 text-sm font-medium text-gray-700">Is in Dozen?</label>
      </div>
    </div>
    <div className="flex justify-end gap-4 mt-6">
      <button
        type="button"
        onClick={closeModal}
        className="px-5 py-2 bg-gray-300 text-gray-800 rounded-lg hover:bg-gray-400 transition-colors duration-200"
      >
        Cancel
      </button>
      <button
        type="submit"
        className="px-5 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors duration-200"
      >
        {submitText}
      </button>
    </div>
  </form>
));

// --- Product Card Component ---
const ProductCard = React.memo(({ product, handleEdit, handleDelete, lowStockThreshold = 10 }) => {
  const isOutOfStock = product.quantity <= 0;
  const isLowStock = product.quantity > 0 && product.quantity <= lowStockThreshold;
  const imageUrl = product.image ? `http://localhost:5000/${product.image}` : `https://via.placeholder.com/100?text=No+Image`;

  return (
    <div className="bg-white p-5 rounded-lg shadow-md flex flex-col sm:flex-row items-start sm:items-center justify-between transition-transform transform hover:scale-[1.01] duration-200">
      <div className="flex items-center gap-4 w-full sm:w-auto">
        <img
          src={imageUrl}
          alt={product.name}
          className="w-20 h-20 rounded-lg object-cover border border-gray-200"
        />
        <div className="flex-grow">
          <h3 className="font-semibold text-lg text-gray-900 flex items-center">
            {product.name}
            {isOutOfStock && (
              <span className="ml-2 text-red-600 text-xs font-bold bg-red-100 px-2 py-1 rounded-full flex items-center">
                <FaBoxOpen className="mr-1" /> Out of Stock
              </span>
            )}
            {isLowStock && !isOutOfStock && (
              <span className="ml-2 text-yellow-600 text-xs font-bold bg-yellow-100 px-2 py-1 rounded-full flex items-center">
                <FaExclamationTriangle className="mr-1" /> Low Stock
              </span>
            )}
          </h3>
          <div className="text-sm text-gray-600 mt-1">
            <p className="truncate w-64 md:w-full"><strong>Description:</strong> {product.description}</p>
            <p><strong>Category:</strong> {product.category}</p>
            <p><strong>Vendor:</strong> {product.vendor}</p>
            <p><strong>Quantity:</strong> {product.quantity} {product.isKG ? 'KG' : product.isDozen ? 'Dozen' : 'Units'}</p>
            <p><strong>Price:</strong> Rwf {product.price.toLocaleString()}</p>
          </div>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row items-end sm:items-center gap-3 mt-4 sm:mt-0 ml-auto">
        <div className="text-right text-sm text-gray-500">
          <p>Recorded:</p>
          <p>{new Date(product.createdAt).toLocaleDateString()}</p>
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => handleEdit(product)}
            className="p-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors duration-200"
            title="Edit Product"
          >
            <FaEdit className="w-4 h-4" />
          </button>
          <button
            onClick={() => handleDelete(product._id)}
            className="p-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors duration-200"
            title="Delete Product"
          >
            <FaTrash className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
});

// --- Main Product Inventory Component ---
const ProductInventory = () => {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [products, setProducts] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [formData, setFormData] = useState({
    name: '', description: '', category: '', vendor: '',
    quantity: '', price: '', isKG: false, isDozen: false, image: null, currentImage: ''
  });
  const [editProduct, setEditProduct] = useState(null);

  const token = localStorage.getItem('token'); // Assuming you have a token for authentication

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get('http://localhost:5000/api/products', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (response.data.success) {
        setProducts(response.data.data);
      } else {
        setError(response.data.error || 'Failed to fetch products.');
        toast.error(response.data.error || 'Failed to fetch products.');
      }
    } catch (err) {
      console.error('Error fetching products:', err.response?.data || err.message);
      setError(err.response?.data?.error || err.message || 'An error occurred while fetching products.');
      toast.error(err.response?.data?.error || 'Error fetching products.');
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const handleInputChange = useCallback((e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  }, []);

  const handleImageChange = useCallback((e) => {
    setFormData(prev => ({
      ...prev,
      image: e.target.files[0]
    }));
  }, []);

  const resetForm = useCallback(() => {
    setFormData({
      name: '', description: '', category: '', vendor: '',
      quantity: '', price: '', isKG: false, isDozen: false, image: null, currentImage: ''
    });
    setEditProduct(null);
  }, []);

  const commonFormValidation = () => {
    if (!formData.name || !formData.description || !formData.category || !formData.vendor || 
        formData.quantity === '' || formData.price === '') {
      toast.error("Please fill in all required fields.");
      return false;
    }
    if (Number(formData.quantity) < 0 || Number(formData.price) < 0) {
      toast.error("Quantity and Price cannot be negative.");
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!commonFormValidation()) return;

    const formDataToSend = new FormData();
    for (const key in formData) {
      if (key !== 'image' && key !== 'currentImage') {
        formDataToSend.append(key, formData[key]);
      }
    }
    if (formData.image) {
      formDataToSend.append('image', formData.image);
    }

    try {
      const response = await axios.post('http://localhost:5000/api/products', formDataToSend, {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${token}`
        }
      });
      if (response.data.success) {
        setProducts(prev => [...prev, response.data.data]);
        resetForm();
        setIsAddModalOpen(false);
        toast.success('Product added successfully!');
      } else {
        toast.error(response.data.error || 'Failed to add product.');
      }
    } catch (err) {
      console.error('Error adding product:', err.response?.data || err.message);
      toast.error(err.response?.data?.error || 'Error adding product. Please try again.');
    }
  };

  const handleEdit = useCallback((product) => {
    setEditProduct(product);
    setFormData({
      name: product.name,
      description: product.description,
      category: product.category,
      vendor: product.vendor,
      quantity: product.quantity,
      price: product.price,
      isKG: product.isKG,
      isDozen: product.isDozen,
      image: null, // Image file input is cleared for security/fresh upload
      currentImage: product.image // Store current image path for display
    });
    setIsEditModalOpen(true);
  }, []);

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    if (!commonFormValidation()) return;

    const formDataToSend = new FormData();
    for (const key in formData) {
      if (key !== 'image' && key !== 'currentImage') {
        formDataToSend.append(key, formData[key]);
      }
    }
    if (formData.image instanceof File) {
      formDataToSend.append('image', formData.image);
    }

    try {
      const response = await axios.put(
        `http://localhost:5000/api/products/${editProduct._id}`,
        formDataToSend,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
            Authorization: `Bearer ${token}`
          }
        }
      );
      if (response.data.success) {
        const updatedProducts = products.map((prod) =>
          prod._id === editProduct._id ? response.data.data : prod
        );
        setProducts(updatedProducts);
        resetForm();
        setIsEditModalOpen(false);
        toast.success('Product updated successfully!');
      } else {
        toast.error(response.data.error || 'Failed to update product.');
      }
    } catch (err) {
      console.error('Error updating product:', err.response?.data || err.message);
      toast.error(err.response?.data?.error || 'Error updating product. Please try again.');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this product? This action cannot be undone.')) {
      return;
    }
    try {
      const response = await axios.delete(`http://localhost:5000/api/products/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (response.data.success) {
        setProducts(prev => prev.filter(product => product._id !== id));
        toast.success('Product deleted successfully!');
      } else {
        toast.error(response.data.error || 'Failed to delete product.');
      }
    } catch (err) {
      console.error('Error deleting product:', err.response?.data || err.message);
      toast.error(err.response?.data?.error || 'Error deleting product. Please try again.');
    }
  };

  const handleSearch = useCallback((e) => {
    setSearchTerm(e.target.value);
  }, []);

  const filteredProducts = useMemo(() => {
    return products.filter(product =>
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.vendor.toLowerCase().includes(searchTerm.toLowerCase())
    ).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)); // Sort by newest first
  }, [products, searchTerm]);

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <ToastContainer position="bottom-right" autoClose={3000} hideProgressBar={false} newestOnTop={false} closeOnClick rtl={false} pauseOnFocusLoss draggable pauseOnHover />

      <h1 className="text-3xl font-bold text-gray-800 mb-6">Inventory Management</h1>
      <hr className="mb-6 border-gray-300" />

      <div className="flex flex-col sm:flex-row justify-between items-center mb-8 gap-4">
        <div className="relative w-full sm:w-80">
          <input
            type="text"
            placeholder="Search products by name, category, or vendor..."
            value={searchTerm}
            onChange={handleSearch}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-orange-300"
          />
          <FaSearch className="absolute left-3 top-3 text-gray-400 w-4 h-4" />
        </div>
        <button
          onClick={() => { setIsAddModalOpen(true); resetForm(); }}
          className="flex items-center gap-2 px-6 py-2 bg-orange-500 text-white rounded-lg shadow-md hover:bg-orange-600 transition-colors duration-200"
        >
          <FaPlus className="w-4 h-4" />
          Add New Product
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <FaBoxOpen className="animate-pulse text-orange-500 text-5xl" />
          <p className="ml-4 text-lg text-gray-700">Loading inventory...</p>
        </div>
      ) : error ? (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
          <strong className="font-bold">Error!</strong>
          <span className="block sm:inline ml-2">{error}</span>
          <p className="text-sm mt-1">Please check your network connection or backend server status.</p>
        </div>
      ) : filteredProducts.length === 0 ? (
        <div className="text-center py-10 bg-white rounded-lg shadow-md">
          <FaBoxOpen className="text-gray-400 text-6xl mx-auto mb-4" />
          <p className="text-xl text-gray-700">No products found.</p>
          <p className="text-gray-500 mt-2">Try adjusting your search or add a new product!</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredProducts.map((product) => (
            <ProductCard
              key={product._id}
              product={product}
              handleEdit={handleEdit}
              handleDelete={handleDelete}
              lowStockThreshold={10} // Example threshold
            />
          ))}
        </div>
      )}

      {/* Add Product Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onRequestClose={() => { setIsAddModalOpen(false); resetForm(); }}
        className="modal-content p-6 bg-white rounded-xl shadow-2xl max-w-lg mx-auto my-8 relative"
        overlayClassName="modal-overlay fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
      >
        <ProductForm
          onSubmit={handleSubmit}
          title="Add New Product"
          submitText="Add Product"
          formData={formData}
          handleInputChange={handleInputChange}
          handleImageChange={handleImageChange}
          closeModal={() => { setIsAddModalOpen(false); resetForm(); }}
          isEditMode={false}
        />
      </Modal>

      {/* Edit Product Modal */}
      <Modal
        isOpen={isEditModalOpen}
        onRequestClose={() => { setIsEditModalOpen(false); resetForm(); }}
        className="modal-content p-6 bg-white rounded-xl shadow-2xl max-w-lg mx-auto my-8 relative"
        overlayClassName="modal-overlay fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
      >
        <ProductForm
          onSubmit={handleEditSubmit}
          title="Edit Product"
          submitText="Update Product"
          formData={formData}
          handleInputChange={handleInputChange}
          handleImageChange={handleImageChange}
          closeModal={() => { setIsEditModalOpen(false); resetForm(); }}
          isEditMode={true}
        />
      </Modal>
    </div>
  );
};

export default ProductInventory;
import React, { useState, useEffect, useCallback } from 'react';
import { FaSearch, FaPlus } from 'react-icons/fa';
import Modal from 'react-modal';
import axios from 'axios';

Modal.setAppElement('#root');

const ProductForm = React.memo(({ onSubmit, title, submitText, formData, handleInputChange, handleImageChange, closeModal }) => (
  <form onSubmit={onSubmit} className="space-y-4">
    <h2 className="text-center text-xl font-medium">{title}</h2>
    <div className="grid grid-cols-2 gap-4">
      <div>
        <label className="block text-sm">Name</label>
        <input
          type="text"
          name="name"
          value={formData.name}
          onChange={handleInputChange}
          className="w-full p-2 border rounded-lg"
          required
          maxLength={100}
        />
      </div>
      <div>
        <label className="block text-sm">Category</label>
        <input
          type="text"
          name="category"
          value={formData.category}
          onChange={handleInputChange}
          className="w-full p-2 border rounded-lg"
          required
          maxLength={50}
        />
      </div>
      <div className="col-span-2">
        <label className="block text-sm">Description</label>
        <textarea
          name="description"
          value={formData.description}
          onChange={handleInputChange}
          className="w-full p-2 border rounded-lg"
          required
          maxLength={500}
        />
      </div>
      <div>
        <label className="block text-sm">Vendor</label>
        <input
          type="text"
          name="vendor"
          value={formData.vendor}
          onChange={handleInputChange}
          className="w-full p-2 border rounded-lg"
          required
          maxLength={100}
        />
      </div>
      <div>
        <label className="block text-sm">Quantity</label>
        <input
          type="number"
          name="quantity"
          value={formData.quantity}
          onChange={handleInputChange}
          className="w-full p-2 border rounded-lg"
          required
        />
      </div>
      <div>
        <label className="block text-sm">Price</label>
        <input
          type="number"
          name="price"
          value={formData.price}
          onChange={handleInputChange}
          className="w-full p-2 border rounded-lg"
          required
        />
      </div>
      <div>
        <label className="block text-sm">Product Image</label>
        <input
          type="file"
          name="image"
          onChange={handleImageChange}
          className="w-full p-2 border rounded-lg"
        />
      </div>
      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          name="isKG"
          checked={formData.isKG}
          onChange={handleInputChange}
          className="w-5 h-5"
        />
        <label className="text-sm">Is in KG?</label>
      </div>
      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          name="isDozen"
          checked={formData.isDozen}
          onChange={handleInputChange}
          className="w-5 h-5"
        />
        <label className="text-sm">Is in Dozen?</label>
      </div>
    </div>
    <div className="flex justify-center gap-4 mt-6">
      <button
        type="button"
        onClick={closeModal}
        className="px-4 py-2 bg-gray-300 text-black rounded-lg hover:bg-gray-400"
      >
        Cancel
      </button>
      <button
        type="submit"
        className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
      >
        {submitText}
      </button>
    </div>
  </form>
));

const Product = () => {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [products, setProducts] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: '',
    vendor: '',
    quantity: '',
    price: '',
    isKG: false,
    isDozen: false,
    image: null
  });
  const [editProduct, setEditProduct] = useState(null);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/products');
      if (response.data.success) {
        setProducts(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching products:', error);
    }
  };

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

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      category: '',
      vendor: '',
      quantity: '',
      price: '',
      isKG: false,
      isDozen: false,
      image: null
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.name || !formData.description || !formData.category || !formData.vendor || !formData.quantity || !formData.price) {
      alert("Please fill in all required fields.");
      return;
    }

    const formDataToSend = new FormData();
    formDataToSend.append('name', formData.name);
    formDataToSend.append('description', formData.description);
    formDataToSend.append('category', formData.category);
    formDataToSend.append('vendor', formData.vendor);
    formDataToSend.append('quantity', Number(formData.quantity));
    formDataToSend.append('price', Number(formData.price));
    formDataToSend.append('isKG', formData.isKG);
    formDataToSend.append('isDozen', formData.isDozen);
    if (formData.image) {
      formDataToSend.append('image', formData.image);
    }

    try {
      const response = await axios.post('http://localhost:5000/api/products', formDataToSend, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      if (response.data.success) {
        setProducts(prev => [...prev, response.data.data]);
        resetForm();
        setIsAddModalOpen(false);
        alert('Product added successfully!');
      }
    } catch (error) {
      console.error('Error adding product:', error);
      const errorMessage = error.response?.data?.error;
      if (errorMessage) {
        alert(Array.isArray(errorMessage) ? errorMessage.join(', ') : errorMessage);
      } else {
        alert('Error adding product. Please try again.');
      }
    }
  };

  const handleEdit = (product) => {
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
      image: null // Reset image to null for editing
    });
    setIsEditModalOpen(true);
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.name || !formData.description || !formData.category || !formData.vendor || !formData.quantity || !formData.price) {
      alert("Please fill in all required fields.");
      return;
    }

    const formDataToSend = new FormData();
    formDataToSend.append('name', formData.name);
    formDataToSend.append('description', formData.description);
    formDataToSend.append('category', formData.category);
    formDataToSend.append('vendor', formData.vendor);
    formDataToSend.append('quantity', Number(formData.quantity));
    formDataToSend.append('price', Number(formData.price));
    formDataToSend.append('isKG', formData.isKG);
    formDataToSend.append('isDozen', formData.isDozen);
    
    if (formData.image instanceof File) {
      formDataToSend.append('image', formData.image);
    }

    try {
      const response = await axios.put(
        `http://localhost:5000/api/products/${editProduct._id}`,
        formDataToSend,
        {
          headers: {
            'Content-Type': 'multipart/form-data'
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
        alert('Product updated successfully!');
      }
    } catch (error) {
      console.error('Error updating product:', error);
      alert(error.response?.data?.error || 'Error updating product');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this product?')) {
      return;
    }
    
    try {
      const response = await axios.delete(`http://localhost:5000/api/products/${id}`);
      if (response.data.success) {
        setProducts(prev => prev.filter(product => product._id !== id));
        alert('Product deleted successfully!');
      }
    } catch (error) {
      console.error('Error deleting product:', error);
      alert('Error deleting product. Please try again.');
    }
  };

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  const filteredProducts = products.filter(product => 
    product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.vendor.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div className="relative w-64">
          <input
            type="text"
            placeholder="Search"
            value={searchTerm}
            onChange={handleSearch}
            className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-200"
          />
          <FaSearch className="absolute left-3 top-2.5 text-gray-400 w-5 h-5" />
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-orange-400 text-white rounded-lg hover:bg-orange-500"
          >
            <FaPlus className="w-4 h-4" />
            Add product
          </button>
        </div>
      </div>

      <div className="space-y-4">
        {filteredProducts.map((product) => (
          <div key={product._id} className="flex items-center justify-between bg-white p-4 rounded-lg shadow">
            <div className="flex items-center gap-4">
              <img
                src={`http://localhost:5000/${product.image}` || "/api/placeholder/100/100"}
                alt={product.name}
                className="w-16 h-16 rounded-lg object-cover"
              />
              <div>
                <h3 className="font-medium">{product.name}</h3>
                <div className="text-sm text-gray-600">
                  <p>Description: {product.description}</p>
                  <p>Category: {product.category}</p>
                  <p>Vendor: {product.vendor}</p>
                  <p>Quantity: {product.quantity} {product.isKG ? 'KG' : product.isDozen ? 'Dozen' : ''}</p>
                  <p>Price: ${product.price}</p>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="text-center">
                <p className="text-sm text-gray-600">Date recorded</p>
                <p>{new Date(product.createdAt).toLocaleDateString()}</p>
              </div>

              <div className="flex gap-2">
                <button onClick={() => handleEdit(product)} className="px-4 py-1 bg-orange-400 text-white rounded">Edit</button>
                <button onClick={() => handleDelete(product._id)} className="px-4 py-1 bg-red-500 text-white rounded">Delete</button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Add Product Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onRequestClose={() => setIsAddModalOpen(false)}
        className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-full max-w-md bg-white rounded-lg shadow-lg p-6"
        overlayClassName="fixed inset-0 bg-black bg-opacity-50"
      >
        <ProductForm 
          onSubmit={handleSubmit}
          title="Add Product"
          submitText="Add Product"
          formData={formData}
          handleInputChange={handleInputChange}
          handleImageChange={handleImageChange}
          closeModal={() => setIsAddModalOpen(false)}
        />
      </Modal>

      {/* Edit Product Modal */}
      <Modal
        isOpen={isEditModalOpen}
        onRequestClose={() => setIsEditModalOpen(false)}
        className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-full max-w-md bg-white rounded-lg shadow-lg p-6"
        overlayClassName="fixed inset-0 bg-black bg-opacity-50"
      >
        <ProductForm 
          onSubmit={handleEditSubmit}
          title="Edit Product"
          submitText="Update Product"
          formData={formData}
          handleInputChange={handleInputChange}
          handleImageChange={handleImageChange}
          closeModal={() => setIsEditModalOpen(false)}
        />
      </Modal>
    </div>
  );
};

export default Product;
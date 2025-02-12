import React, { useState, useEffect } from 'react'; 
import { FaSearch, FaPlus, FaArrowUp, FaChartLine } from 'react-icons/fa';
import Modal from 'react-modal';
import axios from 'axios';

// Initialize Modal
Modal.setAppElement('#root');

const Product = () => {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [products, setProducts] = useState([]);
  const [formData, setFormData] = useState({
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
    fetchProducts();
  }, []);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleImageChange = (e) => {
    setFormData(prev => ({
      ...prev,
      image: e.target.files[0]
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate form data
    if (!formData.category || !formData.vendor || !formData.quantity || !formData.price) {
      alert("Please fill in all required fields.");
      return;
    }

    const formDataToSend = new FormData();
    formDataToSend.append('category', formData.category);
    formDataToSend.append('vendor', formData.vendor);
    formDataToSend.append('quantity', Number(formData.quantity)); // Convert to number
    formDataToSend.append('price', Number(formData.price)); // Convert to number
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
        setFormData({
          category: '',
          vendor: '',
          quantity: '',
          price: '',
          isKG: false,
          isDozen: false,
          image: null
        });
        setIsAddModalOpen(false);
      }
    } catch (error) {
      console.error('Error adding product:', error);
      if (error.response && error.response.data) {
        alert(error.response.data.error.join(', ')); // Show validation errors
      }
    }
  };

  const handleEdit = (product) => {
    setEditProduct(product);
    setFormData({
      category: product.category,
      vendor: product.vendor,
      quantity: product.quantity,
      price: product.price,
      isKG: product.isKG,
      isDozen: product.isDozen,
      image: null
    });
    setIsEditModalOpen(true);
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    
    // Validate form data
    if (!formData.category || !formData.vendor || !formData.quantity || !formData.price) {
      alert("Please fill in all required fields.");
      return;
    }

    const formDataToSend = new FormData();
    formDataToSend.append('category', formData.category);
    formDataToSend.append('vendor', formData.vendor);
    formDataToSend.append('quantity', Number(formData.quantity)); // Convert to number
    formDataToSend.append('price', Number(formData.price)); // Convert to number
    formDataToSend.append('isKG', formData.isKG);
    formDataToSend.append('isDozen', formData.isDozen);
    if (formData.image) {
      formDataToSend.append('image', formData.image);
    }

    try {
      const response = await axios.put(`http://localhost:5000/api/products/${editProduct._id}`, formDataToSend, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      if (response.data.success) {
        const updatedProducts = products.map((prod) =>
          prod._id === editProduct._id ? response.data.data : prod
        );
        setProducts(updatedProducts);
        setFormData({
          category: '',
          vendor: '',
          quantity: '',
          price: '',
          isKG: false,
          isDozen: false,
          image: null
        });
        setIsEditModalOpen(false);
      }
    } catch (error) {
      console.error('Error updating product:', error);
    }
  };

  const handleDelete = async (id) => {
    try {
      const response = await axios.delete(`http://localhost:5000/api/products/${id}`);
      if (response.data.success) {
        setProducts(prev => prev.filter(product => product._id !== id));
      }
    } catch (error) {
      console.error('Error deleting product:', error);
    }
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div className="relative w-64">
          <input
            type="text"
            placeholder="Search"
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
        {products.map((product) => (
          <div key={product._id} className="flex items-center justify-between bg-white p-4 rounded-lg shadow">
            <div className="flex items-center gap-4">
              <img
                src={product.image || "/api/placeholder/100/100"}
                alt={product.category}
                className="w-16 h-16 rounded-lg object-cover"
              />
              <div>
                <h3 className="font-medium">{product.category}</h3>
                <div className="text-sm text-gray-600">
                  <p>Vendor: {product.vendor}</p>
                  <p>In Stock</p>
                  <p>{product.quantity} {product.isKG ? 'KG' : product.isDozen ? 'Dozen' : ''}</p>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="text-center">
                <p className="text-sm text-gray-600">Date recorded</p>
                <p>{new Date(product.createdAt).toLocaleDateString()}</p>
              </div>

              <div className="text-center">
                <FaChartLine className="w-6 h-6 mx-auto mb-1" />
                <p>{product.salesPerDay} Sales/day</p>
              </div>

              <div>
                <div className="flex items-center gap-1">
                  <FaArrowUp className="w-4 h-4 text-green-500" />
                  <span>{product.revenue} ₹/f</span>
                </div>
                <p className="text-sm text-gray-600">
                  Expected sales: {product.expectedSales} /day
                </p>
              </div>

              <div className="flex gap-2">
                <button className="px-4 py-1 bg-green-500 text-white rounded">View</button>
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
        <form onSubmit={handleSubmit} className="space-y-4">
          <h2 className="text-center text-xl font-medium">Add Product</h2>
          <div>
            <label className="block text-sm">Category</label>
            <input
              type="text"
              name="category"
              value={formData.category}
              onChange={handleInputChange}
              className="w-full p-2 border rounded-lg"
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
            />
          </div>
          <div>
            <label className="block text-sm">Is in KG?</label>
            <input
              type="checkbox"
              name="isKG"
              checked={formData.isKG}
              onChange={handleInputChange}
              className="mr-2"
            />
          </div>
          <div>
            <label className="block text-sm">Is in Dozen?</label>
            <input
              type="checkbox"
              name="isDozen"
              checked={formData.isDozen}
              onChange={handleInputChange}
              className="mr-2"
            />
          </div>
          <div>
            <label className="block text-sm">Product Image</label>
            <input
              type="file"
              onChange={handleImageChange}
              className="w-full p-2 border rounded-lg"
            />
          </div>
          <div className="flex justify-center gap-4 mt-6">
            <button
              type="button"
              onClick={() => setIsAddModalOpen(false)}
              className="px-4 py-2 bg-gray-300 text-white rounded-lg"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-500 text-white rounded-lg"
            >
              Add Product
            </button>
          </div>
        </form>
      </Modal>

      {/* Edit Product Modal */}
      <Modal
        isOpen={isEditModalOpen}
        onRequestClose={() => setIsEditModalOpen(false)}
        className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-full max-w-md bg-white rounded-lg shadow-lg p-6"
        overlayClassName="fixed inset-0 bg-black bg-opacity-50"
      >
        <form onSubmit={handleEditSubmit} className="space-y-4">
          <h2 className="text-center text-xl font-medium">Edit Product</h2>
          <div>
            <label className="block text-sm">Category</label>
            <input
              type="text"
              name="category"
              value={formData.category}
              onChange={handleInputChange}
              className="w-full p-2 border rounded-lg"
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
            />
          </div>
          <div>
            <label className="block text-sm">Is in KG?</label>
            <input
              type="checkbox"
              name="isKG"
              checked={formData.isKG}
              onChange={handleInputChange}
              className="mr-2"
            />
          </div>
          <div>
            <label className="block text-sm">Is in Dozen?</label>
            <input
              type="checkbox"
              name="isDozen"
              checked={formData.isDozen}
              onChange={handleInputChange}
              className="mr-2"
            />
          </div>
          <div>
            <label className="block text-sm">Product Image</label>
            <input
              type="file"
              onChange={handleImageChange}
              className="w-full p-2 border rounded-lg"
            />
          </div>
          <div className="flex justify-center gap-4 mt-6">
            <button
              type="button"
              onClick={() => setIsEditModalOpen(false)}
              className="px-4 py-2 bg-gray-300 text-white rounded-lg"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-500 text-white rounded-lg"
            >
              Edit Product
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Product;

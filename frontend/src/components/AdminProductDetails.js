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
  FaCreditCard,
} from "react-icons/fa";

const AdminProductDetails = () => {
  const [products, setProducts] = useState([]); // State to store all products

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

  // Handle payment button click
  const handlePayment = (productId) => {
    // Placeholder for payment logic
    alert(`Proceeding to payment for product ID: ${productId}`);
    // You can integrate a payment gateway here
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white shadow-lg rounded-lg">
      <h2 className="text-3xl font-bold text-center text-gray-800 mb-6">
        Admin Product Details
      </h2>

      {/* Display Products */}
      <div className="space-y-4">
        {products.map((product) => (
          <div key={product._id} className="p-4 border border-gray-300 rounded-md">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Left Column */}
              <div>
                <div className="flex items-center mb-2">
                  <FaUser className="text-gray-400 mr-2" />
                  <p className="text-gray-700">
                    <span className="font-semibold">Names:</span> {product.names}
                  </p>
                </div>
                <div className="flex items-center mb-2">
                  <FaIdCard className="text-gray-400 mr-2" />
                  <p className="text-gray-700">
                    <span className="font-semibold">ID:</span> {product.id}
                  </p>
                </div>
                <div className="flex items-center mb-2">
                  <FaPhone className="text-gray-400 mr-2" />
                  <p className="text-gray-700">
                    <span className="font-semibold">Phone:</span> {product.phoneNumber}
                  </p>
                </div>
                <div className="flex items-center mb-2">
                  <FaEnvelope className="text-gray-400 mr-2" />
                  <p className="text-gray-700">
                    <span className="font-semibold">Email:</span> {product.email}
                  </p>
                </div>
                <div className="flex items-center mb-2">
                  <FaBuilding className="text-gray-400 mr-2" />
                  <p className="text-gray-700">
                    <span className="font-semibold">Cooperative:</span> {product.cooperativeName}
                  </p>
                </div>
                <div className="flex items-center mb-2">
                  <FaMapMarker className="text-gray-400 mr-2" />
                  <p className="text-gray-700">
                    <span className="font-semibold">Location:</span> {product.location}
                  </p>
                </div>
              </div>

              {/* Right Column */}
              <div>
                <div className="flex items-center mb-2">
                  <FaSeedling className="text-gray-400 mr-2" />
                  <p className="text-gray-700">
                    <span className="font-semibold">Product Type:</span> {product.productType}
                  </p>
                </div>
                <div className="flex items-center mb-2">
                  <FaCalendarAlt className="text-gray-400 mr-2" />
                  <p className="text-gray-700">
                    <span className="font-semibold">Plant Time:</span> {product.plantTime}
                  </p>
                </div>
                <div className="flex items-center mb-2">
                  <FaCalendarAlt className="text-gray-400 mr-2" />
                  <p className="text-gray-700">
                    <span className="font-semibold">Harvest Time:</span> {product.harvestTime}
                  </p>
                </div>
                <div className="flex items-center mb-2">
                  <FaMoneyBill className="text-gray-400 mr-2" />
                  <p className="text-gray-700">
                    <span className="font-semibold">Price Sold At:</span> rwf {product.priceSoldAt}
                  </p>
                </div>
                <div className="flex items-center mb-2">
                  <FaTruck className="text-gray-400 mr-2" />
                  <p className="text-gray-700">
                    <span className="font-semibold">Need Logistic:</span>{" "}
                    {product.needLogistic ? "Yes" : "No"}
                  </p>
                </div>
              </div>
            </div>

            {/* Pay Button */}
            <div className="mt-4 flex justify-end">
              <button
                onClick={() => handlePayment(product._id)}
                className="bg-blue-500 text-white px-4 py-2 rounded-md flex items-center hover:bg-blue-600 transition duration-300"
              >
                <FaCreditCard className="mr-2" />
                Pay
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AdminProductDetails;
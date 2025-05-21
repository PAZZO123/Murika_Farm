import React from 'react';
import { Link } from 'react-router-dom';
import { 
  Building2,
  Users,
  BarChart3,
  Shield,
  ChevronRight,
  UserCog,
  User
} from 'lucide-react';
import Logo from '../Assets/Logo.png'; // Import the logo

const LandingPage = () => {
  const features = [
    {
      icon: <Building2 className="w-8 h-8" />,
      title: "Business Management",
      description: "Comprehensive tools for managing your business operations efficiently"
    },
    {
      icon: <Users className="w-8 h-8" />,
      title: "Team Collaboration",
      description: "Seamless communication and coordination between team members"
    },
    {
      icon: <BarChart3 className="w-8 h-8" />,
      title: "Analytics & Reporting",
      description: "Detailed insights and reports for informed decision-making"
    },
    {
      icon: <Shield className="w-8 h-8" />,
      title: "Secure Platform",
      description: "Enterprise-grade security for your business data"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-green-50">
      {/* Hero Section */}
      <div className="container mx-auto px-4 pt-12"> 
        {/* Logo Container */}
        <div className="flex justify-center mb-8">
          <div className="rounded-full overflow-hidden w-100 h-100 border-4 border-green-100 shadow-lg">
            <img 
              src={Logo} 
              alt="Mulika Logo" 
              className="w-full h-full object-cover"
            />
          </div>
        </div>
        
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-5xl font-bold text-gray-900 mb-6">
           Mulika <span className="text-green-600">MANAGEMENT SYSTEM</span>
          </h1>
          <p className="text-xl text-gray-600 mb-12">
            The Mulika Business Support Management System streamlines internal operations,
            ensuring efficient financial management, project tracking, and seamless communication
            among officers.
          </p>
          
          <div className="flex justify-center space-x-6 mb-20">
            <button className="group flex items-center space-x-2 bg-green-600 text-white py-3 px-8 rounded-lg hover:bg-green-700 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl">
              <UserCog className="w-5 h-5" />
              <span><Link to="/login">Go as Internal staff</Link></span>
              <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
            <button className="group flex items-center space-x-2 bg-white text-green-600 border-2 border-green-600 py-3 px-8 rounded-lg hover:bg-green-50 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl">
              <User className="w-5 h-5" />
              <span><Link to="/signup">Go as Client</Link></span>
              <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </div>

        {/* Features Section */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-20">
          {features.map((feature, index) => (
            <div 
              key={index} 
              className="group bg-white rounded-xl p-6 shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
            >
              <div className="text-green-600 mb-4 group-hover:scale-110 transition-transform duration-300">
                {feature.icon}
              </div>
              <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
              <p className="text-gray-600">{feature.description}</p>
            </div>
          ))}
        </div>

        {/* Stats Section */}
        <div className="bg-green-600 text-white rounded-2xl p-12 mb-20 shadow-lg">
          <div className="grid md:grid-cols-3 gap-8 text-center">
            <div className="group hover:transform hover:scale-105 transition-all duration-300">
              <div className="text-4xl font-bold mb-2">500+</div>
              <div className="text-green-100">Active Users</div>
            </div>
            <div className="group hover:transform hover:scale-105 transition-all duration-300">
              <div className="text-4xl font-bold mb-2">98%</div>
              <div className="text-green-100">Customer Satisfaction</div>
            </div>
            <div className="group hover:transform hover:scale-105 transition-all duration-300">
              <div className="text-4xl font-bold mb-2">24/7</div>
              <div className="text-green-100">Support Available</div>
            </div>
          </div>
        </div>

        {/* Footer/Contact Section */}
        <div className="text-center pb-20">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Ready to Get Started?</h2>
          <p className="text-gray-600 mb-8">Join thousands of businesses already using our platform</p>
          <button className="group bg-green-600 text-white py-3 px-8 rounded-lg hover:bg-green-700 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl flex items-center space-x-2 mx-auto">
            <span>Contact Us</span>
            <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default LandingPage;
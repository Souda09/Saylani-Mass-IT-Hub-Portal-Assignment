import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FaSearch, FaExclamationCircle, FaHandsHelping, FaUserCircle } from 'react-icons/fa';

const Home = () => {
  const navigate = useNavigate();

  // --- Content for Cards (English) ---
  const features = [
    {
      title: 'Lost & Found',
      description: 'Misplaced a personal item or found something on campus? Report it here to help reunite items with their rightful owners.',
      icon: <FaSearch className="text-5xl text-[#0057a8]" />,
      path: '/lost-found',
      color: 'border-blue-500'
    },
    {
      title: 'Complaints',
      description: 'Report campus issues regarding Internet, Electricity, Water, or Maintenance directly to the support team for quick resolution.',
      icon: <FaExclamationCircle className="text-5xl text-[#66b032]" />,
      path: '/complaints',
      color: 'border-green-500'
    },
    {
      title: 'Volunteer',
      description: 'Join the volunteer team to help manage campus events, support operations, and earn community service hours.',
      icon: <FaHandsHelping className="text-5xl text-orange-500" />,
      path: '/volunter',
      color: 'border-orange-500'
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50/50">
      {/* --- Updated Hero Section --- */}
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-6 py-20 text-center">
          <div className="inline-flex items-center gap-2 bg-blue-50 text-[#0057a8] px-4 py-2 rounded-full text-sm font-semibold mb-4">
            <FaUserCircle /> Student Portal
          </div>
          <h1 className="text-5xl md:text-6xl font-black text-gray-950 uppercase leading-tight">
            Welcome to <span className="text-[#0057a8]">Saylani</span> <br />
            <span className="text-[#66b032]">Campus Support</span>
          </h1>
          <p className="text-gray-600 mt-6 text-lg max-w-2xl mx-auto leading-relaxed">
            This portal is designed to streamline your campus experience. Submit issues, track their status, and engage with campus activities seamlessly.
          </p>
        </div>
      </div>

      {/* --- Cards Grid Section --- */}
      <div className="max-w-7xl mx-auto px-6 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
          {features.map((feature, index) => (
            <div 
              key={index}
              onClick={() => navigate(feature.path)}
              className={`bg-white p-10 rounded-[2.5rem] shadow-sm hover:shadow-2xl transition-all cursor-pointer border-t-8 ${feature.color} flex flex-col items-center text-center group`}
            >
              {/* Icon Wrapper */}
              <div className="bg-gray-100 p-6 rounded-full mb-8 group-hover:scale-110 transition-transform">
                {feature.icon}
              </div>

              {/* Content */}
              <h3 className="text-2xl font-bold text-gray-950 mb-4">{feature.title}</h3>
              <p className="text-gray-600 text-sm flex-grow leading-relaxed">{feature.description}</p>
              
              {/* CTA Button */}
              <button className="mt-10 w-full bg-gray-900 text-white py-4 rounded-full text-sm font-bold group-hover:bg-[#0057a8] transition-colors">
                Open Section
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Home;
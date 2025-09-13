import React from 'react';
import { FaWhatsapp } from 'react-icons/fa'; // Importing the WhatsApp icon

const WhatsAppFloatingButton = () => {
  const openWhatsApp = () => {
    const phoneNumber = "9633214514"; // Replace with your WhatsApp number
    const message = encodeURIComponent("Hello! I would like to know more about your services.");
    const url = `https://wa.me/${phoneNumber}?text=${message}`;
    window.open(url, "_blank");
  };

  return (
    <div className="fixed bottom-8 right-6 z-50">
      <button
        onClick={openWhatsApp}
        className="bg-green-500 hover:bg-green-600 text-white p-3 rounded-full shadow-lg flex items-center justify-center space-x-2"
        aria-label="WhatsApp Chat"
      >
        <FaWhatsapp className="w-6 h-6" />
        <span className="hidden sm:inline">WhatsApp</span> {/* Hide "WhatsApp" text on small screens */}
      </button>
    </div>
  );
};

export default WhatsAppFloatingButton;

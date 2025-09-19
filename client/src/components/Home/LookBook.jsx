import React, { useState, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import model1 from '../../assets/lookbook/lkbk1.jpeg'
import model2 from '../../assets/lookbook/lkbk2.jpeg'
import model3 from '../../assets/lookbook/lkbk3.jpeg'
import model4 from '../../assets/lookbook/lkbk4.jpeg'
import model7 from '../../assets/lookbook/lkbk7.jpeg'
import model8 from '../../assets/lookbook/lkbk8.jpeg'
import model9 from '../../assets/lookbook/lkbk9.jpeg'
import model10 from '../../assets/lookbook/lkbk10.jpeg'
import aboutImg from '../../assets/about.png';

import whatsappIcon from '../../assets/whats.svg'
import instagramIcon from '../../assets/insta.svg'

// Social Icon Component with outer/inner boundary design - matching reference colors
const SocialIcon = ({ type, size = "w-10 h-10", onClick, className = "" }) => {
  const InstagramPath = "M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z";
  
  const WhatsAppPath = "M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.570-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.890-5.335 11.893-11.893A11.821 11.821 0 0020.486 3.488";

  return (
    <div 
      className={`${size} border-2 border-gray-900 border-opacity-95 bg-transparent rounded-full flex items-center justify-center p-1 transition-all duration-300 cursor-pointer shadow-lg backdrop-blur-sm ${className}`}
      onClick={onClick}
    >
      {/* Inner Circle */}
      <div className="w-full h-full bg-gray-900 bg-opacity-60 rounded-full flex items-center justify-center text-white hover:bg-opacity-80 transition-all duration-300">
        <svg viewBox="0 0 24 24" className="w-5 h-5" fill="currentColor">
          <path d={type === 'instagram' ? InstagramPath : WhatsAppPath} />
        </svg>
      </div>
    </div>
  );
};

// Array of all lookbook images for the carousel
const lookbookImages = [
  model1,
  model2,
  model3,
  model4,
  model7,
  model8,
  model9,
  model10
]

const AboutSection = () => {
  const handleWhatsAppClick = () => {
    const phoneNumber = '9633214514';
    const message = encodeURIComponent('Hi! I saw your lookbook and I\'m interested in your designs.');
    const whatsappUrl = `https://wa.me/${phoneNumber}?text=${message}`;
    window.open(whatsappUrl, '_blank');
  };

  const handleInstagramClick = () => {
    window.open('https://www.instagram.com/sagey.in/', '_blank');
  };

  return (
    <section id="about-us"className="w-full flex flex-col md:flex-row min-h-screen bg-primary">
      
      {/* Left Column: Image with Light Background */}
      <div className="w-full md:w-5/12 bg-gray-100 flex flex-col justify-center items-start p-8 md:p-12 lg:p-16">
        <h2 className="text-3xl font-semibold text-[#2A5F62] uppercase tracking-widest mb-8">
          ABOUT US
        </h2>
        <img
          src={aboutImg}
          alt="About Sagey"
          className="w-full max-w-md h-auto object-cover"
        />
      </div>

      {/* Right Column: Text Content with Dark Background */}
      <div className="w-full md:w-7/12 bg-primary text-white flex flex-col justify-center p-8 md:p-12 lg:p-16">
        <h2 className="text-3xl md:text-4xl mb-6 font-sans font-bold leading-tight">
          EMPOWERING EVERY WOMAN, ONE OUTFIT AT A TIME
        </h2>
        <div className="text-base md:text-lg leading-relaxed text-white/90 font-sans space-y-6">
          <p>
            Welcome to <strong>Sagey</strong>, your destination for curated women's fashion that blends comfort,
            confidence, and everyday style. Whether you're dressing for work, the weekend, or a night out
            we've got you covered with versatile pieces designed to fit your mood and movement.
          </p>
          <p>
            Born from a love for self-expression through clothing, we aim to make fashion inclusive,
            effortless, and fun. From minimal staples to bold statement wear, our collections are inspired by
            real women and real lives.
          </p>
          <p>
            Thank you for being a part of our journey. Let's make every outfit count.
          </p>
          <p>
            Stay Stylish,
            <br />
            <strong>Team Sagey.</strong>
          </p>
        </div>

        {/* Updated Social Icons with outer/inner boundary design */}
        <div className="flex gap-4 mt-10">
          <SocialIcon 
            type="whatsapp" 
            size="w-10 h-10"
            onClick={handleWhatsAppClick}
            className="hover:scale-110 transform transition-transform duration-200"
          />
          <SocialIcon 
            type="instagram" 
            size="w-10 h-10"
            onClick={handleInstagramClick}
            className="hover:scale-110 transform transition-transform duration-200"
          />
        </div>
      </div>
    </section>
  )
}

const LookBook = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const imagesPerRow = 4;
  
  // Auto-slide functionality
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => 
        (prevIndex + 1) % lookbookImages.length
      );
    }, 3000); // Slide every 3 seconds

    return () => clearInterval(interval);
  }, []);

  // Get 4 images to display in current row
  const getDisplayedImages = () => {
    const displayed = [];
    for (let i = 0; i < imagesPerRow; i++) {
      const imageIndex = (currentIndex + i) % lookbookImages.length;
      displayed.push({
        src: lookbookImages[imageIndex],
        index: imageIndex
      });
    }
    return displayed;
  };

  const displayedImages = getDisplayedImages();

  return (
    <div className="w-full bg-primary pb-12">
      {/* About Section */}
      <AboutSection />      
      
      {/* Lookbook Carousel Section */}
      <div className="mt-16">
        <h2 className="text-3xl md:text-4xl text-[#065c63] mb-8 text-white text-center">CHECK OUR LOOK-BOOK</h2>
        
        {/* Carousel Container */}
        <div className="overflow-hidden">
          <div className="flex transition-transform duration-500 ease-in-out">
            {displayedImages.map((item, index) => (
              <div 
                key={`${item.index}-${index}`}
                className="flex-shrink-0 w-full sm:w-1/2 md:w-1/4 relative h-[500px] overflow-hidden"
              >
                <img
                  src={item.src}
                  alt={`Look ${item.index + 1}`}
                  className="object-cover w-full h-full transition-transform duration-500 hover:scale-105"
                />
              </div>
            ))}
          </div>
        </div>
        
        {/* Slide Indicators */}
        <div className="flex justify-center mt-6 space-x-2">
          {lookbookImages.map((_, index) => (
            <button
              key={index}
              className={`w-2 h-2 rounded-full transition-all duration-300 ${
                index === currentIndex 
                  ? 'bg-white scale-125' 
                  : 'bg-white/50 hover:bg-white/75'
              }`}
              onClick={() => setCurrentIndex(index)}
            />
          ))}
        </div>
      </div>
    </div>
  )
}

export default LookBook

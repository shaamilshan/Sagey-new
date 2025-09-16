import React from 'react';
import wholesale from "client/src/assets/wholesale.png";

function Footer() {
  return (
    <>
    {/* === WHOLESALE CTA BANNER START === */}
<div className="bg-primary px-4 sm:px-6 py-10">
  <div className="max-w-6xl mx-auto">
    <div className="bg-white py-6 px-4 sm:px-6 md:px-10 flex flex-col md:flex-row items-center md:items-centre justify-between shadow-md rounded-md md:rounded-xl w-full">
      
      {/* Left: Image */}
      <div className="w-full md:w-1/2 flex justify-center">
        <img
          src={wholesale}
          alt="Wholesale"
          className="max-w-[90%] md:max-w-[95%] object-contain"
        />
      </div>

      {/* Right: Text and Button */}
      <div className="w-full md:w-1/2 text-center md:text-left space-y-3">
        <p className="text-xl font-medium text-gray-800">Interested in</p>
        <h2 className="text-3xl font-bold text-teal-700">Wholesale?</h2>
        <button
          onClick={() =>
            window.open(
              'https://wa.me/919400740061?text=Hi%2C%20I%20am%20interested%20in%20wholesale%20opportunities.',
              '_blank'
            )
          }
          className="bg-teal-600 hover:bg-teal-700 text-white px-6 py-3 rounded-full shadow-md transition-all"
        >
          Click here to learn more
        </button>
      </div>
    </div>
  </div>
</div>
{/* === WHOLESALE CTA BANNER END === */}



      <footer className="bg-primary py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="ml-8 grid grid-cols-2 md:grid-cols-4 gap-6 w-full text-white">
            <div>
              <h4 className="text-lg  font-bold mb-4">SHOP</h4>
              <ul className="space-y-2">
                <li>
                  <a href="/collections?search=top" className="hover:text-gray-400 transition-colors">TOP</a>
                </li>
                <li>
                  <a href="/collections?search=gown" className="hover:text-gray-400 transition-colors">GOWN</a>
                </li>
                <li>
                  <a href="/collections?search=romper" className="hover:text-gray-400 transition-colors">ROMPER</a>
                </li>
                <li>
                  <a href="/collections?search=knee length" className="hover:text-gray-400 transition-colors">KNEE LENGTH</a>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="text-lg font-bold mb-4">QUICK LINKS</h4>
              <ul className="space-y-2">
                <li>
                  <a href="/about-us" className="hover:text-gray-400 transition-colors">ABOUT US</a>
                </li>
                <li>
                  <a href="https://maps.app.goo.gl/fotcAexeYhcCYwMMA" className="hover:text-gray-400 transition-colors">LOCATION</a>
                </li>
                <li>
                  <a href="/" className="hover:text-gray-400 transition-colors">BLOG</a>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="text-lg font-bold mb-4">SUPPORT</h4>
              <ul className="space-y-2">
                <li>
                  <a href="https://merchant.razorpay.com/policy/PRQK3TlSD5UcOp/contact_us" className="hover:text-gray-400 transition-colors">CONTACT US</a>
                </li>
                <li>
                  <a href="https://merchant.razorpay.com/policy/PRQK3TlSD5UcOp/shipping" className="hover:text-gray-400 transition-colors">SHIPPING POLICY</a>
                </li>
                <li>
                  <a href="https://merchant.razorpay.com/policy/PRQK3TlSD5UcOp/refund" className="hover:text-gray-400 transition-colors">REFUND AND CANCELLATION</a>
                </li>
                <li>
                  <a href="https://merchant.razorpay.com/policy/PRQK3TlSD5UcOp/privacy" className="hover:text-gray-400 transition-colors">PRIVACY POLICY</a>
                </li>
                <li>
                  <a href="https://merchant.razorpay.com/policy/PRQK3TlSD5UcOp/terms" className="hover:text-gray-400 transition-colors">TERMS AND CONDITIONS</a>
                </li>
              </ul>
            </div>

            <div className="mb-6 md:mb-0 md:pl-4">
              <h4 className="text-lg font-bold mb-4">SAGEY</h4>
              <p className="text-sm lg:text-md py-1 break-words">
                15/538-D<br />
                SPACEQURE BULDING <br />
                KARUTHAPARAMBA<br />
                KARASSERY POST<br />
                MUKKAM<br />
                KOZHIKODE<br />
                KERALA 673602
              </p>
            </div>
          </div>
        </div>
        <div className="mt-8 text-center text-sm text-white">
          <p>&copy; 2024 Sagey. All rights reserved</p>
        </div>
      </footer>
    </>
  );
}

export default Footer;
